const jwt = require("jsonwebtoken");
const { JersApp_Auth } = require("../model/auth");
const SECRET_KEY = process.env.SECRET_KEY;

exports.authenticateByTokenAndUserID = async (token, userid) => {
  if (!token) return;
  const decoded = jwt.verify(token, SECRET_KEY);
  const user = await JersApp_Auth.findById(decoded.userId);
  const userID = user ? user._id : null;
  if (!token || !user || userID.toString() !== userid || !userid) {
    return false;
  } else {
    return user;
  }
};
