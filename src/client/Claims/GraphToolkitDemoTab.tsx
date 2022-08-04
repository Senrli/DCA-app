import { Providers } from '@microsoft/mgt-element';
import { TeamsMsal2Provider, HttpMethod } from '@microsoft/mgt-teams-msal2-provider';
import * as MicrosoftTeams from '@microsoft/teams-js';
import * as React from 'react';
import { Provider, Flex, Text } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
import { Person, PeoplePicker, TeamsChannelPicker, Tasks, ViewType, Todo, People, Agenda, File } from '@microsoft/mgt-react';

export const GraphToolkitDemoTab = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  TeamsMsal2Provider.microsoftTeamsLib = MicrosoftTeams;

  Providers.globalProvider = new TeamsMsal2Provider({
    clientId: process.env.TAB_APP_ID as string,
    authPopupUrl: `https://${process.env.PUBLIC_HOSTNAME as string}/tabauth.html`,
    scopes: [
      'user.read',
      'user.read.all',
      'mail.readBasic',
      'people.read',
      'people.read.all',
      'sites.read.all',
      'user.readbasic.all',
      'contacts.read',
      'presence.read',
      'presence.read.all',
      'tasks.readwrite',
      'tasks.read',
      'calendars.read',
      'group.read.all'
    ],
    ssoUrl: `https://${process.env.PUBLIC_HOSTNAME as string}/app/token`,
    httpMethod: HttpMethod.POST
  });

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
          <div>
            <Person person-query="me" view={ViewType.twolines} person-card="click" show-presence></Person>
            <PeoplePicker></PeoplePicker>
            <TeamsChannelPicker></TeamsChannelPicker>
            <Tasks></Tasks>
            <Agenda group-by-day></Agenda>
            <People show-presence></People>
            <Todo></Todo>
            <File></File>
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
