const express = require("express");
const {
  DeleteAllMembers,
  getAllMembers,
  GetMembersByGroupID,
  AddMembersToGroup,
  RemoveMemberFromGroup,
  UpdateMember,
} = require("../controllers/Groups/members");
const router = express.Router();

router.get("/getAllMembers", getAllMembers);
router.get("/getMembers", GetMembersByGroupID);
router.post("/createmember", AddMembersToGroup);
router.delete("/deleteAllMembers", DeleteAllMembers);
router.delete("/removeMember/:id", RemoveMemberFromGroup);
router.put("/updateMember/:id", UpdateMember);

module.exports = router;
