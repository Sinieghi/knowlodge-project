const mongoose = require("mongoose");
const { MONGO_URI } = require("../.env");

mongoose.connect(MONGO_URI, { useNewUrlParser: true }).catch((e) => {
  const msg = "ERRO! Não foi possível conectar com o MongoDB!";
  console.log("\x1b[41m%s\x1b[37m", msg, "\x1b[0m");
});
