const mongoose = require("mongoose");
const JersApp_statusSchema = new mongoose.Schema({
  text: String,
  // video: { type: Object },
  file: { type: Array },
  userID: String,
  userName: String,
});

const JersApp_status = mongoose.model("JersApp_status", JersApp_statusSchema);
exports.JersApp_status = JersApp_status;
