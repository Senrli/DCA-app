import { User } from '../repo/models/user';
import { ConversationState, UserState, TeamsActivityHandler, TurnContext, Activity, TeamsInfo } from 'botbuilder';
// import { Dialog, DialogState } from 'botbuilder-dialogs';
import debug from 'debug';
import { callGraphApi } from '../repo/endpoints/graphapi';
import { createNewUser, queryUserbyId, UpdateUserInfo } from '../repo/endpoints/user';
// Initialize debug logging module
const log = debug('msteams');

export class MessageBot extends TeamsActivityHandler {
  private conversationState: ConversationState;
  private userState: UserState;
  public conversationReferences1: any;
  // private dialog: Dialog;
  // private dialogState: StatePropertyAccessor<DialogState>;

  /**
   *
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */

  constructor(conversationState: ConversationState, userState: UserState) {
    super();
    // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
    this.conversationReferences1 = conversationState;

    if (!conversationState) {
      throw new Error('[DialogBot]: Missing parameter. conversationState is required');
    }
    if (!userState) {
      throw new Error('[DialogBot]: Missing parameter. userState is required');
    }
    // if (!dialog) {
    //   throw new Error('[DialogBot]: Missing parameter. dialog is required');
    // }

    this.conversationState = conversationState;
    this.userState = userState;
    // this.dialog = dialog;
    // this.dialogState = this.conversationState.createProperty<DialogState>('DialogState');

    this.onConversationUpdate(async (context, next) => {
      // log('onConversationUpdate:::');
      // log(context);
      addConversationReference(context.activity);

      await next();
    });

    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      addConversationReference(context.activity);
      // Echo back what the user said
      log(context);
      await context.sendActivity(`You sent '${context.activity.text}'  \nCommand Not Recognized`); // Use Markdown Syntax with two spaces before newline
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      // addConversationReference(context.activity);
      log(`MembersAdded Context: ${context}`);

      const teamsUserInfo = await TeamsInfo.getMember(context, context.activity.from.id);
      log(`UserID: ${teamsUserInfo.id}`);
      let userData;
      try {
        userData = await callGraphApi(`/users/${teamsUserInfo.email}`);
      } catch (err) {
        log('onMessage grph api failed', err.stack);
      }

      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const existingUser = await queryUserbyId(userData.id);
          if (!existingUser) {
            // Meaning the user has not been using the App before
            const welcomeMessage = 'Welcome to the Discount Claim Bot!';
            await context.sendActivity(welcomeMessage);
          } else {
            // Meaning the user has used the App before
            const welcomeMessage = 'Welcome back to the Discount Claim Bot!';
            await context.sendActivity(welcomeMessage);
          }
          if (userData) {
            // If the graph api returns properly with user info
            // Craft new user entry

            const newUserData: User = {
              userId: userData.id,
              mail: userData.mail,
              displayName: userData.displayName,
              conversationReference: TurnContext.getConversationReference(context.activity)
            };

            log(`newuserdata: ${JSON.stringify(newUserData)}`);

            if (!existingUser) {
              log('user does not exist, will create a new one');
              const result = await createNewUser(newUserData);
              log(`CreateNewUser Result: ${result}`);
            } else {
              log('user exists, will update info');
              const result = await UpdateUserInfo(newUserData);
              log(`UpdateUser Result: ${result}`);
            }
          } else {
            log('user data not found on graph api!');
          }

          log('context, onMembersAdded:::');
          log(JSON.stringify(context));
          // await (dialog as MainDialog).run(context, conversationState.createProperty<DialogState>('DialogState'));
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await this.conversationState.saveChanges(context, true);
      await this.userState.saveChanges(context, true);
      log(`storageKey: ${this.conversationState.getStorageKey(context)}`);
      log(`${this.userState.getStorageKey(context)}`);
      await next();
    });

    function addConversationReference(activity: Partial<Activity>): void {
      const conversationReference = TurnContext.getConversationReference(activity);
      conversationState[conversationReference.conversation.id] = conversationReference;
      log(`ConversationReference: ${JSON.stringify(conversationReference)}`);
    }
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  public async run(context: TurnContext): Promise<void> {
    await super.run(context);

    // log(`Override ActivityHandler.run() context: ${JSON.stringify(context)}`);
    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}
