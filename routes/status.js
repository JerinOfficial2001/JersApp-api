const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const {
  getAllStatus,
  addStatus,
  deleteStatus,
  getStatusByID,
} = require("../controllers/status");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "JersApp/JersApp_Status",
  },
});
// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/status");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "_" + file.originalname);
//   },
// });

const upload = multer({ storage: storage });

router.get("/get", getAllStatus);
router.post("/add", upload.array("file"), addStatus);
router.get("/get/:id", getStatusByID);
router.delete("/delete/:id", deleteStatus);

module.exports = router;
