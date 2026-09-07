const mongoose = require("mongoose");

const joinRoomSchema = new mongoose.Schema({
    users: [String],
    updatedAt: [String]
}, {timestamps:true});

// The conversation list asks "which rooms contain this user". That used to be
// answered by downloading every room in the database and filtering in the
// browser; it is now a query, so it needs an index on the multikey field.
joinRoomSchema.index({ users: 1 });

const join_room = mongoose.model("join_room", joinRoomSchema);

module.exports = join_room;
