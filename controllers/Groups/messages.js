const { JersApp_Auth } = require("../../model/auth");
const { JersApp_Group } = require("../../model/Groups/group");
const { JersApp_grp_message } = require("../../model/Groups/message");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.getMessages = async (req, res, next) => {
  const { userID, groupID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await JersApp_Group.findById(groupID).populate(
          "messages"
        );

        if (group) {
          let messages = [];
          for (let msg of group.messages) {
            const user = await JersApp_Auth.findById(msg.sender_id);
            const { image, name, ...otherDatas } = user.toObject();
            const newObj = Object.assign({}, msg.toObject(), { name, image });
            messages.push(newObj);
          }
          res.status(200).json({ status: "ok", data: messages });
        } else {
          res.status(200).json({ status: "error", message: "Group not found" });
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("getMessages", error);
    next(error);
  }
};
