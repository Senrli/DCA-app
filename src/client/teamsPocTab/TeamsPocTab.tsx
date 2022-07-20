import * as React from 'react';
import { Provider, Text, Button, Header, Divider, MoreIcon, Table, Flex, MenuButton } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
import { gridNestedBehavior, gridCellWithFocusableElementBehavior, gridCellMultipleFocusableBehavior } from '@fluentui/accessibility';

/**
 * Implementation of the teams poc Tab content page
 */
export const TeamsPocTab = () => {
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

  function generateClaimForm() {
    const generateFormURLDialogInfo = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/teamsPocTab/gform.html`,
      size: { height: 510, width: 424 },
      // fallbackURL: `${process.env.PUBLIC_HOSTNAME.env.PUBLIC_HOSTNAME}/teamsPocTab/gform.html`,
      title: `/teamsPocTab/gform.html`
    };
    // const generateFormCard = {
    //   title: "Generate Claim Form",
    //   url: `${process.env.PUBLIC_HOSTNAME}/teamsPocTab/gform.html`,
    //   width: 1024,
    //   height: 768,
    //   card:{
    //     "type": "AdaptiveCard",
    //     "body": [
    //         {
    //             "type": "TextBlock",
    //             "text": "Here is a ninja cat:"
    //         },
    //         {
    //             "type": "Image",
    //             "url": "http://adaptivecards.io/content/cats/1.png",
    //             "size": "Medium"
    //         }
    //     ],
    //     "version": "1.0"
    //   }
    // };

    dialog.open(generateFormURLDialogInfo);
    dialog.submit();
  }

  function handleRowClick(index) {
    alert(`OnClick on the row ${index} executed.`);
  }

  const header = {
    key: 'header',
    items: [
      { content: 'id', key: 'id' },
      { content: 'Name', key: 'name' },
      { content: 'Picture', key: 'pic' },
      { content: 'Age', key: 'action' },
      { content: 'Tags', key: 'tags' },
      { key: 'more options', 'aria-label': 'options' }
    ]
  };

  const moreOptionCell = {
    content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
    truncateContent: true,
    accessibility: gridCellWithFocusableElementBehavior,
    onClick: (e) => {
      alert('more option button clicked');
      e.stopPropagation();
    }
  };

  const moreActionCell = {
    content: (
      <Flex gap="gap.small" vAlign="center">
        <Button size="small" content="tag 1" />
        <Button size="small" content="tag 2" />
        {/* table layout not support now more content in the cell */}
        {/* <Button tabIndex={-1} icon="edit" circular text iconOnly title="edit tags" /> */}
      </Flex>
    ),
    accessibility: gridCellMultipleFocusableBehavior
  };

  const contextMenuItems = ['Add to selection', 'Remove', 'Download'];

  const rowsPlain = [
    {
      key: 1,
      items: [
        { content: '1', key: '1-1' },
        { content: 'Roman van von der Longername', key: '1-2', id: 'name-1' },
        { content: 'None', key: '1-3' },
        { content: '30 years', key: '1-4', id: 'age-1' },
        { key: '1-5', ...moreActionCell },
        { key: '1-6', ...moreOptionCell }
      ],
      onClick: () => handleRowClick(1),
      'aria-labelledby': 'name-1 age-1',
      children: (Component, { key, ...rest }) => (
        <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
      )
    },
    {
      key: 2,
      items: [
        { content: '2', key: '2-1' },
        { content: 'Alex', key: '2-2' },
        { content: 'None', key: '2-3' },
        { content: '1 year', key: '2-4' },
        { key: '2-5', ...moreActionCell },
        { key: '2-6', ...moreOptionCell }
      ],
      onClick: () => handleRowClick(2),
      children: (Component, { key, ...rest }) => (
        <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
      )
    },
    {
      key: 3,
      items: [
        { content: '3', key: '3-1' },
        { content: 'Ali', key: '3-2' },
        { content: 'None', key: '3-3' },
        { content: '30000000000000 years', truncateContent: true, key: '3-4' },
        { key: '3-5' },
        { key: '3-6', ...moreOptionCell }
      ],
      onClick: () => handleRowClick(3),
      children: (Component, { key, ...rest }) => (
        <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
      )
    }
  ];

  /**
   * The render() method to create the UI of the tab
   */
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
          <Header content="Discount Claims" />
        </Flex.Item>
        <Flex.Item>
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
        </Flex.Item>
        <Flex.Item>
          <Table
            variables={{ cellContentOverflow: 'none' }}
            header={header}
            rows={rowsPlain}
            aria-label="Nested navigation"
            accessibility={gridNestedBehavior}
          />
        </Flex.Item>
        <Flex.Item
          styles={{
            padding: '.8rem 0 .8rem .5rem'
          }}
        >
          <Text size="smaller" content="(C) Copyright Beep|SUTD" />
        </Flex.Item>
        <Flex
          fill={true}
          column={false}
          styles={{
            padding: '.8rem 0 .8rem .5rem'
          }}
        >
          <Flex.Item
            styles={{
              padding: '.8rem 0 .8rem .5rem'
            }}
          >
            <Text size="smaller" content="Stupid sia" />
          </Flex.Item>

          <Flex.Item
            styles={{
              padding: '.8rem 0 .8rem .5rem'
            }}
          >
            <Text size="smaller" content="Walao eh" />
          </Flex.Item>

          <Flex.Item
            styles={{
              padding: '.8rem 0 .8rem .5rem'
            }}
          >
            <Text size="smaller" content="wtf" />
          </Flex.Item>
        </Flex>
      </Flex>
    </Provider>
  );
};
