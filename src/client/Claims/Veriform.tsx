import * as React from 'react';
import { Provider, Flex, Text } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const Veriform = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (inTeams === true) {
      const result = authentication
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
          <div>
            <div>
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScZD6XMlLvg1f7ts5vuX1C0JTM-2_3CIhw0zHUDLWaZTV4uTQ/viewform?embedded=true"
                width="640"
                height="1050"
                frameBorder="0"
              >
                Loading…
              </iframe>
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
