const { JersApp_Chats } = require("../model/chats");
const { JersApp_Contact } = require("../model/contacts");
const { JersApp_Message } = require("../model/message");
const { getContactByUserID } = require("../services/contacts");
const { getUserDataFromToken } = require("../utils/Authentication");

exports.getAllMessage = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userData = token ? await getUserDataFromToken(token) : false;
  try {
    const response = await JersApp_Message.find({});
    let msgsWithContactData = [];
    if (response && userData) {
      for (let msg of response) {
        const contact = await getContactByUserID(msg.sender, userData._id);
        delete contact._id;
        const obj = { ...msg.toObject(), ...contact.toObject() };
        msgsWithContactData.push(obj);
      }
      res.status(200).json({ status: "ok", data: msgsWithContactData });
    } else {
      res.status(200).json({ status: "error", message: "Un-Authorized" });
    }
  } catch (error) {
    next("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteMsgs = async (req, res, next) => {
  const { id } = req.query;
  try {
    const result = await JersApp_Message.findByIdAndDelete(id);
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
    const chats = await JersApp_Chats.find({});
    const chatIDs = [req.params.senderID, req.params.receiverID];

    const filteredChats = chats.find((i) =>
      chatIDs.every((id) => i.sender == id || i.receiver == id)
    );

    const lastMsg = await JersApp_Message.find({ chatID: filteredChats._id });
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
exports.UpdateLastMsg = async (req, res) => {
  try {
    const ID1 = req.params.senderID;
    const ID2 = req.params.receiverID;
    if (ID1 && ID2) {
      const contact1 = await JersApp_Contact.findById(ID1);
      const contact2 = await JersApp_Contact.findById(ID2);
      if (contact1 && contact2) {
        const UpdatedContact1 = {
          Contact_id: contact1.Contact_id,
          name: contact1.name,
          user_id: contact1.user_id,
          ContactDetails: contact1.ContactDetails,
          lastMsg: req.body.lastMsg,
        };
        const UpdatedContact2 = {
          Contact_id: contact2.Contact_id,
          name: contact2.name,
          user_id: contact2.user_id,
          ContactDetails: contact2.ContactDetails,
          lastMsg: req.body.lastMsg,
        };
        const contact1Result = await JersApp_Contact.findByIdAndUpdate(
          ID1,
          UpdatedContact1
        );
        const contact2Result = await JersApp_Contact.findByIdAndUpdate(
          ID2,
          UpdatedContact2
        );
        if (contact1Result && contact2Result) {
          res.status(200).json({
            status: "ok",
            message: "Updated successfully",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "failed",
          });
        }
      } else {
        if (!contact1) {
          res.status(200).json({
            status: "error",
            message: "contact1 not found",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "contact1 not found",
          });
        }
      }
    } else {
      res.status(200).json({
        status: "error",
        message: "ID required",
      });
    }
  } catch (error) {
    res.status(404).json({ status: "error", message: "something Went wrong" });
  }
};
