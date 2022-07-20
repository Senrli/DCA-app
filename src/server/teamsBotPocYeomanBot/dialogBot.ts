import { ContentIcon } from '@fluentui/react-northstar';
import { ConversationState, UserState, TeamsActivityHandler, TurnContext, CardFactory } from 'botbuilder';
import { MainDialog } from './dialogs/mainDialog';
import DiscountClaimRequestCard from './cards/discountClaimRequestCard';

export class DialogBot extends TeamsActivityHandler {
  public dialogState: any;

  constructor(public conversationState: ConversationState, public userState: UserState, public dialog: MainDialog) {
    super();
    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty('DialogState');

    this.onMessage(async (context, next) => {
      // Shows discount claim request adaptive card given any command
      const discountClaimRequestCard = CardFactory.adaptiveCard(DiscountClaimRequestCard);
      await context.sendActivity({ attachments: [discountClaimRequestCard] });
      // Run the MainDialog with the new message Activity.
      await this.dialog.run(context, this.dialogState);
      await next();
    });
  }

  public async run(context: TurnContext) {
    await super.run(context);
    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}
