import * as React from 'react';
import { Provider, Flex, Text, Button, Header, Divider } from '@fluentui/react-northstar';
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

  }

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

        <div><Header>Enter new customer information:</Header></div>

          <form onSubmit={this.handleSubmit}>
            <label>
              Name:
              <input type="text" value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        
          {/* <form>
              <div>
                  <div class="form-group form-field-input" style="margin-bottom: 10px; margin-top: 10px"></div><label for="name">Name: </label><input class="form-control input-field" id="name" type="text" placeholder="first and last" name="name" tabindex="1" autofocus>
                  <div class="form-group form-field-input" style="margin-bottom: 10px;"></div><label for="email">Email: </label><input class="form-control input-field" id="email" type="email" placeholder="name@email.com" name="email" tabindex="2">
                  <div class="form-group form-field-input" style="margin-bottom: 10px;"></div><label for="favoriteBook">Favorite book: </label><input class="form-control input-field" id="favoriteBook" type="text" placeholder="title of book" name="favoriteBook" tabindex="3">
                  <div class="form-group form-field-input" style="margin-bottom: 10px;"></div><label for="pw">Password: </label><input class="form-control input-field" id="pw" type="password" name="password" tabindex="4">
                  <div class="form-group form-field-input" style="margin-bottom: 10px;"></div><label for="pw2">Confirm password: </label><input class="form-control input-field" id="pw2" type="password" name="confirmPassword" style="margin-bottom: 10px;" tabindex="4"><button class="btn button-primary" type="submit" tabindex="5">Sign up</button>
              </div>
          </form> */}

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
