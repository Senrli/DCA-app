import * as React from 'react';
import { Provider, Flex, Text, Form, FormInput, FormButton, Input, Button } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

export const UploadFile = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [isFilePicked, setIsFilePicked] = useState(false);

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

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList) return;
    setSelectedFile(fileList[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {
    if (selectedFile) {
      const formData = new FormData();

      formData.append('File', selectedFile, selectedFile.name);

      fetch('https://freeimage.host/api/1/upload?key=<YOUR_API_KEY>', {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('Success:', result);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
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
          <div>
            <Input label="Upload a file to SharePoint" type="file" onChange={changeHandler} />
            {selectedFile ? (
              <div>
                <p>Filename: {selectedFile.name}</p>
                <p>Filetype: {selectedFile.type}</p>
                <p>Size in bytes: {selectedFile.size}</p>
                <p>
                  Last Modified Date:{' '}
                  {new Date(selectedFile.lastModified).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ) : (
              <p>Select a file to show details</p>
            )}
            <div>
              <Button content="Upload" primary disabled={isFilePicked} onClick={handleSubmission} />
            </div>
          </div>
        </Flex.Item>
      </Flex>

      <Flex
        fill={true}
        column
        styles={{
          padding: '0 0 .8rem .5rem'
        }}
      >
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
