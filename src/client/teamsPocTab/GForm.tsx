import * as React from 'react';
import { Provider, Flex, Text, Button, Header, Divider } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
/**
 * This component is used to display the required
 * terms of use statement which can be found in a
 * link in the about tab.
 */
// class GForm extends React.Component {
//   render() {
//     return (
//       <html lang="en">
//         <head>⋮</head>
//         <body>
//           <div id="embed-container">
//             <iframe
//               title="My Daily Marathon Tracker"
//               src="https://docs.google.com/forms/d/e/1FAIpQLScZD6XMlLvg1f7ts5vuX1C0JTM-2_3CIhw0zHUDLWaZTV4uTQ/viewform?embedded=true"
//               width="640"
//               height="947"
//               frameBorder="0"
//             >
//               正在加载…
//             </iframe>
//           </div>
//         </body>
//       </html>
//     );
//   }
// }

// TODO: Dynamically get the iframe part and then render

export const GForm = () => {
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
          padding: '.8rem 0 .8rem .5rem'
        }}
      >
        <Flex.Item>
          <Header content="HELLOWORLD" />
        </Flex.Item>
        {/* <Flex.Item>
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
        </Flex.Item> */}
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
