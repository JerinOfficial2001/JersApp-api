const { WC_Auth } = require("../model/auth");
const { WC_status } = require("../model/status");
const cloudinary = require("../utils/cloudinary");
const BASE_URL = process.env.BASE_URL;
exports.getAllStatus = async (req, res, next) => {
  try {
    const allData = await WC_status.find({});
    if (allData) {
      // console.log(BASE_URL);
      const DATA = allData.map((elem) => ({
        _id: elem._id,
        userID: elem.userID,
        userName: elem.userName,
        text: elem.text,
        file: elem.file.map((img) => ({
          format: img.format,
          url: `${BASE_URL}/${img.url}`,
        })),
      }));
      console.log(DATA, "allStatus");
      res.status(200).json({ status: "ok", data: DATA });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusByID = async (req, res, next) => {
  try {
    const allData = await WC_status.findById(req.params.id);
    if (allData) {
      const DATA = {
        _id: allData._id,
        userID: allData.userID,
        userName: allData.userName,
        text: allData.text,
        file: allData.file.map((img) => ({
          format: img.format,
          url: `${BASE_URL}/${img.url}`,
        })),
      };
      res.status(200).json({ status: "ok", data: DATA });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.addStatus = async (req, res, next) => {
  const { userID, text, image } = req.body;
  try {
    if (!req.files) {
      res.status(200).json({ status: "error", message: "No data found" });
    } else {
      const userStatus = await WC_status.findOne({ userID });
      const userData = await WC_Auth.findById(userID);
      console.log(userData, "Data");
      if (userStatus && userData) {
        // If user data exists, update the existing document
        userStatus.file = userStatus.file.concat(
          req.files.map((file) => ({
            url: file.path,
            format: file.mimetype,
          }))
        );
        userStatus.userName = userData.name;
        const result = await userStatus.save();
        console.log(result, "res");
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Updated" });
        } else {
          res
            .status(200)
            .json({ status: "error", message: "Failed to Update Status" });
        }
      } else {
        // If user data doesn't exist, create a new document
        const newVal = new WC_status({
          userID,
          text,
          file: req.files.map((file) => ({
            url: file.path,
            format: file.mimetype,
          })),
          userName: userData?.name,
        });
        const result = await newVal.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Posted" });
        } else {
          res
            .status(200)
            .json({ status: "error", message: "Failed to Post Status" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.deleteStatus = async (req, res, next) => {
  try {
    const status = await WC_status.findById(req.params.id);
    if (status) {
      const response = await cloudinary.uploader.destroy(status.file.public_id);
      if (response) {
        const result = await WC_status.findByIdAndDelete(req.params.id);
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Deleted" });
        } else {
          res
            .status(200)
            .json({ status: "error", message: "Status not deleted" });
        }
      } else {
        res
          .status(200)
          .json({ status: "error", message: "Something went wrong" });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
