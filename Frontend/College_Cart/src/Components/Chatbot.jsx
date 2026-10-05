import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Trash2, Loader2, ShoppingCart, User, Phone, MapPin, Tag, AlertCircle } from 'lucide-react';

const backend_url = import.meta.env.VITE_BACKEND_API_URL;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([
  { 
    text: "Hi! I'm College Cart Agent 👋\n\nI can help you with product information and details. Try asking:\n• \"Is laptop available?\"\n• \"Show complete iPhone details\"\n• \"What is the price of headphones?\"",
    sender: 'bot',
    type: 'text'
  }
]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input.trim(), sender: 'user', type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending request to:', `${backend_url}/chat`);
      console.log('Request body:', { question: currentInput });

      const response = await fetch(`${backend_url}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: currentInput
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Backend returned invalid response. Please check server logs.');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }

      if (data.success) {
        if (data.isStructured && data.response?.type === 'product_card') {
          setMessages(prev => [...prev, { 
            sender: 'bot',
            type: 'product_card',
            products: data.response.products || []
          }]);
        } else {
          const responseText = typeof data.response === 'string' 
            ? data.response 
            : JSON.stringify(data.response);
            
          setMessages(prev => [...prev, { 
            text: responseText, 
            sender: 'bot',
            type: 'text'
          }]);
        }
      } else {
        throw new Error('No response received from agent');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      
      let errorMessage = '⚠️ Something went wrong\n\n';

      if (error.message.includes('fetch')) {
        errorMessage += 'Cannot connect to server. Please:\n• Check your internet connection\n• Verify backend URL\n• Ensure the server is running';
      } else if (error.message.includes('JSON')) {
        errorMessage += 'Backend response format is invalid. Please check server logs.';
      } else {
        errorMessage += error.message;
      }

      
      setMessages(prev => [...prev, 
        { 
          text: errorMessage, 
          sender: 'bot',
          type: 'text',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClearHistory = () => {
      setMessages([
      { 
        text: "Hi! I'm College Cart Agent 👋\n\nI can help you with product information and details. Try asking:\n• \"Is laptop available?\"\n• \"Show complete iPhone details\"\n• \"What is the price of headphones?\"",
        sender: 'bot',
        type: 'text'
      }
    ]);

  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const QuickActions = () => (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
            {[
        "Show laptop details",
        "Is iPhone available?",
        "What is the price of headphones?"
      ].map((action, idx) => (
        <button
          key={idx}
          onClick={() => setInput(action)}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
        >
          {action}
        </button>
      ))}

    </div>
  );

  const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const discountPercentage = product.prevAmount && product.newAmount 
      ? Math.round(((product.prevAmount - product.newAmount) / product.prevAmount) * 100)
      : 0;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 mb-3 max-w-[340px]">
        <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden group">
          {product.image && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
              <img 
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-2" />
              <span className="text-xs text-gray-400">No Image</span>
            </div>
          )}
          
          {product.newAmount && (
            <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              ₹{product.newAmount.toLocaleString()}
            </div>
          )}

          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {discountPercentage}% OFF
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
            <div className="flex items-center justify-between flex-wrap gap-2">
              {product.brand && (
                <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          {product.prevAmount && product.prevAmount !== product.newAmount && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                ₹{product.prevAmount.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-semibold">
                Save ₹{(product.prevAmount - product.newAmount).toLocaleString()}
              </span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {product.description}
            </p>
          )}

          <div className="border-t border-gray-200 pt-3 space-y-2">
            {product.hostleName && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">
                    {product.hostleName}
                  </div>
                  {product.roomNumber && (
                    <div className="text-gray-600 text-xs">
                      Room: {product.roomNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.dayScholarContectNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a 
                  href={`tel:${product.dayScholarContectNumber}`} 
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.dayScholarContectNumber}
                </a>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              if (product.dayScholarContectNumber) {
                window.location.href = `tel:${product.dayScholarContectNumber}`;
              }
            }}
            className="w-full mt-4 py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-lg"
          >
            Contact Seller
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 grid place-items-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Open chat"
        >
          <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <div className="fixed z-50 inset-x-3 bottom-3 h-[min(520px,calc(100dvh-6rem))] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[min(650px,calc(100dvh-3rem))] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slideUp">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-3.5 sm:p-5 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold text-sm sm:text-lg flex-shrink-0">
                  CC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-gray-900"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">College Cart Agent</h3>
                <p className="text-[10px] sm:text-xs text-gray-300">Online • AI Assistant</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={handleClearHistory}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === 'product_card' ? (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="space-y-3 max-w-full">
                      {message.products?.map((product, idx) => (
                        <ProductCard key={product._id || idx} product={product} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div 
                      className={`max-w-[85%] group ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl rounded-br-md' 
                          : message.isError 
                            ? 'bg-red-50 text-red-800 border border-red-200 rounded-3xl rounded-bl-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-3xl rounded-bl-md shadow-sm'
                      } px-4 py-3`}
                    >
                      {message.isError && (
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold text-xs">Error</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                        {message.text}
                      </p>
                      <span className={`text-[10px] mt-1 block ${
                        message.sender === 'user' ? 'text-gray-300' : message.isError ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {new Date().toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-3xl rounded-bl-md shadow-sm">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && !isLoading && <QuickActions />}

          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Products ke bare mein puchiye..."
                disabled={isLoading}
                className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 text-sm transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white w-12 h-12 rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Powered by Gemini AI • Press Enter to send
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </>
  );
};

export default Chatbot;
