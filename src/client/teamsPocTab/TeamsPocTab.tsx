import * as React from 'react';
import { Provider, Flex, Text, Button, Header, Divider } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

// import * as constants from "./constants";
// import { cardTemplates, appRoot } from "./dialogs/CardTemplates";
// import { taskModuleLink } from "./utils/DeepLinks";

/**
 * Implementation of the teams poc Tab content page
 */
export const TeamsPocTab = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (inTeams === true) {
      authentication
        .getAuthToken({
          resources: [process.env.TAB_APP_URI as string],
          silent: false
        } as authentication.AuthTokenRequestParameters)
        .then((token) => {
          const decoded: { [key: string]: any } = jwtDecode(token) as { [key: string]: any };
          setName(decoded!.name);
          app.notifySuccess();
        })
        .catch((message) => {
          setError(message);
          app.notifyFailure({
            reason: app.FailedReason.AuthFailed,
            message
          });
        });
    } else {
      setEntityId('Not in Microsoft Teams');
    }
  }, [inTeams]);

  useEffect(() => {
    if (context) {
      setEntityId(context.page.id);
    }
  }, [context]);

  dialog.initialize();

  function generateClaimForm() {
    const taskModuleInfo = {
      title: `fuck senrui`,
      url: `${process.env.PUBLIC_HOSTNAME}/teamsPocTab/gform.html`,
      width: 1024,
      height: 768
    };

    dialog.submit(taskModuleInfo);
  }

  /**
   * The render() method to create the UI of the tab
   */
  return (
    <Provider theme={theme}>
      <Flex
        fill={true}
        column
        styles={{
          padding: '.8rem 0 .8rem .5rem'
        }}
      >
        <Flex.Item>
          <Header content="Discount Claims" />
        </Flex.Item>
        <Flex.Item>
          <div>
            <div>
              <Text content={`Hello ${name}`} />
            </div>
            <div>
              <Button content="Generate Discount Form" primary onClick={generateClaimForm}></Button>
            </div>
            {error && (
              <div>
                <Text content={`An SSO error occurred ${error}`} />
              </div>
            )}
          </div>
        </Flex.Item>
        <Flex.Item
          styles={{
            padding: '.8rem 0 .8rem .5rem'
          }}
        >
          <Text size="smaller" content="(C) Copyright Beep|SUTD" />
        </Flex.Item>
      </Flex>
    </Provider>
  );
};
