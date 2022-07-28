const mongoose = require("mongoose");
const Schema = mongoose.Schema;

 const ConversationSchema = new mongoose.Schema({
  conversationState: { type: Schema.Types.Mixed }
});

export const Conversation = mongoose.model("Conversation", ConversationSchema);