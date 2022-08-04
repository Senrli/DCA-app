import * as React from 'react';
import { Provider, Flex, Text, Form, FormButton, Button, Header } from '@fluentui/react-northstar';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { IBasePickerSuggestionsProps, NormalPeoplePicker, ValidationState } from '@fluentui/react/lib/Pickers';
import { people, mru } from '@fluentui/example-data';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import { app, authentication } from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  mostRecentlyUsedHeaderText: 'Suggested Contacts',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading',
  showRemoveButtons: true,
  suggestionsAvailableAlertText: 'People Picker Suggestions available',
  suggestionsContainerAriaLabel: 'Suggested contacts'
};

export const Approval = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();
  const [returnVal, setReturnVal] = useState<string>();
  const [jsonData, setJsonData] = useState<string>();

  const [delayResults, setDelayResults] = React.useState(false);
  const [mostRecentlyUsed, setMostRecentlyUsed] = React.useState<IPersonaProps[]>(mru);
  const [peopleList, setPeopleList] = React.useState<IPersonaProps[]>(people);

  const picker = React.useRef(null);

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
          setReturnVal(token.toString()); // write return values
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

  const getUsers = async () => {
    fetch('/app/token?token=' + returnVal)
      .then((json) => json.json())
      .then((json) => {
        setJsonData(JSON.stringify(json, undefined, 2));
      });
  };

  function doesTextStartWith(text: string, filterText: string): boolean {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  }

  function listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]) {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter((item) => item.text === persona.text).length > 0;
  }

  function removeDuplicates(personas: IPersonaProps[], possibleDupes: IPersonaProps[]) {
    return personas.filter((persona) => !listContainsPersona(persona, possibleDupes));
  }

  function convertResultsToPromise(results: IPersonaProps[]): Promise<IPersonaProps[]> {
    return new Promise<IPersonaProps[]>((resolve, reject) => setTimeout(() => resolve(results), 2000));
  }

  function getTextFromItem(persona: IPersonaProps): string {
    return persona.text as string;
  }

  function validateInput(input: string): ValidationState {
    if (input.indexOf('@') !== -1) {
      return ValidationState.valid;
    } else if (input.length > 1) {
      return ValidationState.warning;
    } else {
      return ValidationState.invalid;
    }
  }

  const filterPersonasByText = (filterText: string): IPersonaProps[] => {
    return peopleList.filter((item) => doesTextStartWith(item.text as string, filterText));
  };

  const filterPromise = (personasToReturn: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (delayResults) {
      return convertResultsToPromise(personasToReturn);
    } else {
      return personasToReturn;
    }
  };

  const returnMostRecentlyUsed = (currentPersonas: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> => {
    return filterPromise(removeDuplicates(mostRecentlyUsed, currentPersonas));
  };

  const onFilterChanged = (
    filterText: string,
    currentPersonas: IPersonaProps[],
    limitResults?: number
  ): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText) {
      let filteredPersonas: IPersonaProps[] = filterPersonasByText(filterText);

      filteredPersonas = removeDuplicates(filteredPersonas, currentPersonas);
      filteredPersonas = limitResults ? filteredPersonas.slice(0, limitResults) : filteredPersonas;
      return filterPromise(filteredPersonas);
    } else {
      return [];
    }
  };

  const onRemoveSuggestion = (item: IPersonaProps): void => {
    const indexPeopleList: number = peopleList.indexOf(item);
    const indexMostRecentlyUsed: number = mostRecentlyUsed.indexOf(item);

    if (indexPeopleList >= 0) {
      const newPeople: IPersonaProps[] = peopleList.slice(0, indexPeopleList).concat(peopleList.slice(indexPeopleList + 1));
      setPeopleList(newPeople);
    }

    if (indexMostRecentlyUsed >= 0) {
      const newSuggestedPeople: IPersonaProps[] = mostRecentlyUsed
        .slice(0, indexMostRecentlyUsed)
        .concat(mostRecentlyUsed.slice(indexMostRecentlyUsed + 1));
      setMostRecentlyUsed(newSuggestedPeople);
    }
  };

  /**
   * Takes in the picker input and modifies it in whichever way
   * the caller wants, i.e. parsing entries copied from Outlook (sample
   * input: "Aaron Reid <aaron>").
   *
   * @param input The text entered into the picker.
   */
  function onInputChange(input: string): string {
    const outlookRegEx = /<.*>/g;
    const emailAddress = outlookRegEx.exec(input);

    if (emailAddress && emailAddress[0]) {
      return emailAddress[0].substring(1, emailAddress[0].length - 1);
    }

    return input;
  }

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
              <NormalPeoplePicker
                onResolveSuggestions={onFilterChanged}
                onEmptyInputFocus={returnMostRecentlyUsed}
                getTextFromItem={getTextFromItem}
                pickerSuggestionsProps={suggestionProps}
                className={'ms-PeoplePicker'}
                key={'normal'}
                onRemoveSuggestion={onRemoveSuggestion}
                onValidateInput={validateInput}
                selectionAriaLabel={'Selected contacts'}
                removeButtonAriaLabel={'Remove'}
                inputProps={{
                  onBlur: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onBlur called'),
                  onFocus: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onFocus called'),
                  'aria-label': 'People Picker'
                }}
                componentRef={picker}
                onInputChange={onInputChange}
                resolveDelay={300}
              />
            </div>
            {error && (
              <div>
                <Text content={`An SSO error occurred ${error}`} />
              </div>
            )}
          </div>
        </Flex.Item>
        <Button content="Get all members" primary onClick={getUsers}></Button>
        <div>
          <Text content={jsonData}></Text>
        </div>

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
