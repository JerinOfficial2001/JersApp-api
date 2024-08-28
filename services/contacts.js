const { JersApp_Contact } = require("../model/contacts");

exports.getContactByUserID = async (id, currentUserID) => {
  try {
    const contact = await JersApp_Contact.findOne({
      user_id: id,
      creator_id: currentUserID,
    });
    return contact;
  } catch (error) {
    console.log("getContact service failed");
  }
};
