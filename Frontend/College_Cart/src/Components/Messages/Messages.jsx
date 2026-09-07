import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import Header from '../Header/Header';
import "./messages.css";
import axios from 'axios';
import { UserDataContext } from '../Header/context';
import { getToken } from '../../util/tokenService';
import { io } from "socket.io-client";
import Skeleton from '../ui/Skeleton';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const toThread = (rows, userId) =>
  (rows ?? []).map((msg) => ({
    message: msg.message,
    sender: msg.senderId === userId ? 'self' : 'other',
    timestamp: msg.createdAt,
  }));

/**
 * Conversation list built in the browser, used only when the API does not yet
 * expose GET /conversations.
 *
 * This is what the page used to do unconditionally, and it was the reason
 * opening Messages took so long: a `for` loop that awaited three requests per
 * room, one after another - 1 + 3N sequential round trips. The requests are the
 * same here, but every room resolves concurrently and the three lookups inside
 * a room are concurrent too, so the whole list costs about one round trip
 * rather than dozens in series.
 */
const loadConversationsLegacy = async (backendUrl, userId, config) => {
  const { data: rooms } = await axios.get(`${backendUrl}/joinRooms`, config);

  const relevant = (rooms ?? []).filter(
    (room) => room.users?.includes(userId) && room.users.length >= 3
  );

  const settled = await Promise.all(
    relevant.map(async (room) => {
      try {
        const isInitiator = room.users[0] === userId;
        const otherUserId = isInitiator ? room.users[1] : room.users[0];

        const [productRes, messagesRes, userRes] = await Promise.all([
          axios.get(`${backendUrl}/${room.users[2]}/product`, config),
          axios.get(`${backendUrl}/message/${room._id}`, config),
          axios.get(`${backendUrl}/user/${otherUserId}`, config),
        ]);

        const rows = messagesRes.data ?? [];
        if (rows.length === 0) return null;

        const last = rows[rows.length - 1];

        return {
          roomId: room._id,
          product: productRes.data.product,
          lastMessage: last.message,
          otherUserId,
          otherUserName: userRes.data.name || (isInitiator ? "Recipient" : "Sender"),
          otherUserAvatar: userRes.data.profileImage || DEFAULT_AVATAR,
          timestamp: last.createdAt ?? room.updatedAt ?? room.createdAt,
          unread: 0,
          // The history is already in hand on this path, so hand it to the
          // cache and clicking the conversation costs nothing.
          thread: toThread(rows, userId),
        };
      } catch {
        return null;
      }
    })
  );

  return settled
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const Messages = () => {
  const navigate = useNavigate();
  const backend_url = import.meta.env.VITE_BACKEND_API_URL;
  const socket_url = import.meta.env.VITE_SOCKET_URL;
  const { data } = useContext(UserDataContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const userId = data?._id;

  // Threads already fetched this visit, keyed by room. Re-opening a
  // conversation used to refetch the entire history and leave the pane blank
  // until it arrived; now it paints from here and revalidates behind that.
  const threadCacheRef = useRef(new Map());
  // Which room is on screen right now, read inside async callbacks. State
  // would be stale there, and a slow response for a conversation the user has
  // already navigated away from must not overwrite the visible thread.
  const activeRoomRef = useRef(null);

  // Socket initialization - runs once
  useEffect(() => {
    if (!userId) return;

    const socket = io(socket_url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("connect_error", () => setSocketConnected(false));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("receive_message", (socketData) => {
      if (!socketData?.message) return;

      const roomId = socketData.joinRoomId;

      if (socketData.senderId !== userId) {
        const incoming = {
          message: socketData.message.text,
          sender: 'other',
          timestamp: new Date().toISOString(),
        };

        // Append to the cached thread for whichever room the message belongs
        // to. This used to push every arrival into the open conversation
        // regardless of its room, so a message from one chat appeared inside
        // another.
        const cached = threadCacheRef.current.get(roomId);
        if (cached) threadCacheRef.current.set(roomId, [...cached, incoming]);

        if (roomId && roomId === activeRoomRef.current) {
          setMessages((prev) => [...prev, incoming]);
        }
      }

      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.roomId === roomId);
        if (index === -1) return prev;

        const next = [...prev];
        next[index] = {
          ...next[index],
          lastMessage: socketData.message.text,
          timestamp: new Date().toISOString(),
        };
        next.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, socket_url]);

  // Join room when conversation is selected
  useEffect(() => {
    if (socketRef.current && socketConnected && selectedConversation) {
      socketRef.current.emit("join_room", { joinRoomId: selectedConversation.roomId });
    }
  }, [selectedConversation, socketConnected]);

  // Conversation list. One request against /conversations, which joins the
  // rooms, the last message of each, the products and the other participants
  // server-side; see Backend/Controllers/conversation.js.
  useEffect(() => {
    const token = getToken();
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const config = {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    };

    const seedCache = (list) => {
      list.forEach((conv) => {
        if (conv.thread) threadCacheRef.current.set(conv.roomId, conv.thread);
      });
    };

    const load = async () => {
      setLoading(true);
      try {
        const { data: payload } = await axios.get(`${backend_url}/conversations`, config);
        if (cancelled) return;
        setConversations(payload.conversations ?? []);
      } catch (error) {
        if (cancelled || axios.isCancel(error) || controller.signal.aborted) return;

        // An API instance that has not picked up the new endpoint yet answers
        // 404 (or 401 if the session is stale). Only the missing-endpoint case
        // is worth rebuilding the list in the browser for.
        if (error.response?.status === 404) {
          try {
            const legacy = await loadConversationsLegacy(backend_url, userId, config);
            if (cancelled) return;
            seedCache(legacy);
            setConversations(legacy);
          } catch (fallbackError) {
            if (!cancelled) console.error("Error fetching conversations:", fallbackError);
          }
        } else {
          console.error("Error fetching conversations:", error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [backend_url, userId]);

  const selectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    activeRoomRef.current = conversation.roomId;

    const cached = threadCacheRef.current.get(conversation.roomId);
    setMessages(cached ?? []);
    setThreadLoading(!cached);

    try {
      const token = getToken();
      const { data: rows } = await axios.get(`${backend_url}/message/${conversation.roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const thread = toThread(rows, userId);
      threadCacheRef.current.set(conversation.roomId, thread);

      if (activeRoomRef.current === conversation.roomId) setMessages(thread);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (activeRoomRef.current === conversation.roomId && !cached) setMessages([]);
    } finally {
      if (activeRoomRef.current === conversation.roomId) setThreadLoading(false);
    }
  }, [backend_url, userId]);

  // Keep the cache in step with what is rendered, so optimistic sends and
  // socket arrivals survive switching conversations and switching back.
  useEffect(() => {
    const roomId = selectedConversation?.roomId;
    if (roomId && messages.length) threadCacheRef.current.set(roomId, messages);
  }, [messages, selectedConversation]);

  const navigateToProduct = (productId) => {
    if (productId) {
      navigate(`/${productId}/product`);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || !userId) return;

    const messageText = inputMessage.trim();
    const timestamp = new Date().toISOString();
    const newMessage = {
      message: messageText,
      sender: 'self',
      timestamp
    };

    // Update UI immediately (optimistic update)
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Update conversation list
    setConversations((prev) => {
      const updatedConversations = [...prev];
      const convoIndex = updatedConversations.findIndex(
        (conv) => conv.roomId === selectedConversation.roomId
      );
      if (convoIndex !== -1) {
        updatedConversations[convoIndex] = {
          ...updatedConversations[convoIndex],
          lastMessage: messageText,
          timestamp,
        };
        updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      return updatedConversations;
    });

    // Send via socket for real-time delivery
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("send_message", {
        joinRoomId: selectedConversation.roomId,
        message: { text: messageText },
        senderId: userId,
      });
    }

    // Save to database
    try {
      const token = getToken();
      await axios.post(`${backend_url}/message`, {
        senderId: userId,
        receiverId: selectedConversation.otherUserId,
        message: messageText,
        roomId: selectedConversation.roomId,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // onKeyPress is deprecated and does not fire for every key in every browser.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format timestamp
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffTime = Math.abs(now - messageTime);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header showSearch={false} showMiddleHeader={true} isProductsPage={false}/>
        <div className="header">
          <div className="messages-container">
            <div className="conversation-list">
              <h2 className="conversations-title">Chat</h2>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                <div key={i} className="conversation-item-skeleton">
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }}
                  />
                  <div className="conversation-details">
                    <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }} />
                    <Skeleton variant="text" width={180} height={16} sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="message-area">
              <div className="message-header">
                <Skeleton variant="text" width={200} height={28} sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)' }} />
              </div>
              <div className="messages-display">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((i) => (
                  <div key={i} className={`message-group ${i % 2 === 0 ? 'self' : 'other'}`}>
                    <div className="message-content-wrapper">
                      <div className={`message-bubble-skeleton ${i % 2 === 0 ? 'self' : 'other'}`}>
                        <Skeleton
                          variant="rectangular"
                          width={i % 2 === 0 ? 180 : 140}
                          height={30}
                          sx={{
                            bgcolor: i % 2 === 0 ? 'rgba(26, 115, 232, 0.5)' : 'rgba(210, 215, 211, 1)',
                            borderRadius: '16px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="message-input-area">
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: 'rgba(0, 0, 0, 0.08)', borderRadius: '24px' }} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} showMiddleHeader={true} isProductsPage={false}/>
      <div className="header">
        <div className="messages-container">
          <div className="conversation-list">
            <h2 className="conversations-title">Chat</h2>
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations found</p>
                <p className="empty-state-message">Messages related to your products will appear here</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.roomId}
                  className={`conversation-item ${selectedConversation?.roomId === conversation.roomId ? 'active' : ''}`}
                  onClick={() => selectConversation(conversation)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectConversation(conversation);
                    }
                  }}
                >
                  <div className="conversation-avatar">
                    <img
                      src={conversation.product?.image || DEFAULT_AVATAR}
                      alt="Product"
                      className="product-thumbnail"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <h3 className="conversation-name">{conversation.otherUserName}</h3>
                      <span className="conversation-time">
                        {formatRelativeTime(conversation.timestamp)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p className="product-name">{conversation.product?.name}</p>
                      <p className="last-message">
                        {(conversation.lastMessage ?? '').substring(0, 30)}
                        {(conversation.lastMessage ?? '').length > 30 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="message-area">
            {!selectedConversation ? (
              <div className="no-conversation-selected">
                <div className="empty-state-icon">💬</div>
                <h3>Select a conversation to start messaging</h3>
                <p>Chat with buyers and sellers about products</p>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <div className="message-header-avatar">
                    <img
                      src={selectedConversation.otherUserAvatar}
                      alt={selectedConversation.otherUserName}
                      className="header-user-avatar"
                    />
                  </div>
                  <div className="message-header-details">
                    <h2>{selectedConversation.otherUserName}</h2>
                    <p className="product-link" onClick={() => navigateToProduct(selectedConversation.product?._id)}>
                      Product: {selectedConversation.product?.name}
                    </p>
                  </div>
                  <div className="product-price">
                    <span>&#8377;{selectedConversation.product?.newAmount || selectedConversation.product?.price}</span>
                  </div>
                </div>

                <div className="messages-display">
                  {threadLoading && messages.length === 0 ? (
                    // A thread being fetched for the first time. The pane used
                    // to show the "no messages yet" empty state while the
                    // request was still in flight.
                    <div className="thread-loading" aria-live="polite">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`message-group ${i % 2 === 0 ? 'self' : 'other'}`}>
                          <div className="message-content-wrapper">
                            <div className={`message-bubble-skeleton ${i % 2 === 0 ? 'self' : 'other'}`}>
                              <Skeleton
                                variant="rectangular"
                                width={i % 2 === 0 ? 180 : 140}
                                height={30}
                                sx={{
                                  bgcolor: i % 2 === 0 ? 'rgba(26, 115, 232, 0.5)' : 'rgba(210, 215, 211, 1)',
                                  borderRadius: '16px',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="no-messages">
                      <div className="empty-chat-icon">📩</div>
                      <p>No messages yet</p>
                      <p className="start-chat-prompt">Start the conversation about "{selectedConversation.product?.name}"</p>
                    </div>
                  ) : (
                    <>
                      <div className="chat-date-header">
                        <span>{new Date().toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}</span>
                      </div>
                      {messages.map((msg, index) => {
                        const isFirstMessageOrDifferentSender = index === 0 || messages[index - 1].sender !== msg.sender;

                        return (
                          <div
                            key={index}
                            className={`message-group ${msg.sender === 'self' ? 'self' : 'other'} ${isFirstMessageOrDifferentSender ? 'with-avatar' : ''}`}
                          >
                            {msg.sender === 'other' && isFirstMessageOrDifferentSender && (
                              <div className="message-avatar">
                                <img
                                  src={selectedConversation.otherUserAvatar}
                                  alt={selectedConversation.otherUserName}
                                  className="message-user-avatar"
                                />
                              </div>
                            )}
                            <div className="message-content-wrapper">
                              {isFirstMessageOrDifferentSender && msg.sender === 'other' && (
                                <div className="message-sender-name">{selectedConversation.otherUserName}</div>
                              )}
                              <div className={`message-bubble ${msg.sender}`}>
                                <div className="message-text">{msg.message}</div>
                                <div className="message-time">
                                  {msg.timestamp ? formatRelativeTime(msg.timestamp) : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-input-area">
                  {!socketConnected && (
                    <div className="connection-status-warning">
                      Reconnecting...
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="message-input"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-button"
                    disabled={!inputMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
