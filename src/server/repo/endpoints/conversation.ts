import { User, UserModel } from '../models/user';
import { Request, Router } from 'express';
import debug from 'debug';
import { ConversationModel } from '../models/conversation';

const router = Router();
const log = debug('msteams');

/** Returns conversation reference */
router.get('/conversations', async (req: Request<unknown, unknown, User>, res) => {
  const id = req.body.userId;
  log('retrieve conv');
  const conversations = await ConversationModel.find({ 'conversationState.user.aadObjectId': id });

  try {
    res.send(conversations);
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Delete conversation entry */
router.delete('/conversations', async (req: Request<unknown, unknown, User>, res) => {
  log('delete convo');
  const id = req.body.userId;
  try {
    const conversation = await ConversationModel.findOneAndDelete({ 'conversationState.user.aadObjectId': id });
    if (!conversation) res.status(404).send('No item found');
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Create conversation entry */
router.post('/api/conversations', async (req: Request<unknown, unknown, User>, res) => {
  const conversation = new ConversationModel(req.body);

  try {
    await conversation.save();
    res.send(conversation);
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Update conversation entry */
router.patch('/api/conversations', async (req: Request<unknown, unknown, User>, res) => {
  const id = req.body.userId;
  const conversations = await ConversationModel.find({ 'conversationState.user.aadObjectId': id });

  try {
    const conversation = await ConversationModel.findOneAndUpdate({ 'conversationState.user.aadObjectId': id });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default {
  router
};
