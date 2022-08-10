import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  conversationState: { type: mongoose.Schema.Types.Mixed }
});

export const ConversationModel = mongoose.model('conversation', ConversationSchema);
