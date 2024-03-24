const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
  tokenID: { type: String, unique: true },
});

const WC_TokenID = mongoose.model("WC_TokenID", tokenSchema);
exports.WC_TokenID = WC_TokenID;
