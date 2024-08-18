const express = require("express");
const {
  getContacts,
  addContacts,
  deleteContacts,
  AddAndGetAllContacts,
} = require("../controllers/contacts");
const route = express.Router();

route.get("/contact", getContacts);
route.post("/contact", addContacts);
route.post("/addAndGetAllContacts", AddAndGetAllContacts);
route.delete("/contact", deleteContacts);

module.exports = route;
