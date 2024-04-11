const mongoose = require("mongoose");
const express = require("express");
const { createServer } = require("http");

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const httpServer = createServer(app);
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const path = require("path");
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log("DB Connected");
});
//*Routes
const Messages = require("./routes/message");
const Auth = require("./routes/users");
const Token = require("./routes/token");
const Contacts = require("./routes/contacts");
const Status = require("./routes/status");

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).json({status:"ok",message:"Socket Server is running"});
});

app.use("/api", Messages);
app.use("/api/auth", Auth);
app.use("/api/auth", Token);
app.use("/api", Contacts);
app.use("/api/status", Status);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
