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
            req.body.members,
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
                const IsGrpIdAddedToUser = await AddGroupIdToUser(
                  result._id,
                  req.body.members
                ).then((data) => data);
                if (IsGrpIdAddedToUser && !IsGrpIdAddedToUser.message) {
                  result.members = [GroupAdmin.data._id, ...newMembers.data];
                  const IsGrpAdded = await result.save();
                  if (IsGrpAdded) {
                    res.status(200).json({
                      status: "ok",
                      message: "Group created successfully",
                    });
                  } else {
                    return { status: "error", message: "Failed" };
                  }
                } else {
                  return {
                    status: "error",
                    message: "Error Occured While Adding GroupID to User",
                  };
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
exports.edit = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getAll = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getByPage = async (req, res, next) => {
  const { userID } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    next(error);
  }
};
