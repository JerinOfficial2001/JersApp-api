const mongoose = require("mongoose");

const WC_TokenSchema = new mongoose.Schema({
  token: { type: String, unique: true },
});

const WC_Token = mongoose.model("WC_Token", WC_TokenSchema);
exports.WC_Token = WC_Token;
