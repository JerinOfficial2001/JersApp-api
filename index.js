const mongoose = require("mongoose");
const express = require("express");
const { createServer } = require("http");

const app = express();
const httpServer = createServer(app);
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const db = process.env.MONGO_DB;
mongoose.connect(db).then(() => {
  console.log("DB Connected");
});
//*Routes
const Messages = require("./routes/message");
const Auth = require("./routes/users");
const Token = require("./routes/token");
const Contacts = require("./routes/contacts");

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.write(`<h1>Socket Server is running on:${PORT}</h1>`);
});

app.use("/api", Messages);
app.use("/api/auth", Auth);
app.use("/api/auth", Token);
app.use("/api", Contacts);
