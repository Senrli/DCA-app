import { TeamsMsal2Provider } from '@microsoft/mgt-teams-msal2-provider';
import * as React from 'react';
import { Provider, Flex, Text } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import * as MicrosoftTeams from '@microsoft/teams-js/dist/MicrosoftTeams';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const TabAuth = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  TeamsMsal2Provider.microsoftTeamsLib = MicrosoftTeams;
  TeamsMsal2Provider.handleAuth();

  useEffect(() => {
    if (inTeams === true) {
      authentication
        .getAuthToken({
          resources: [process.env.TAB_APP_URI as string],
          silent: false
        } as authentication.AuthTokenRequestParameters)
        .then((token) => {
          const decoded: { [key: string]: any } = jwtDecode(token) as { [key: string]: any };
          setName(decoded.name);
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

  return (
    <Provider theme={theme}>
      <Flex
        fill={true}
        column
        styles={{
          padding: '.8rem 0 .5rem .5rem'
        }}
      >
        <Flex.Item
          styles={{
            padding: '.8rem 0 .5rem .5rem'
          }}
        >
          <div>Loading…</div>
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
