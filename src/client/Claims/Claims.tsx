import * as React from 'react';
import { Provider, Text, Button, Header, MoreIcon, Table, Flex, MenuButton, FlexItem, Checkbox, Label, ShorthandCollection, TableRowProps } from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication, dialog } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';
import { gridNestedBehavior, gridCellWithFocusableElementBehavior, gridCellMultipleFocusableBehavior } from '@fluentui/accessibility';
import { decode } from 'jsonwebtoken';

export const Claims = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();
  const [userId, setUserId] = useState<string>();

  let discountClaimAmount;

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
          setUserId(decoded.oid);
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

  function getDiscountClaimAmount() {
    return discountClaimAmount;
  }

  function setDiscountClaimAmount(newAmount) {
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
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriforma.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeA`
    };

    const redirectVeriformTypeB = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriformb.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeB`
    };

    const redirectVeriformTypeC = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriformc.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeC`
    };

    const redirectVeriformTypeD = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/veriformd.html`,
      size: { height: 768, width: 1024 },
      title: `VeriformTypeD`
    };

    const approvalDialog = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/approval.html`,
      size: { height: 768, width: 1024 },
      title: `Submit Discount Claim for Approval`
    };

    const seekApproval = (response) => {
      dialog.open(approvalDialog);
    };

    const submitHandler = (response) => {
      setDiscountClaimAmount(response.result.amount);
      if (discountClaimAmount <= 1500) {
        dialog.open(redirectVeriformTypeA, seekApproval);
      } else if (discountClaimAmount <= 5000) {
        dialog.open(redirectVeriformTypeB, seekApproval);
      } else if (discountClaimAmount <= 15000) {
        dialog.open(redirectVeriformTypeC, seekApproval);
      } else {
        dialog.open(redirectVeriformTypeD, seekApproval);
      }
    };

    dialog.open(generateFormURLDialogInfo, submitHandler);
  }

  function convertStatustoColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'REJECTED':
        return 'red';
      case 'APPROVED':
        return 'green';
      case 'UNKNOWN':
        return 'gray';
      default:
        return 'gray';
    }
  }

  function handleRowClick(index) {
    alert(`OnClick on the row ${index} executed.`);
  }

  function handleUpload(caseId: string) {
    const approvalDialog = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/uploadfile.html?caseId=${caseId}`,
      size: { height: 768, width: 1024 },
      title: `Upload and attach`
    };

    dialog.open(approvalDialog);
  }

  function handleAttach(caseId: string) {
    const Dialog = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/uploadfile.html?caseId=${caseId}`,
      size: { height: 768, width: 1024 },
      title: `Attach from repository`
    };

    dialog.open(Dialog);
  }

  function handleView(caseId: string) {
    const Dialog = {
      url: `https://${process.env.PUBLIC_HOSTNAME}/Claims/uploadfile.html?caseId=${caseId}`,
      size: { height: 768, width: 1024 },
      title: `View attachments`
    };

    dialog.open(Dialog);
  }

  const menuCell = (caseId: string) => ({
    content: (
      <MenuButton
        trigger={<Button icon={<MoreIcon />} text iconOnly aria-label="Click button" />}
        pointing
        menu={[
          { content: 'Upload and attach', onClick: () => handleUpload(caseId) },
          { content: 'Attach from repository', onClick: () => handleAttach(caseId) },
          { content: 'View attachments', onClick: () => handleView(caseId) }
        ]}
        on="click"
      />
    ),
    onClick: (e) => {
      e.stopPropagation();
    }
  });

  const checkBoxCell = {
    content: <Checkbox></Checkbox>,
    onClick: (e) => {
      alert('check box button clicked');
      e.stopPropagation();
    }
  };

  const statusCell = (StatusType: string) => ({
    content: (
      <Label
        color={`${(status: string) => {
          switch (status) {
            case 'PENDING':
              return 'yellow';
            case 'REJECTED':
              return 'red';
            case 'APPROVED':
              return 'green';
            case 'UNKNOWN':
              return 'gray';
            default:
              return 'gray';
          }
        }}}`}
        content={`${StatusType}`}
      />
    ),
    truncateContent: true,
    accessibility: gridCellWithFocusableElementBehavior
  });

  const pendingCell = {
    content: <Label color={'yellow'} content={'Pending'} />,
    truncateContent: true,
    accessibility: gridCellWithFocusableElementBehavior,
    onClick: (e) => {
      alert('pendingCell clicked');
      e.stopPropagation();
    }
  };

  const approvedCell = {
    content: <Label color={'green'} content={'Approved'} />,
    truncateContent: true,
    accessibility: gridCellWithFocusableElementBehavior,
    onClick: (e) => {
      alert('approvedCell clicked');
      e.stopPropagation();
    }
  };

  const rejectedCell = {
    content: <Label color={'red'} content={'Rejected'} />,
    truncateContent: true,
    accessibility: gridCellWithFocusableElementBehavior,
    onClick: (e) => {
      alert('rejectedCell clicked');
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
      { content: 'Case ID', key: 'id' },
      { content: 'Patient Name', key: 'name' },
      { content: 'Requestor', key: 'requestor' },
      { content: 'Creator', key: 'creator' },
      { content: 'Current Approver', key: 'approver' },
      { content: 'Status', key: 'status' },
      { key: 'more options', 'aria-label': 'options' }
    ]
  };

  const contextMenuItems = ['Add to selection', 'Remove', 'Download'];

  async function generateTableContent() {
    const response = await fetch(`https://${process.env.PUBLIC_HOSTNAME}/api/claims/user`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ userId }) // body data type must match "Content-Type" header
    });

    const resData = await response.json();

    const rowsPlain: Partial<ShorthandCollection<TableRowProps>> = [];
    resData.forEach((row) => {
      const index = resData.indexOf(row);
      const rowPlain = {
        key: `${index + 1}`,
        items: [
          { key: `${index + 1}-0`, ...checkBoxCell },
          { content: `${row.caseId}`, key: `${index + 1}-1` },
          { content: `${row.patientName}`, key: `${index + 1}-2` },
          { content: `${row.requestor.displayName}`, key: `${index + 1}-3` },
          { content: `${row.creator.displayName}`, key: `${index + 1}-4` },
          { content: `${row.approver.displayName}`, key: `${index + 1}-5` },
          { key: `${index + 1}-6`, ...statusCell(row.status) },
          { key: `${index + 1}-7`, ...menuCell('0') }
        ],
        // onClick: () => handleRowClick(1),
        'aria-labelledby': 'name-1 age-1'
        // children: (Component, { key, ...rest }) => (
        //   <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
        // )
      };
      rowsPlain.push(rowPlain);
    });
    return rowsPlain;
  }

  const rowsPlain = [
    {
      key: 1,
      items: [
        { key: '1-0', ...checkBoxCell },
        { content: '73891123', key: '1-1' },
        { content: 'Carina Collins', key: '1-2' },
        { content: 'Jamie Lim', key: '1-3' },
        { content: 'Robert Tan, BO Novena', key: '1-4' },
        { content: 'Dr John Low, Novena', key: '1-5' },
        { key: '1-6', ...pendingCell },
        { key: '1-7', ...menuCell('0') }
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
        { content: '73891124', key: '2-1' },
        { content: 'Alex', key: '2-2' },
        { content: 'Jamie Lim', key: '2-3' },
        { content: 'Robert Tan, BO Novena', key: '2-4' },
        { content: 'Dr John Low, Novena', key: '1-5' },
        { key: '2-6', ...rejectedCell },
        { key: '2-7', ...menuCell('0') }
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
        { content: '73891125', key: '3-1' },
        { content: 'Alex', key: '3-2' },
        { content: 'Jamie Lim', key: '3-3' },
        { content: 'Robert Tan, BO Novena', key: '3-4' },
        { content: 'Dr John Low, Novena', key: '3-5' },
        { key: '3-6', ...approvedCell },
        { key: '3-7', ...menuCell('0') }
      ],
      onClick: () => handleRowClick(3),
      children: (Component, { key, ...rest }) => (
        <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
      )
    },
    {
      key: 4,
      items: [
        { key: '4-0', ...checkBoxCell },
        { content: '73891126', key: '4-1' },
        { content: 'Alex', key: '4-2' },
        { content: 'Jamie Lim', key: '4-3' },
        { content: 'Robert Tan, BO Novena', key: '4-4' },
        { content: 'Dr John Low, Novena', key: '4-5' },
        { key: '4-6', ...approvedCell },
        { key: '4-7', ...menuCell('0') }
      ],
      onClick: () => handleRowClick(3),
      children: (Component, { key, ...rest }) => (
        <MenuButton menu={contextMenuItems} key={key} contextMenu trigger={<Component {...rest} />} />
      )
    },
    {
      key: 5,
      items: [
        { key: '5-0', ...checkBoxCell },
        { content: '73891127', key: '5-1' },
        { content: 'Alex', key: '5-2' },
        { content: 'Jamie Lim', key: '5-3' },
        { content: 'Robert Tan, BO Novena', key: '5-4' },
        { content: 'Dr John Low, Novena', key: '5-5' },
        { key: '5-6', ...approvedCell },
        { key: '5-7', ...menuCell('0') }
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
    <Provider
      theme={theme}
      style={{
        backgroundColor: '#f5f5f5'
      }}
    >
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
          <Header as="h2" content="Submitted Discount Claims" description={`Hello ${name}, here are all claims made so far`} />
          <FlexItem push>
            <Button content="+ Request Discount" primary onClick={generateClaimForm}></Button>
          </FlexItem>
        </Flex>

        <div>
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
            rows={JSON.stringify(generateTableContent())}
            aria-label="Nested navigation"
            accessibility={gridNestedBehavior}
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        </Flex.Item>
        <Flex.Item
          styles={{
            // top right bottom left
            padding: '.8rem 0 .8rem .5rem'
          }}
        >
          <Text size="smaller" content="(C) Copyright Beep|SUTD" />
        </Flex.Item>
      </Flex>
    </Provider>
  );
};
