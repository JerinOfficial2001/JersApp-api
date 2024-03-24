const mongoose = require("mongoose");

const WC_ChatsSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
});

const WC_Chats = mongoose.model("WC_Chats", WC_ChatsSchema);
exports.WC_Chats = WC_Chats;
