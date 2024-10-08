const { JersApp_Auth } = require("../model/auth");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");

const SECRET_KEY = process.env.SECRET_KEY;
exports.getUsers = async (req, res, next) => {
  try {
    const allData = await JersApp_Auth.find({});
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
    const User = await JersApp_Auth.findById(req.params.id);
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
    const user = await JersApp_Auth.findOne({ mobNum: req.body.mobNum });
    if (!user) {
      res.status(200).json({ status: "error", message: "User not found" });
    } else if (user && user.password == req.body.password) {
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: "1w",
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
    const allData = await JersApp_Auth.find({});
    const particularData = allData.find((i) => i.mobNum == mobNum);
    if (particularData) {
      if (req.file) {
        this.DeleteImage(req.file.path);
      }
      res.status(200).json({ status: "error", message: "User Already Exists" });
    } else {
      if (req.file) {
        const user = new JersApp_Auth({
          mobNum,
          password,
          name,
          image: {
            url: req.file.path,
            public_id: req.file.path
              .split("/")
              .slice(-2)
              .join("/")
              .replace(/\.\w+$/, ""),
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size,
          },
          theme: "JersApp",
        });
        const savedUser = await user.save();
        if (savedUser) {
          res.status(200).json({ status: "ok", data: savedUser });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res
            .status(200)
            .json({ status: "error", message: "Registration failed" });
        }
      } else {
        const response = await JersApp_Auth.create({
          mobNum,
          password,
          name,
          theme: "JersApp",
        });
        if (response) {
          res.status(200).json({ status: "ok", data: response });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res
            .status(200)
            .json({ status: "error", message: "Registration failed" });
        }
      }
    }
  } catch (error) {
    if (req.file) {
      this.DeleteImage(req.file.path);
    }
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.userData = async (req, res, next) => {
  try {
    // Extract token from the request headers or cookies
    const token = req.headers.authorization?.replace("Bearer ", ""); // Adjust this according to your token handling

    if (!token) {
      return res.status(200).json({
        status: "error",
        message: "Unauthorized - Missing JersApp_Token",
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Retrieve user data based on the decoded information
    const user = await JersApp_Auth.findById(decoded.userId);

    if (user) {
      res.status(200).json({
        status: "ok",
        data: Object.assign({}, user.toObject(), { accessToken: token }),
      });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    if (error == "TokenExpiredError") {
      res.status(200).json({ status: "error", message: "Token expired" });
    } else {
      res.status(200).json({
        status: "error",
        message: "Unauthorized - Invalid JersApp_Token",
      });
    }
  }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const { mobNum, password, name, theme } = req.body;
    const userDatas = await JersApp_Auth.findById(req.params.id);
    if (userDatas) {
      if (req.body.isDeleteImg == "true") {
        const { result } = await cloudinary.uploader.destroy(
          "JersApp/" + userDatas.image.public_id
        );
        if (result != "ok") {
          req.body.image = null;
        }
      }
      const user = {
        mobNum,
        password,
        name,
        image: req.file
          ? {
              url: req.file.path,
              public_id: req.file.path
                .split("/")
                .slice(-2)
                .join("/")
                .replace(/\.\w+$/, ""),
              mimetype: req.file.mimetype,
              originalname: req.file.originalname,
              size: req.file.size,
            }
          : req.body.image,
        theme: userDatas.theme,
      };
      if (req.file) {
        if (userDatas.image && userDatas.image.public_id) {
          const { result } = await cloudinary.uploader.destroy(
            "JersApp/" + userDatas.image.public_id
          );
          if (result != "ok") {
            return res
              .status(200)
              .json({ status: "error", message: "Image deletion failed" });
          }
        }
        const savedUser = await JersApp_Auth.findByIdAndUpdate(
          req.params.id,
          user,
          {
            new: true,
          }
        );
        if (savedUser) {
          res.status(200).json({
            status: "ok",
            data: savedUser,
            message: "Profile updated successfully",
          });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res.status(200).json({ status: "error", message: "Updation failed" });
        }
      } else {
        const savedUser = await JersApp_Auth.findByIdAndUpdate(
          req.params.id,
          user,
          {
            new: true,
          }
        );
        if (savedUser) {
          res.status(200).json({
            status: "ok",
            data: savedUser,
            message: "Profile updated successfully",
          });
        } else {
          if (req.file) {
            this.DeleteImage(req.file.path);
          }
          res.status(200).json({ status: "error", message: "Updation failed" });
        }
      }
    } else {
      if (req.file) {
        this.DeleteImage(req.file.path);
      }
      res.status(200).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateTheme = async (req, res) => {
  try {
    const user = await JersApp_Auth.findById(req.params.id);
    if (user) {
      user.theme == req.body.theme;
      const result = await JersApp_Auth.findByIdAndUpdate(req.params.id, user);
      if (result) {
        res
          .status(200)
          .json({ status: "ok", message: "Theme updated successfully" });
      } else {
        res
          .status(200)
          .json({ status: "error", message: "Theme updation failed" });
      }
    } else {
      res.status(200).json({ status: "error", message: "User not found" });
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
exports.GetUsersByIDs = async (req, res, next) => {
  try {
    const userIds = req.body.ids;
    const users = await Promise.all(
      userIds.map(async (id) => {
        const user = await JersApp_Auth.findById(id);
        return user;
      })
    );
    const foundUsers = users.filter((user) => user !== null);
    if (foundUsers.length > 0) {
      res.status(200).json({ status: "ok", data: foundUsers });
    } else {
      res.status(200).json({ status: "error", message: "No users found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
