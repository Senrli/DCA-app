import { ConversationState, UserState, TeamsActivityHandler, TurnContext, StatePropertyAccessor } from 'botbuilder';
// import { Dialog, DialogState } from 'botbuilder-dialogs';
import * as debug from 'debug';
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

    function addConversationReference(activity): void {
      const conversationReference = TurnContext.getConversationReference(activity);
      conversationState[conversationReference.conversation.id] = conversationReference;
    }

    this.onConversationUpdate(async (context, next) => {
      addConversationReference(context.activity);

      await next();
    });

    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      //   addConversationReference(context.activity);
      // Echo back what the user said
      log(context);
      await context.sendActivity(`You sent '${context.activity.text}'  \nCommand Not Recognized`); // Use Markdown Syntax with two spaces before newline
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      log(membersAdded);
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const welcomeMessage = 'Welcome to the Discount Claim Bot!';
          await context.sendActivity(welcomeMessage);
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  public async run(context): Promise<void> {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}
