const mongoose = require("mongoose");

const JersApp_TokenSchema = new mongoose.Schema({
  token: { type: String, unique: true },
});

const JersApp_Token = mongoose.model("JersApp_Token", JersApp_TokenSchema);
exports.JersApp_Token = JersApp_Token;
