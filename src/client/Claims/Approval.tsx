import * as React from 'react';
import { Provider, Flex, Text, Button, Header } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const Approval = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();
  const [returnVal, setReturnVal] = useState<string>();
  const [jsonData, setJsonData] = useState<string>();

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
          setReturnVal(token.toString()); // write return values
          console.log(token.toString());
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

  const getUsers = async () => {
    fetch('/app/token?token=' + returnVal)
      .then((json) => json.json())
      .then((json) => {
        setJsonData(JSON.stringify(json, undefined, 2));
      });
  };

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
          <div>
            <div>
              <Header content="Approval Page" />
              <Text content={`RESULT: ${returnVal}`} />
            </div>
            {error && (
              <div>
                <Text content={`An SSO error occurred ${error}`} />
              </div>
            )}
          </div>
        </Flex.Item>
        <Button content="Get all members" primary onClick={getUsers}></Button>
        <div>
          <Text content={jsonData}></Text>
        </div>
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
