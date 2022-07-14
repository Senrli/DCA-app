import * as React from 'react';
/**
 * This component is used to display the required
 * terms of use statement which can be found in a
 * link in the about tab.
 */
class GForm extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>⋮</head>
        <body>
          <div id="embed-container">
            <iframe
              title="My Daily Marathon Tracker"
              src="https://docs.google.com/forms/d/e/1FAIpQLScZD6XMlLvg1f7ts5vuX1C0JTM-2_3CIhw0zHUDLWaZTV4uTQ/viewform?embedded=true"
              width="640"
              height="947"
              frameBorder="0"
            >
              正在加载…
            </iframe>
          </div>
        </body>
      </html>
    );
  }
}

// TODO: Dynamically get the iframe part and then render

export default GForm;
