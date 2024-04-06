const { WC_Auth } = require("../model/auth");
const jwt = require("jsonwebtoken");
const { WC_Token } = require("../model/token");
const { WC_TokenID } = require("../model/tokenID");
const cloudinary = require("../utils/cloudinary");

const SECRET_KEY = process.env.SECRET_KEY;
exports.getUsers = async (req, res, next) => {
  try {
    const allData = await WC_Auth.find({});
    if (allData) {
      res.status(200).json({ status: "ok", data: allData });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.GetUsersByID = async (req, res, next) => {
  try {
    const User = await WC_Auth.findById(req.params.id);
    if (User) {
      res.status(200).json({ status: "ok", data: User });
    } else {
      res.status(200).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.login = async (req, res, next) => {
  try {
    const user = await WC_Auth.findOne({ mobNum: req.body.mobNum });
    if (!user) {
      res.status(200).json({ status: "error", message: "User not found" });
    } else if (user && user.password == req.body.password) {
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: "24h",
      });

      res.status(200).json({ status: "ok", data: { token } });
    } else {
      res.status(200).json({ status: "error", message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.register = async (req, res, next) => {
  try {
    const { mobNum, password, name } = req.body;
    const allData = await WC_Auth.find({});
    const particularData = allData.find((i) => i.mobNum == mobNum);
    if (particularData) {
      res.status(200).json({ status: "error", message: "User Already Exists" });
    } else {
      if (req.file) {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          upload_preset: "whatsappclone",
        });
        if (uploadRes) {
          const user = new WC_Auth({
            mobNum,
            password,
            name,
            image: {
              url: uploadRes.secure_url,
              public_id: uploadRes.public_id,
            },
          });
          const savedUser = await user.save();
          res.status(200).json({ status: "ok", data: savedUser });
        } else {
          res
            .status(200)
            .json({ status: "error", message: "Image Updation failed" });
        }
      } else {
        const response = await WC_Auth.create({
          mobNum,
          password,
          name,
        });
        res.status(200).json({ status: "ok", data: response });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.userData = async (req, res, next) => {
  try {
    // Extract token from the request headers or cookies
    const token = req.headers.authorization?.replace("Bearer ", ""); // Adjust this according to your token handling

    if (!token) {
      return res
        .status(200)
        .json({ status: "error", message: "Unauthorized - Missing WC_Token" });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Retrieve user data based on the decoded information
    const user = await WC_Auth.findById(decoded.userId);

    if (user) {
      res.status(200).json({ status: "ok", data: { user } });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(401)
      .json({ status: "error", message: "Unauthorized - Invalid WC_Token" });
  }
};
exports.logout = async (req, res, next) => {
  try {
    const { token, name } = req.body;
    if (token) {
      const tokenId = await WC_Token.findOne({ token });
      if (tokenId) {
        const id = await WC_TokenID.findOne({ tokenID: tokenId._id });
        if (id) {
          if (!name) {
            await WC_Token.findByIdAndDelete(tokenId._id);
            await WC_TokenID.findByIdAndDelete(id._id);
            res
              .status(200)
              .json({ status: "ok", message: "Logged out successfully" });
          } else {
            await WC_TokenID.findByIdAndDelete(id._id);
            res
              .status(200)
              .json({ status: "ok", message: "Web Session Ended" });
          }
        } else {
          if (!name) {
            await WC_Token.findByIdAndDelete(tokenId._id);
            res
              .status(200)
              .json({ status: "ok", message: "Logged out successfully" });
          } else {
            res
              .status(200)
              .json({ status: "ok", message: "Session Not Available" });
          }
        }
      }
    } else {
      res
        .status(200)
        .json({ status: "error", message: "Logged out successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const { mobNum, password, name, public_id } = req.body;
    // const userDatas = await WC_Auth.findById(req.params.id);
    if (req.file) {
      if (public_id !== "") {
        await cloudinary.uploader.destroy(public_id);
      }
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: "whatsappclone",
      });
      if (uploadRes) {
        const user = {
          mobNum,
          password,
          name,
          image: {
            url: uploadRes.secure_url,
            public_id: uploadRes.public_id,
          },
        };
        const savedUser = await WC_Auth.findByIdAndUpdate(req.params.id, user, {
          new: true,
        });
        if (savedUser) {
          res
            .status(200)
            .json({ status: "ok", message: "Updated Successfully" });
        } else {
          res.status(200).json({ status: "error", message: "Updation failed" });
        }
      } else {
        res
          .status(200)
          .json({ status: "error", message: "Image Updation failed" });
      }
    } else {
      const savedUser = await WC_Auth.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      res.status(200).json({ status: "ok", data: savedUser });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
