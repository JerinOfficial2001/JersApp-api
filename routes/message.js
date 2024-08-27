const express = require("express");
const {
  getAllMessage,
  deleteMsgs,
  getLastMessage,
  sendMsg,
} = require("../controllers/message");
const { getMessages } = require("../controllers/Groups/messages");
const route = express.Router();

route.get("/message", getAllMessage);
route.get("/lastMsg/:senderID/:receiverID", getLastMessage);
route.delete("/message", deleteMsgs);
route.post("/message", sendMsg);
//*Group
route.get("/groupMsg", getMessages);

module.exports = route;
