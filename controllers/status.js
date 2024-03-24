const { WC_status } = require("../model/status");
const cloudinary = require("../utils/cloudinary");

exports.getAllStatus = async (req, res, next) => {
  try {
    const allData = await WC_status.find({});
    if (allData) {
      res.status(200).json({ status: "ok", data: allData });
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
      res.status(200).json({ status: "ok", data: allData });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.addStatus = async (req, res, next) => {
  const { userID, text, image } = req.body;
  try {
    if (!req.file) {
      res.status(200).json({ status: "error", message: "No data found" });
    } else {
      const uploadRes = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: req.file.mimetype === "image/jpeg" ? "image" : "video",
          upload_preset: "whatsappcloneVDO",
        },
        (err, response) => {
          if (err) {
            return err;
          } else {
            return response;
          }
        }
      );
      if (uploadRes) {
        const newVal = new WC_status({
          userID,
          text,
          file: {
            url: uploadRes.secure_url,
            public_id: uploadRes.public_id,
            format: uploadRes.format,
          },
        });
        const result = await newVal.save();
        if (result) {
          res.status(200).json({ status: "ok", message: "Status Posted" });
        } else {
          res.status(200).json({ status: "error", message: "Failed" });
        }
      } else {
        res.status(200).json({ status: "error", message: "Updation failed" });
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
