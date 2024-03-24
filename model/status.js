const mongoose = require("mongoose");
const WC_statusSchema = new mongoose.Schema({
  text: String,
  // video: { type: Object },
  file: { type: Object },
  userID: String,
});

const WC_status = mongoose.model("WC_status", WC_statusSchema);
exports.WC_status = WC_status;
