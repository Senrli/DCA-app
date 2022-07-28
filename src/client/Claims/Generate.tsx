import * as React from 'react';
import { 
  Provider, 
  Flex, 
  Text, 
  Form,
  FormInput,
  FormButton
} from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const Generate = () => {
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

  dialog.initialize();

  const handleSubmit = event => {
    event.preventDefault(); 
    var dialogOutput = {
      amount: event.target.discountClaimAmount.value
    };
    dialog.submit(dialogOutput);
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

      <Form onSubmit={handleSubmit} >
        <Text weight="bold" content="Discount Claim Amount"/>
        <FormInput 
          label="SGD S$" 
          name="discountClaimAmount" 
          id="discountClaimAmount" 
          type="number" 
          min="0" 
          showSuccessIndicator={false}
          inline 
          required 
        />
        <FormButton type="submit" content="Submit" primary />
      </Form>


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
