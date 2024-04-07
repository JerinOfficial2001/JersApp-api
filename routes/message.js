const express = require("express");
const {
  getAllMessage,
  deleteMsgs,
  getLastMessage,
} = require("../controllers/message");
const route = express.Router();

route.get("/message", getAllMessage);
route.get("/lastMsg/:senderID/:receiverID", getLastMessage);
route.delete("/message", deleteMsgs);

module.exports = route;
