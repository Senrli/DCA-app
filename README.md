# Discount Claim Manager
In collaboration with Beep and Mount Elizabeth Hospital

## Problem Statement
<"insert text here">

## Requirements
<"insert text here">
<"insert usecase diagram">

## Discount Claim Flow
<"insert text here">

## Proposed Solution
<"insert text here">
<"insert sequential diagram">

## Set Up

### First Installation 
Please install the following packages:

Yeoman Generator 
``` bash
npm i -g yo
```

Gulp.js 
``` bash
npm i -g gulp-cli
```

MS Teams Generator for Yeoman 
``` bash
npm i -g generator-teams
```

Duplicate <code>.env.example</code> file as <code>.env</code> at root folder

Populate <code>NGROK_AUTH</code> field with your NGROK_AUTH code

### Local Deployment
Gulp
*Ensure you are not on SUTD_Wifi
``` bash
gulp start-ngrok
```

Obtain [NGROK] PUBLIC_HOSTNAME such as: <code>9c08-122-11-212-135.ap.ngrok.io</code>

Copy this into .env file in the following fields:
``` bash
PUBLIC_HOSTNAME={PUBLIC_HOSTNAME}
TAB_APP_URI=api://{PUBLIC_HOSTNAME}/10ffefdd-0fe2-4f6b-8560-0774b80b54d2
```

for example,
``` bash
PUBLIC_HOSTNAME=9c08-122-11-212-135.ap.ngrok.io
...
TAB_APP_URI=api://9c08-122-11-212-135.ap.ngrok.io/10ffefdd-0fe2-4f6b-8560-0774b80b54d2
```

To deploy bot:
- Go to page [https://dev.botframework.com/bots/new](https://dev.botframework.com/bots/new) to create a new bot profile using the test env account
    - Fill up display name, long description,
    - App type: Single Tenant
    - Click on “Manage Microsoft App ID and Password”
    - Sign in onto Azure portal using env account to create new Azure AD app registration
    - Bot handle is any random string identifiable as a handle, between 1 and 35 chars
    - Copy Application (client) ID and paste to “App id” inside Botframework
    - Copy Directory (tenant) ID and paste to “App Tenant ID” inside Botframework
- Add a Featured Channel → Microsoft Teams

To deploy teams:
- Go to [https://portal.azure.com](http://portal.azure.com) and login using ur E5 credentials. All 4 guest users have been added as owners
- Open menu from the top left corner and Select `Azure Active Directory`
- From the left side panel select `App registrations`
- Select the app inside (`teams-bot-poc-yeoman`) followed by `Expose an API`
- On top of the page, change Application ID URI to the current ngrok URL, format being: `api://<ngrok-address>/<teams-app-UUID(no need to change)>`. Click Save Upon changes:

Then in a new terminal
``` bash
gulp build
gulp manifest
gulp serve
```

### Docker Deployment
<"insert text here">

### Requirements
<"insert list of NPM packages and node modules">

## Code Architecture
<"insert text maybe diagram here">

## 

## Useful Links and Documentation
* [Debugging with Visual Studio Code](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/vscode.md)
* [Developing with ngrok](https://github.com/pnp/generator-teams/blob/master/docs/docs/concepts/ngrok.md)
* [Developing with Github Codespaces](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/codespaces.md)
* [FluentUI React](https://developer.microsoft.com/en-us/fluentui#/controls/web)
* [FluentUI Northstar](https://fluentsite.z22.web.core.windows.net/)


Generated Using Yo Teams Yeoman Microsoft Teams Apps generator