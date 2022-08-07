# Discount Claim Manager
In collaboration with Beep and Mount Elizabeth Hospital

## Problem Statement
According to the discount quantum at Mount Elizabeth Hospital (MEH), a Discount Claim request will be raised by Business Office (BO) staff to corresponding levels of authority for verification and approval. Currently, the request submission sequence up the hierarchy is manual, requiring BO staff to manually route the discount claim request to the next level of authority. Messenger applications such as WhatsApp are used to remind BO staff to fill in their portion of the discount claim form throughout the approval process. The approval process is also not mobile-friendly as the existing platform is limited to a desktop-accessible browser which is also a factor that causes the delay in approvals. Typically, the actual request for approval is first handled informally to completion, before it is entered into the platform for audit records.


## Project Structure
```client:``` contains clients side TypeScript code

```manifest:``` contains the Microsoft Teams App manifest and icons

```public:``` contains static web site files

```server: ```contains server side code

## 

## Requirements
- Indicate the discount claim amount and generate the relevant discount claim form.
- Render iframe in Teams App to be able to show the discount claim form and fill in relevant details.
- Notify the next level of authority in the hierarchy that is required to fill in the form.
- Ability to upload files on Teams App which will be attached to that particular form.
- Dashboard to be able to see the state of all ongoing discount claim requests.

![Use Case Diagram](https://github.com/Senrli/DCA-app/blob/main/img/Teams%20Bot%20Use%20Case%20Diagram%20.svg)

## Discount Claim Flow
Requestor:
To make a discount claim, navigate to the Claims tab in the Discount Claim App and create a claim. Key in claimed amount, and then fill up the details in the respective form. Afterwards, send the form to the respective approver.

Approver:
Upon receiving a claim for approval, open the form, fill up any necessary details, and approve, reject or forward to the next approver.

## Proposed Solution
Mount Elizabeth Hospital often struggle to have an efficient and smooth discount claim approval process causing them to take a significantly longer time to complete the process. Therefore, our group has decided to deliver a tool that can automate the submission of discount requests to streamline BO's operations and allow approvals to be viewed and given on the go via the Microsoft Teams mobile app, with the ability to synchronize records on the existing platform.
<"insert sequential diagram">

## Set Up and Requirements
Please install the following packages:

Dependencies
``` bash
npm install
```

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

Ngrok
``` bash
npm i -g ngrok
```
Sign up at ngrok.com and obtain the authtoken. Fill up the token in the .env file under NGROK_AUTH

Run 

Duplicate <code>.env.example</code> file as <code>.env</code> at root folder

Populate <code>NGROK_AUTH</code> field with your NGROK_AUTH code

## Deployment
Gulp
*Ensure you are not on SUTD_Wifi
``` bash
gulp start-ngrok
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
    - In Azure portal, go to app -> Certificates & secrets. Create new client secret, and paste to "MICROSOFT_APP_PASSWORD" inside Botframework
- Add a Featured Channel → Microsoft Teams



To deploy teams:
- Go to [https://portal.azure.com](http://portal.azure.com) and login using ur E5 credentials. All 4 guest users have been added as owners
- Open menu from the top left corner and Select `Azure Active Directory`
- From the left side panel select `App registrations`
- Select the app inside (`teams-bot-poc-yeoman`) followed by `Expose an API`
- On top of the page, change Application ID URI to the current ngrok URL, format being: `api://<ngrok-address>/<teams-app-UUID(no need to change)>`. Click Save Upon changes:


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


Then in a new terminal
``` bash
gulp build
gulp manifest
gulp serve
```

In your browser, login to your Office/Teams account and navigate to your ngrok url. Click on the Teams link to be redirected to the Teams Bot. If debugging the app, you can sideload it:
1) Click on Apps -> Manage Apps -> Upload App
2) Choose your teamsbotpocyeoman.zip file which can be found under package folder
3) Proceed to add the app

### Docker Deployment
For local debugging of mongodb, deploy the docker container:
``` bash
docker -d compose up mongodb
```

## Useful Links and Documentation
* [Debugging with Visual Studio Code](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/vscode.md)
* [Developing with ngrok](https://github.com/pnp/generator-teams/blob/master/docs/docs/concepts/ngrok.md)
* [Developing with Github Codespaces](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/codespaces.md)
* [FluentUI React](https://developer.microsoft.com/en-us/fluentui#/controls/web)
* [FluentUI Northstar](https://fluentsite.z22.web.core.windows.net/)

