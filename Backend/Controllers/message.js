const Message = require("../Model/message");

// A single thread is capped so one very long chat cannot turn into an unbounded
// response. The newest messages are the ones worth having, so the query takes
// them from the end and the page is flipped back into reading order.
const THREAD_LIMIT = 500;

exports.messagePost=async(req,res)=>{
    try {
        const { senderId,receiverId, message, roomId } = req.body;
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            roomId
        })
      return  res.status(201).json(newMessage);
    } catch (error) {
        return  res.status(400).json({ message: error.message });
    }
}

exports.getMessageRoomId=async(req,res)=>{
    try {
        // Was an unbounded `Message.find({roomId})` returning full Mongoose
        // documents. `.lean()` skips hydrating a model instance per message,
        // the projection keeps the fields the client never reads off the wire,
        // and the sort is now explicit instead of relying on insertion order.
        // Backed by the { roomId, createdAt } index on the model.
        const messages = await Message.find({ roomId: req.params.roomId })
          .select("message senderId createdAt")
          .sort({ createdAt: -1 })
          .limit(THREAD_LIMIT)
          .lean();
       return res.json(messages.reverse());
      } catch (error) {
       return res.status(500).json({ message: error.message });
      }
}

exports.getAllMessage=async(req,res)=>{
    try {
        // This returns messages across every conversation in the database. The
        // app does not call it, but it was reachable without a session, so it
        // was an open dump of every private chat; the route now requires
        // authentication and the result is capped.
        const messages = await Message.find()
          .select("message senderId roomId createdAt")
          .sort({ createdAt: -1 })
          .limit(THREAD_LIMIT)
          .lean();
      return  res.json(messages);
      } catch (error) {
       return res.status(500).json({ message: error.message });
      }
}
