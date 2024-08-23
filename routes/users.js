const express = require("express");
const {
  getUsers,
  register,
  userData,
  login,
  GetUsersByID,
  updateProfile,
  updateTheme,
  GetUsersByIDs,
} = require("../controllers/users");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "JersApp/JersApp_Profile",
  },
});

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/getUsers", getUsers);
router.get("/get/:id", GetUsersByID);
router.post("/register", upload.single("image"), register);
router.put("/update/:id", upload.single("image"), updateProfile);
router.post("/login", login);
router.get("/login", userData);
router.post("/getByIds", GetUsersByIDs);
router.post("/updateTheme/:id", updateTheme);

module.exports = router;
