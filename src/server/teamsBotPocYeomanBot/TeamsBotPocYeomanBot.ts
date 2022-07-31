// import { BotDeclaration } from 'express-msteams-host';
import * as debug from 'debug';
import * as express from 'express';
import {
  CardFactory,
  ConversationState,
  MemoryStorage,
  UserState,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  CloudAdapter
} from 'botbuilder';
import { MessageBot } from './messageBot';
// import { MainDialog } from './dialogs/mainDialog';
// import WelcomeCard from './cards/welcomeCard';

import DiscountClaimRequestCard from './cards/discountClaimRequestCard';

// Initialize debug logging module
const log = debug('msteams');

/**
 * Implementation for teams bot poc yeoman Bot
 */
// @BotDeclaration(
//   '/api/messages',
//   new MemoryStorage(),
//   // eslint-disable-next-line no-undef
//   process.env.MICROSOFT_APP_ID,
//   // eslint-disable-next-line no-undef
//   process.env.MICROSOFT_APP_PASSWORD
// )

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
let conversationState: ConversationState;
let userState: UserState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
// TODO: Add server endpoints
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
// eslint-disable-next-line prefer-const
userState = new UserState(memoryStorage);

const myBot = new MessageBot(conversationState, userState);

// Initialize router for express
const router = express.Router();

router.post('/api/notify', async (req, res) => {
  const discountClaimRequestCard = CardFactory.adaptiveCard(DiscountClaimRequestCard);
  const userId = req.body.userId;
  log(userId);
  log('state:::::::');
  log(JSON.stringify(conversationState));
  // Strip the keys 'namespace' and 'storage' from the output
  const conversationStateStripped = JSON.parse(JSON.stringify(conversationState));
  ['namespace', 'storage'].forEach((e) => delete conversationStateStripped[e]);
  log(JSON.stringify(conversationState));
  // Loop through the list of users
  for (const conversationReference of Object.values(conversationStateStripped)) {
    if (conversationReference['user'].aadObjectId === userId) {
      await adapter.continueConversationAsync(process.env.MICROSOFT_APP_ID, conversationReference, async (context) => {
        await context.sendActivity({ attachments: [discountClaimRequestCard] });
      });
    }
  }

  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.write('Notification has been sent.');
  res.end();
});

router.post('/api/messages', async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => myBot.run(context));
});

// Listen for incoming notifications and send proactive messages to users.
router.get('/api/notify', async (req, res) => {
  // Strip the keys 'namespace' and 'storage' from the output

  const conversationStateStripped = JSON.parse(JSON.stringify(conversationState));
  ['namespace', 'storage'].forEach((e) => delete conversationStateStripped[e]);
  log(JSON.stringify(conversationState));
  // Loop through the list of users
  for (const conversationReference of Object.values(conversationStateStripped)) {
    await adapter.continueConversationAsync(process.env.MICROSOFT_APP_ID, conversationReference, async (context) => {
      log('context::::::');
      log(JSON.stringify(context));
      await context.sendActivity('proactive hello');
    });
  }
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
  res.end();
});

// export class TeamsBotPocYeomanBot extends MessageBot {
//   constructor(conversationState: ConversationState, userState: UserState) {
//     super(conversationState, userState);

//     this.onMembersAdded(async (context, next) => {
//       const membersAdded = context.activity.membersAdded;
//       if (membersAdded && membersAdded.length > 0) {
//         for (let cnt = 0; cnt < membersAdded.length; cnt++) {
//           if (membersAdded[cnt].id !== context.activity.recipient.id) {
//             await this.sendWelcomeCard(context);
//             log('sent a message');
//           }
//         }
//       }
//       await next();
//     });
//   }

//   public async sendWelcomeCard(context: TurnContext): Promise<void> {
//     const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
//     await context.sendActivity({ attachments: [welcomeCard] });
//   }
// }

export default {
  router
};
