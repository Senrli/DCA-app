const mongoose = require("mongoose");
const Schema = mongoose.Schema;

 const UserSchema = new mongoose.Schema({
  userState: { type: Schema.Types.Mixed }
});

export const User = mongoose.model("User", UserSchema);