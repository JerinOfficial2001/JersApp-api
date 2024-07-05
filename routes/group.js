const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const {
  createGroup,
  getAllGroups,
  deleteAllGroups,
  getGroups,
  getGroupById,
} = require("../controllers/Groups/groups");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "JersApp/JersApp_Profile",
  },
});
const upload = multer({ storage: storage });

router.post("/creategroup", upload.single("image"), createGroup);
router.get("/getAllgroups", getAllGroups);
router.get("/getGroups", getGroups);
router.get("/getgroupbyid/:id", getGroupById);
router.delete("/deleteAllgroups", deleteAllGroups);

module.exports = router;
