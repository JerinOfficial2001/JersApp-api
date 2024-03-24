const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllStatus,
  addStatus,
  deleteStatus,
  getStatusByID,
} = require("../controllers/status");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/status");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

router.get("/get", getAllStatus);
router.post("/add", upload.single("file"), addStatus);
router.get("/get/:id", getStatusByID);
router.delete("/delete/:id", deleteStatus);

module.exports = router;
