const { WC_Chats } = require("../model/chats");
const { WC_Message } = require("../model/message");

exports.getAllMessage = async (req, res, next) => {
  try {
    const response = await WC_Message.find({});
    res.status(200).json({ status: "ok", data: response });
  } catch (error) {
    next("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteMsgs = async (req, res, next) => {
  const { id } = req.query;
  try {
    const result = await WC_Message.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ status: "ok", message: "deleted" });
    } else {
      res.status(200).json({ status: "ok", message: "No data found" });
    }
  } catch (error) {
    next("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getLastMessage = async (req, res) => {
  try {
    const chats = await WC_Chats.find({});
    const chatIDs = [req.params.senderID, req.params.receiverID];

    const filteredChats = chats.find((i) =>
      chatIDs.every((id) => i.sender == id || i.receiver == id)
    );

    const lastMsg = await WC_Message.find({ chatID: filteredChats._id });
    res.status(200).json({
      status: "ok",
      data: {
        message: lastMsg[lastMsg.length - 1].message,
        sender: lastMsg[lastMsg.length - 1].sender,
      },
    });
  } catch (error) {
    res.status(404).json({ status: "error", message: "something Went wrong" });
  }
};
