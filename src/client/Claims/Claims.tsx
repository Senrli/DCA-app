import * as React from 'react';
import {
  Provider,
  Text,
  Button,
  Header,
  Divider,
  MoreIcon,
  Table,
  Flex,
  MenuButton,
  FlexItem,
  Checkbox,
  getParent
} from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
import { gridNestedBehavior, gridCellWithFocusableElementBehavior, gridCellMultipleFocusableBehavior } from '@fluentui/accessibility';

/**
 * Implementation of the teams poc Tab content page
 */
export const Claims = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();
  var discountClaimAmount;

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

  function getDiscountClaimAmount(){
    return discountClaimAmount;
  }

  function setDiscountClaimAmount(newAmount){
    discountClaimAmount = newAmount;
  }

  dialog.initialize();

  function generateClaimForm() {
    const generateFormURLDialogInfo = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/generate.html`,
      size: { height: 768, width: 1024 },
      title: `Generate Forms`
    };

    const redirectVeriformTypeA = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriform.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeA`
    }

    const redirectVeriformTypeB = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriform.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeB`
    }

    const redirectVeriformTypeC = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriform.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeC`
    }

    const submitHandler = (response) => {
      setDiscountClaimAmount(response.result.amount);
      if (discountClaimAmount <= 5000){
        dialog.open(redirectVeriformTypeA);
      } else if (discountClaimAmount <= 10000){
        dialog.open(redirectVeriformTypeB);
      } else {
        dialog.open(redirectVeriformTypeC);
      }
      
    };  
  

    dialog.open(generateFormURLDialogInfo, submitHandler);
    // dialog.submit();
  }

  function handleRowClick(index) {
    alert(`OnClick on the row ${index} executed.`);
  }

  const checkBoxCell = {
    content: <Checkbox></Checkbox>,
    onClick: (e) => {
      alert('check box button clicked');
      e.stopPropagation();
    }
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

  const header = {
    key: 'header',
    items: [
      { key: 'select', ...checkBoxCell },
      { content: 'id', key: 'id' },
      { content: 'Name', key: 'name' },
      { content: 'Picture', key: 'pic' },
      { content: 'Age', key: 'action' },
      { content: 'Tags', key: 'tags' },
      { key: 'more options', 'aria-label': 'options' }
    ]
  };

  const contextMenuItems = ['Add to selection', 'Remove', 'Download'];

  const rowsPlain = [
    {
      key: 1,
      items: [
        { key: '1-0', ...checkBoxCell },
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
        { key: '2-0', ...checkBoxCell },
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
        { key: '3-0', ...checkBoxCell },
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
        <Flex
          fill={true}
          hAlign="start"
          vAlign="center"
          column={false}
          styles={{
            padding: '.8rem .8rem .8rem .5rem'
          }}
        >
          <Header content="Submitted Discount Claims" />
          <FlexItem push>
            <Button content="+ Request Discount" primary onClick={generateClaimForm}></Button>
          </FlexItem>
        </Flex>

        <div>
          <div>
            <Text content={`Hello ${name}, here are all claims made so far`} />
          </div>
          {error && (
            <div>
              <Text content={`An SSO error occurred ${error}`} />
            </div>
          )}
        </div>

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
      </Flex>
    </Provider>
  );
};
