import * as React from 'react';
import { Provider, Flex, Text } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const VeriformB = () => {
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

  const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement => input !== null && input.tagName === 'IFRAME';

  function sendToIframe(data) {
    const frame = document.getElementById('deadbeef');
    if (isIFrame(frame) && frame.contentWindow) {
      console.log(`sending`);
      console.log(frame.contentWindow);
      frame.contentWindow.postMessage(data, '*');
    }
  }

  const caseData = {
    caseId: '3c77253b-44a2-4349-a963-93d97e991466',
    caseNo: 287,
    caseTemplateId: 'q0y5rdmiml',
    entityCode: 'B7427675',
    created: {
      id: 'd60a4662-9ceb-49b8-92c5-1644719f7fea',
      userId: 'f12129be-3233-4eda-bce5-f5121ef2338a',
      userName: 'B7427675_VERIFORM_API_USER',
      userRole: 'doctor',
      description: 'Case instance created',
      timestamp: {
        $date: {
          $numberLong: '1659691774910'
        }
      }
    },
    updated: {
      id: 'd60a4662-9ceb-49b8-92c5-1644719f7fea',
      userId: 'f12129be-3233-4eda-bce5-f5121ef2338a',
      userName: 'B7427675_VERIFORM_API_USER',
      userRole: 'doctor',
      description: 'Case instance created',
      timestamp: {
        $date: {
          $numberLong: '1659691774910'
        }
      }
    },
    forms: [
      {
        formId: 'gbdpf8CqUK',
        formTemplateId: 'h2NFZtSfc-',
        title: 'Discount Form (Up to $1500)',
        status: 'PENDING'
      }
    ],
    responses: [
      {
        responseId: '34m6jEXTKe',
        formId: 'gbdpf8CqUK'
      }
    ],
    variables: [],
    patientDid: ''
  };

  window.addEventListener(
    'message', // don't change this
    (event) => {
      // TODO: Block external message (!important) if (event.origin !== 'interactor_origin') { }
      const data = event.data;
      switch (data.type) {
        case 'CLOSE':
          // to close the iframe
          break;
        case 'LOADED':
          // do something when iframe finishes loading
          break;
        case 'CREATED':
          sendToIframe({
            type: 'CASE',
            user: {
              id: '437a2f8d-e443-47d2-9f74-68d03d6e70ab',
              name: 'B5221505_VERIFORM_API_USER',
              role: 'doctor'
            },
            case: caseData
          });
          break;
        case 'SIGNED':
          // do something when the forms are signed
          break;
        // any other case that you may need
        default:
      }
    },
    false
  );

  useEffect(() => {
    console.log('useeffect');
    sendToIframe({
      type: 'CASE',
      user: {
        id: '437a2f8d-e443-47d2-9f74-68d03d6e70ab',
        name: 'B5221505_VERIFORM_API_USER',
        role: 'doctor'
      },
      case: caseData
    });
  }, []);

  sendToIframe({
    type: 'CASE',
    user: {
      id: '437a2f8d-e443-47d2-9f74-68d03d6e70ab',
      name: 'B5221505_VERIFORM_API_USER',
      role: 'doctor'
    },
    case: caseData
  });

  return (
    <Provider theme={theme}>
      <Flex
        fill={true}
        column
        styles={{
          padding: '.8rem 0 .5rem 1rem'
        }}
      >
        <Flex.Item
          styles={{
            padding: '.8rem 0 .5rem 1rem'
          }}
        >
          <div>
            <div>
              {/* <iframe id="deadbeef" src="https://monumental-selkie-94ebd6.netlify.app/" width="640" height="1050" frameBorder="0"> */}
              <iframe
                width="960px"
                height="768px"
                src="https://forms.office.com/Pages/ResponsePage.aspx?id=KTd0xeeDiU-SqN8X4R2MC5_IrrSpBBdPjHngAWsYFchUQVpHUDgzV040VU5aTTBFVTlCWDdOTjJLTS4u&embed=true"
                frameBorder="0"
                style={{
                  border: 'none'
                }}
                allowFullScreen
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
            padding: '.8rem 0 .8rem 1rem'
          }}
        >
          <Text size="smaller" content="(C) Copyright Beep|SUTD" />
        </Flex.Item>
      </Flex>
    </Provider>
  );
};
