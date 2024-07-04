const mongoose = require("mongoose");
const WC_AuthSchema = new mongoose.Schema({
  mobNum: { type: String, unique: true },
  password: String,
  name: String,
  image: { type: Object },
  theme: String,
  groups: [
    {
      type: mongoose.Types.ObjectId,
      ref: "WC_Group",
    },
  ],
});

const WC_Auth = mongoose.model("WC_Auth", WC_AuthSchema);
exports.WC_Auth = WC_Auth;
