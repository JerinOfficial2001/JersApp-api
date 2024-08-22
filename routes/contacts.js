const express = require("express");
const {
  getContacts,
  addContacts,
  deleteContacts,
  AddAndGetAllContacts,
  getChats,
  getContactsByID,
} = require("../controllers/contacts");
const route = express.Router();

route.get("/contact", getContacts);
route.get("/contact/:id", getContactsByID);
route.get("/chats", getChats);
route.post("/contact", addContacts);
route.post("/addAndGetAllContacts", AddAndGetAllContacts);
route.delete("/contact", deleteContacts);

module.exports = route;
