const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
  tokenID: { type: String, unique: true },
});

const JersApp_TokenID = mongoose.model("JersApp_TokenID", tokenSchema);
exports.JersApp_TokenID = JersApp_TokenID;
