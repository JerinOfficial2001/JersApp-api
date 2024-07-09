const { WC_Group } = require("../../model/Groups/group");
const { WC_grp_members } = require("../../model/Groups/member");
const { WC_Auth } = require("../../model/auth");
const {
  AddMembersTOGroup,
  AddGroupIdToUser,
  RemoveGroupFromEveryUser,
} = require("../../services/groups");
const { CreateMember, CreateArrayOfMember } = require("../../services/member");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.createGroup = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  let members = req.body.members;
  // if (!Array.isArray(members)) {
  //   members = [members];
  // }
  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const GroupAdmin = await CreateMember(UserData._id, "ADMIN").then(
          (data) => data
        );
        if (!GroupAdmin) {
          res
            .status(200)
            .json({ status: "error", message: "Error at adding ADMIN" });
        } else if (GroupAdmin.status == "error") {
          res.status(200).json({ status: "error", data: GroupAdmin.message });
        } else {
          const newMembers = await CreateArrayOfMember(
            members,
            UserData._id
          ).then((data) => data);
          if (!newMembers) {
            res
              .status(200)
              .json({ status: "error", message: "Error at adding members" });
          } else if (newMembers && newMembers.status == "error") {
            res.status(200).json({ status: "error", data: newMembers.message });
          } else {
            const result = new WC_Group({
              group_name: req.body.group_name,
              image: req.body.image,
              last_msg: req.body.last_msg,
              unread_msg: req.body.unread_msg,
              created_by: UserData.name,
              members: [],
            });
            if (result) {
              UserData.groups.push(result._id);
              const IsComplete = await UserData.save();
              if (IsComplete) {
                result.members = [GroupAdmin.data._id, ...newMembers.data];
                const IsGrpAdded = await result.save();

                if (IsGrpAdded) {
                  const IsGrpIdAddedToUser = await AddGroupIdToUser(
                    IsGrpAdded._id,
                    members
                  ).then((data) => data);
                  if (IsGrpIdAddedToUser && !IsGrpIdAddedToUser.message) {
                    res.status(200).json({
                      status: "ok",
                      message: "Group created successfully",
                    });
                  } else {
                    res.status(200).json({
                      status: "error",
                      message: "Error Occured While Adding GroupID to User",
                    });
                  }
                } else {
                  res.status(200).json({
                    status: "error",
                    message: "Creating group failed",
                  });
                }
              } else {
                res.status(200).json({
                  status: "error",
                  message: "Group Linking User failed",
                });
              }
            } else {
            }
          }
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getAllGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const allGroups = await WC_Group.find({});
        res.status(200).json({ status: "ok", data: allGroups });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.deleteAllGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      const allGroup = await WC_Group.find({});
      const IDs = allGroup.map((i) => i._id);
      const allUsers = await WC_Auth.find({});
      const IsGroupRemoved = await RemoveGroupFromEveryUser(allUsers, IDs).then(
        (data) => data
      );
      if (IsGroupRemoved) {
        const deletedGroups = await WC_Group.deleteMany();
        res.status(200).json({ status: "ok", message: deletedGroups });
      } else {
        res.status(200).json({
          status: "error",
          message: "Group deletion failed while removing from user",
        });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getGroups = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const User = await WC_Auth.findById(userID).populate("groups");
        res.status(200).json({ status: "ok", data: User.groups });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getGroupById = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await WC_Group.findById(req.params.id);
        res.status(200).json({ status: "ok", data: group });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.updateGroup = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const group = await WC_Group.findById(req.params.id);
        if (group) {
          if (req.body.group_name) {
            group.group_name = req.body.group_name;
          }
          const result = await group.save();
          if (result) {
            res.status(200).json({ status: "ok", data: "Updated" });
          } else {
            res.status(200).json({ status: "error", message: "Failed" });
          }
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
    next(error);
  }
};
