const express = require("express");
const {
  getUsers,
  register,
  userData,
  login,
  logout,
  GetUsersByID,
  updateProfile,
  updateTheme,
} = require("../controllers/users");
const router = express.Router();
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

router.get("/getUsers", getUsers);
router.get("/get/:id", GetUsersByID);
router.post("/register", upload.single("image"), register);
router.put("/update/:id", upload.single("image"), updateProfile);
router.post("/login", login);
router.get("/login", userData);
router.post("/logout", logout);
router.post("/updateTheme/:id", updateTheme);

module.exports = router;
