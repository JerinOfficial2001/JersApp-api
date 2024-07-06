const { WC_Group } = require("../../model/Groups/group");
const { WC_grp_members } = require("../../model/Groups/member");
const { WC_Auth } = require("../../model/auth");
const { CreateMember } = require("../../services/member");
const { authenticateByTokenAndUserID } = require("../../utils/Authentication");

exports.DeleteAllMembers = async (req, res) => {
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
        const result = await WC_grp_members.deleteMany();
        res.status(200).json({ status: "ok", data: result });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("DeleteAllMembers", error);
  }
};
exports.getAllMembers = async (req, res) => {
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
        const result = await WC_grp_members.find({});
        res.status(200).json({ status: "ok", data: result });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("getAllMembers", error);
  }
};
exports.GetMembersByGroupID = async (req, res, next) => {
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
        const AllMembers = await WC_Group.findById(groupID).populate("members");

        let Members = [];
        try {
          for (let member of AllMembers.members) {
            const user = await WC_Auth.findById(member.user_id);
            if (user) {
              const { _id, ...userWithoutId } = user.toObject();
              Members.push(Object.assign({}, member.toObject(), userWithoutId));
            } else {
              console.error(`User with ID ${member.user_id} not found.`);
            }
          }
        } catch (error) {
          console.error("Error fetching or merging members:", error);
        }

        res.status(200).json({ status: "ok", data: Members });
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("GetMembersByGroupID", error);
    next(error);
  }
};
exports.AddMembersToGroup = async (req, res, next) => {
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
        const Group = await WC_Group.findById(groupID);
        const membersToAdd = req.body.members;
        try {
          if (membersToAdd.length == 0) {
            return res.status(200).json({
              status: "error",
              message: "Members Empty",
            });
          }
          if (Group) {
            const AllUsers = await WC_Auth.find({});
            const UserIDs = AllUsers.map((i) => i._id.toHexString());
            const memberUserIDsInGroup = await Promise.all(
              Group.members.map(async (member) => {
                try {
                  const memberUserID = await WC_grp_members.findById(member);
                  return memberUserID.user_id;
                } catch (error) {
                  console.error(
                    `Error fetching member with ID ${member}:`,
                    error
                  );
                  throw error;
                }
              })
            );
            const verifiedUsersToAdd = membersToAdd.filter((i) => {
              return !memberUserIDsInGroup.includes(i.user_id);
            });

            if (verifiedUsersToAdd.length !== 0) {
              await Promise.all(
                verifiedUsersToAdd.map(async (i) => {
                  if (UserIDs.includes(i.user_id)) {
                    const IsCreated = await CreateMember(
                      i.user_id,
                      i.role
                    ).then((data) => data);
                    if (IsCreated.status == "ok") {
                      Group.members.push(IsCreated.data._id);
                      const UserData = await WC_Auth.findById(i.user_id);
                      UserData.groups.push(groupID);
                      const IsGroupLinked = await UserData.save();
                      if (IsGroupLinked) {
                        const isAdded = await Group.save();
                        if (isAdded) {
                          res
                            .status(200)
                            .json({ status: "ok", message: "User added" });
                        } else {
                          res.status(200).json({
                            status: "error",
                            message: "Adding user failed",
                          });
                        }
                      } else {
                        res.status(200).json({
                          status: "error",
                          message: "Linking group failed",
                        });
                      }
                    } else {
                      res
                        .status(200)
                        .json({ status: "error", message: IsCreated.message });
                    }
                  } else {
                    res
                      .status(200)
                      .json({ status: "error", message: "User not found" });
                  }
                })
              );
            } else {
              res.status(200).json({
                status: "error",
                message: "Users already in this group",
              });
            }
          } else {
            res
              .status(200)
              .json({ status: "error", message: "Group not found" });
          }
        } catch (error) {
          console.error("Error fetching or merging members:", error);
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("GetMembersByGroupID", error);
    next(error);
  }
};
exports.RemoveMemberFromGroup = async (req, res, next) => {
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
        const Group = await WC_Group.findById(groupID);
        const UserToRemove = req.body.userToRemove;

        try {
          if (!UserToRemove) {
            return res.status(200).json({
              status: "error",
              message: "Member not selected",
            });
          }
          if (Group) {
            const Member = await WC_grp_members.findByIdAndDelete(UserToRemove);
            if (Member) {
              Group.members = Group.members.filter((i) => i != UserToRemove);
              const IsRemoved = await Group.save();
              if (IsRemoved) {
                res.status(200).json({
                  status: "ok",
                  message: "User Removed successfully",
                });
              } else {
                res.status(200).json({
                  status: "error",
                  message: "Member not removed",
                });
              }
            } else {
              res.status(200).json({
                status: "error",
                message: "Member not found",
              });
            }
          } else {
            res
              .status(200)
              .json({ status: "error", message: "Group not found" });
          }
        } catch (error) {
          console.error("Error fetching or merging members:", error);
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("GetMembersByGroupID", error);
    next(error);
  }
};
exports.UpdateMember = async (req, res) => {
  const { userID } = req.query;
  const memberID = req.params.id;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const isAuthenticated = await authenticateByTokenAndUserID(
      token,
      userID
    ).then((data) => data);
    if (token && isAuthenticated) {
      const UserData = isAuthenticated;
      if (UserData) {
        const memberData = await WC_grp_members.findById(memberID);
        if (memberData) {
          memberData.role = req.body.role;
          const result = await memberData.save();
          if (result) {
            res
              .status(200)
              .json({ status: "ok", data: "Updated successfully" });
          } else {
            res
              .status(200)
              .json({ status: "error", message: "Updation failed" });
          }
        } else {
          res
            .status(200)
            .json({ status: "error", message: "Member not found" });
        }
      } else {
        res.status(200).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Un-authorized" });
    }
  } catch (error) {
    console.log("getAllMembers", error);
  }
};
