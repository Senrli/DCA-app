// import { BotDeclaration } from 'express-msteams-host';
import debug from 'debug';
import * as express from 'express';
import {
  CardFactory,
  ConversationState,
  MemoryStorage,
  UserState,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  CloudAdapter,
  Attachment
} from 'botbuilder';
import { MessageBot } from './messageBot';
// import { MainDialog } from './dialogs/mainDialog';
// import WelcomeCard from './cards/welcomeCard';

import DiscountClaimRequestCard from './cards/discountClaimRequestCard';
import { MongoDBStorage } from './repo/mongoDBStorage';
import { queryUserbyId } from '../repo/endpoints/user';
// Initialize debug logging module
const log = debug('msteams');

const dbName = 'teamsDB';
const collectionName = 'bot';
log('Bot: Connecting to mongoDB...');
const botStorage = new MongoDBStorage(process.env.MONGODB_URL, dbName, collectionName);

// Initialize the credentials
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MICROSOFT_APP_ID,
  MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
  MicrosoftAppType: process.env.MICROSOFT_APP_TYPE,
  MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  log(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
  // Clear out state
  await conversationState.delete(context);
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
// eslint-disable-next-line prefer-const
// let conversationState: ConversationState;
// let userState: UserState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
// TODO: Add server endpoints
// const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(botStorage);
const userState = new UserState(botStorage);

const myBot = new MessageBot(conversationState, userState);

// Initialize router for express
const router = express.Router();

const sendProactiveMessage = async (userId: string, attachments: [Attachment]) => {
  const userData = await queryUserbyId(userId);

  // const activityId = conversationState[userData.conversationReference.conversation.id];

  // userData.conversationReference.activityId = activityId;

  const reference = JSON.parse(JSON.stringify(userData.conversationReference));
  log(`conversationPreference::: ${reference}`);
  log(`type `);
  try {
    await adapter.continueConversationAsync(process.env.MICROSOFT_APP_ID, reference, async (context) => {
      log('context::::::');
      log(JSON.stringify(context));
      await context.sendActivity({ attachments });
    });
  } catch (err) {
    log('sendProactivemessage failed', err.stack);
  }
};

router.post('/notify', async (req, res) => {
  const discountClaimRequestCard = CardFactory.adaptiveCard(DiscountClaimRequestCard);
  // log(req.body);
  // const userId = req.body.userId;
  // log(userId);
  // log('state:::::::');
  // log(JSON.stringify(conversationState));
  // Strip the keys 'namespace' and 'storage' from the output
  // const conversationStateStripped = JSON.parse(JSON.stringify(conversationState));
  // ['namespace', 'storage'].forEach((e) => delete conversationStateStripped[e]);
  // log(JSON.stringify(conversationState));

  try {
    sendProactiveMessage(req.body.userId, [discountClaimRequestCard]).then(() => {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
      res.end();
    });
  } catch (err) {
    log(`POST /notify error ${err.stack}`);
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(500);
    res.write(`<html><body><h1>ERROR: ${err.stack}</h1></body></html>`);
    res.end();
  }
});

router.post('/messages', async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => myBot.run(context));
});

// // Listen for incoming notifications and send proactive messages to users.
// router.get('/notify', async (req, res) => {
//   // Strip the keys 'namespace' and 'storage' from the output

//   const conversationStateStripped = JSON.parse(JSON.stringify(conversationState));
//   ['namespace', 'storage'].forEach((e) => delete conversationStateStripped[e]);
//   log(JSON.stringify(conversationState));
//   // Loop through the list of users
//   for (const conversationReference of Object.values(conversationStateStripped)) {
//     log(`get reference: ${JSON.stringify(conversationReference)}`);
//     await adapter.continueConversationAsync(process.env.MICROSOFT_APP_ID, conversationReference, async (context) => {
//       log('context::::::');
//       log(JSON.stringify(context));
//       await context.sendActivity('proactive hello');
//     });
//   }
//   res.setHeader('Content-Type', 'text/html');
//   res.writeHead(200);
//   res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
//   res.end();
// });

export default {
  router
};
