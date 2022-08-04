import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { app, authentication, dialog } from '@microsoft/teams-js';

// https://www.pluralsight.com/guides/how-to-test-react-components-in-typescript
// https://handsonreact.com/docs/labs/ts/T6-TestingForms 

import { Generate } from "../Generate";


describe("<Generate />", () => {
  test("should display a blank form with a box to key in generate amount", async () => {
    // const { findByTestId } = render(< Generate />);
    // render(Generate);
    render(React.createElement(Generate, {}, null))

    // const generateForm = await findByTestId("generate-form");


  });
});





