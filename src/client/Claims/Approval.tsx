import * as React from 'react';
import { Provider, Flex, Text, Form, FormButton, Button, Header } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
import { PeoplePicker  } from '@microsoft/mgt-react';

export const Approval = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  const [returnVal, setReturnVal] = useState<string>();
  const [jsonData, setJsonData] = useState<string>();

  const [people, setPeople] = useState([]);

  const handleSelectionChanged = (e) => {
    setPeople(e.target.selectedPeople);
  };


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

  const handleSubmit = (event) => {
    // event.preventDefault();
    // const dialogOutput = {
    //   amount: event.target.discountClaimAmount.value
    // };
    // dialog.submit(dialogOutput);
  };

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
          <Text weight="bold" content="Discount Claim Created!" />
        </Flex.Item>

        <Flex.Item
          styles={{
            padding: '.8rem 0 .5rem .5rem'
          }}
        >
          <div>
            <div>

              <Text content="Please select approvers for this case." />
              <PeoplePicker selectionChanged={handleSelectionChanged} />

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
            padding: '.5rem 0 0 .5rem'
          }}
        >
          <Form onSubmit={handleSubmit}>
            <FormButton type="submit" content="Submit For Approval" primary />
          </Form>
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
