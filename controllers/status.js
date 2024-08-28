const { JersApp_Auth } = require("../model/auth");
const { JersApp_status } = require("../model/status");
const cloudinary = require("../utils/cloudinary");
const BASE_URL = process.env.BASE_URL;
exports.getAllStatus = async (req, res, next) => {
  const user_id = req.query.userID;
  try {
    const allContacts = await JersApp_Auth.findById(user_id).populate(
      "contacts"
    );
    const contacts = allContacts.contacts;
    const allData = await JersApp_status.find({});
    const stories = allData.map((elem) => {
      const isExist = contacts.some((i) => i.user_id == elem.userID);
      if (isExist) {
        if (isExist.userID == user_id) {
          return { ...elem.toObject(), isCreator: true };
        } else {
          return { ...elem.toObject(), isCreator: false };
        }
      }
    });
    if (stories) {
      // console.log(BASE_URL);
      const DATA = stories.map((elem) => ({
        ...elem,
        file: elem.file.map((img) => ({
          format: img.format,
          url: img.url,
        })),
      }));

      res.status(200).json({ status: "ok", data: DATA });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusByID = async (req, res, next) => {
  try {
    const allData = await JersApp_status.findById(req.params.id);
    if (allData) {
      const DATA = {
        _id: allData._id,
        userID: allData.userID,
        userName: allData.userName,
        text: allData.text,
        file: allData.file.map((img) => ({
          format: img.format,
          url: img.url,
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
      if (req.file) {
        this.DeleteImage(req.file.path);
      }
      res.status(200).json({ status: "error", message: "No data found" });
    } else {
      const userStatus = await JersApp_status.findOne({ userID });
      const userData = await JersApp_Auth.findById(userID);
      const AddFile = (file) => ({
        url: file.path,
        public_id: file.path
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.\w+$/, ""),
        format: file.mimetype,
        originalname: file.originalname,
        size: file.size,
      });
      if (userStatus && userData) {
        userStatus.file = userStatus.file.concat(
          req.files.map((file) => AddFile(file))
        );
        userStatus.userName = userData.name;
        const result = await userStatus.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Updated" });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res
            .status(200)
            .json({ status: "error", message: "Failed to Update Status" });
        }
      } else {
        // If user data doesn't exist, create a new document
        const newVal = new JersApp_status({
          userID,
          text,
          file: req.files.map((file) => AddFile(file)),
          userName: userData?.name,
        });
        const result = await newVal.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Posted" });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res
            .status(200)
            .json({ status: "error", message: "Failed to Post Status" });
        }
      }
    }
  } catch (error) {
    if (req.file) {
      this.DeleteImage(req.file.path);
    }
    console.log(error);
    res.status(500).send(error);
  }
};
exports.deleteStatus = async (req, res, next) => {
  try {
    const status = await JersApp_status.findById(req.params.id);
    if (status) {
      const response = await cloudinary.uploader.destroy(status.file.public_id);
      if (response) {
        const result = await JersApp_status.findByIdAndDelete(req.params.id);
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
exports.DeleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(
      "JersApp/" +
        public_id
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.\w+$/, "")
    );
  } catch (error) {
    console.log("Error:", error);
  }
};
