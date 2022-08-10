import mongoose from 'mongoose';
import { ConversationReference, RoleTypes } from 'botframework-schema';

const ChannelAccountSchema = new mongoose.Schema(
  {
    id: { type: String, required: false },
    name: { type: String, required: false },
    aadObjectId: { type: String, required: false },
    role: { type: mongoose.Schema.Types.Mixed, required: false }
  },
  { _id: false }
);

const ConversationAccountSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, required: false },
    conversationType: { type: String, required: false },
    tenantId: { type: String, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    aadObjectId: { type: String, required: false },
    role: { type: String, required: false, enum: RoleTypes },
    properties: { type: mongoose.Schema.Types.Mixed, required: false }
  },
  { _id: false }
);

const ConversationReferenceSchema = new mongoose.Schema(
  {
    activityId: { type: String, required: false },
    user: { type: ChannelAccountSchema, required: false },
    locale: { type: String, required: false },
    bot: { type: ChannelAccountSchema, required: false },
    conversation: { type: ConversationAccountSchema, required: false },
    channelId: { type: String, required: false },
    serviceUrl: { type: String, required: false }
  },
  { _id: false }
);

export interface User {
  userId: string;
  mail: string;
  displayName: string;
  conversationReference?: Partial<ConversationReference>;
}

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mail: { type: String, required: true },
  displayName: { type: String, required: true },
  conversationReference: { type: ConversationReferenceSchema, required: false }
});

export const UserModel = mongoose.model<User>('user', UserSchema);
