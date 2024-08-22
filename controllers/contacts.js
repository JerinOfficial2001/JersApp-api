const { JersApp_Auth } = require("../model/auth");
const { JersApp_Chats } = require("../model/chats");
const { JersApp_Contact } = require("../model/contacts");
const { JersApp_Message } = require("../model/message");
const { authenticateByTokenAndUserID } = require("../utils/Authentication");

exports.addContacts = async (req, res, next) => {
  const { userID } = req.query;
  try {
    const contact = await JersApp_Contact.findById(req.body.id);
    const user = await JersApp_Auth.findById(userID);
    if (!userID || !contact)
      return res
        .status(200)
        .json({ status: "error", message: "UserId or contact undefined" });
    const chatIds = user.chats.map((elem) => elem.toString());
    if (!chatIds.includes(req.body.id)) {
      user.chats.push(contact._id);
      user.save();
      res.status(200).json({ status: "ok", data: contact });
    } else {
      res.status(200).json({
        status: "error",
        message: "already registered",
        data: contact.user_id,
      });
    }
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getContacts = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    const allContacts = await JersApp_Auth.findById(user_id).populate(
      "contacts"
    );
    const contacts = allContacts.contacts.filter(
      (elem) => elem.user_id != user_id
    );
    console.log(contacts, user_id);
    const filteredData = await getImageByID(contacts);
    res.status(200).json({ status: "ok", data: filteredData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getContactsByID = async (req, res, next) => {
  const id = req.params.id;
  try {
    const contact = await JersApp_Contact.findById(id);
    res.status(200).json({ status: "ok", data: contact });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getChats = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    const allContacts = await JersApp_Auth.findById(user_id).populate("chats");
    const filteredData = await getImageByID(allContacts.chats);
    const result = await updateLastMsgNameByID(filteredData, user_id);
    res.status(200).json({ status: "ok", data: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteContacts = async (req, res, next) => {
  const { sender_id, receiver_id, Contact_id } = req.query;
  try {
    const result = await JersApp_Contact.findOne({ Contact_id });

    if (result) {
      const response = await JersApp_Chats.find({});
      const chatIDs = [sender_id, receiver_id];

      const filteredChats = response.find((i) =>
        chatIDs.every((id) => i.sender == id || i.receiver == id)
      );
      if (filteredChats) {
        const msgObj = await JersApp_Message.find({
          chatID: filteredChats._id,
        });
        if (msgObj) {
          const deletedContactObj = await JersApp_Contact.findByIdAndDelete(
            result._id
          );
          if (deletedContactObj) {
            const deletedChat = await JersApp_Chats.findByIdAndDelete(
              filteredChats._id
            );
            if (deletedChat) {
              const deletedMsg = await JersApp_Message.deleteMany({
                chatID: filteredChats._id,
              });

              if (deletedMsg) {
                res.status(200).json({
                  status: "ok",
                  message: "Contact & chat & Msg Deleted",
                });
              } else {
                res
                  .status(200)
                  .json({ status: "ok", message: "Msg not Deleted" });
              }
            } else {
              res
                .status(200)
                .json({ status: "ok", message: "chat not Deleted" });
            }
          } else {
            res.status(200).json({ status: "ok", message: "NotDeleted" });
          }
        } else {
          const deletedContactObj = await JersApp_Contact.findByIdAndDelete(
            receiver_id
          );
          if (deletedContactObj) {
            const deletedChat = await JersApp_Chats.findByIdAndDelete(
              filteredChats._id
            );
            if (deletedChat) {
              res
                .status(200)
                .json({ status: "ok", message: "Contact & chat Deleted" });
            } else {
              res
                .status(200)
                .json({ status: "ok", message: "chat not Deleted" });
            }
          } else {
            res.status(200).json({ status: "ok", message: "NotDeleted" });
          }
        }
      } else {
        const deletedContactObj = await JersApp_Contact.findByIdAndDelete(
          result._id
        );
        if (deletedContactObj) {
          res.status(200).json({ status: "ok", message: "Contact Deleted" });
        } else {
          res.send({ status: "error", message: "Contact not deleted" });
        }
      }
    } else {
      res.status(200).json({ status: "ok", message: "failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.AddAndGetAllContacts = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(token, userID);

    if (isAuthenticated) {
      const user = await JersApp_Auth.findById(userID);
      if (user) {
        if (!user.contacts) {
          user.contacts = [];
        }
        if (req.body.contacts && req.body.contacts.length > 0) {
          const contacts = req.body.contacts;
          for (let elem of contacts) {
            const isExist = await JersApp_Contact.find({
              creator_id: elem.user_id,
              phone: elem.mobNum,
            });
            if (isExist?.length == 0) {
              const result = await JersApp_Contact.create({
                given_name: elem.givenName,
                user_id: elem._id,
                creator_id: elem.user_id,
                phone: elem.mobNum,
                name: elem.name,
              });
              if (result) await user.contacts.push(result._id);
            }
          }
          await user.save();
        }
        const userContacts = await JersApp_Auth.findById(userID);
        const allContacts = await userContacts.populate("contacts");
        const result = await getImageByID(allContacts.contacts);
        res.status(200).json({ status: "ok", data: result });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-Authorized" });
    }
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getImageByID = async (arr) => {
  let Arr = [];
  for (let obj of arr) {
    const result = await JersApp_Auth.findById(obj.user_id);
    const data = {
      ...obj.toObject(),
      image: result && result.image ? result.image : null,
    };
    Arr.push(data);
  }
  return Arr;
};
const updateLastMsgNameByID = async (arr, id) => {
  let allDatas = [];
  for (let contact of arr) {
    if (contact.lastMsg && contact.lastMsg.id) {
      const allContacts = await getAllcontacts(id);
      const senderContact = allContacts.find(
        (elem) => elem.user_id == contact.user_id
      );
      if (contact.lastMsg && contact.lastMsg.id) {
        if (contact.lastMsg.id == id) {
          contact.lastMsg["name"] = `You`;
        } else {
          contact.lastMsg["name"] = senderContact.given_name
            ? senderContact.given_name
            : senderContact.phone;
        }
        delete contact.lastMsg.id;
      }
    }
    allDatas.push(contact);
  }
  return allDatas;
};
const getAllcontacts = async (id) => {
  const user = await JersApp_Auth.findById(id);
  if (!user.contacts) {
    user.contacts = [];
  }
  const userContacts = await user.populate("contacts");
  return userContacts.contacts;
};
