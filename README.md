# teams bot poc yeoman - Microsoft Teams App

## Set-up 
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

## Deployment
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

IGNORE BELOW
//////////////////////////////////////////////////////////////////////////////////////////////////////////////



## Getting started with Microsoft Teams Apps development

Head on over to [Microsoft Teams official documentation](https://developer.microsoft.com/en-us/microsoft-teams) to learn how to build Microsoft Teams Tabs or the [Microsoft Teams Yeoman generator docs](https://github.com/PnP/generator-teams/docs) for details on how this solution is set up.

## Project setup

All required source code are located in the `./src` folder:

* `client` client side code
* `server` server side code
* `public` static files for the web site
* `manifest` for the Microsoft Teams app manifest

For further details see the [Yo Teams documentation](https://github.com/PnP/generator-teams/docs)

## Building the app

The application is built using the `build` Gulp task.

``` bash
npm i -g gulp-cli
gulp build
```

## Building the manifest

To create the Microsoft Teams Apps manifest, run the `manifest` Gulp task. This will generate and validate the package and finally create the package (a zip file) in the `package` folder. The manifest will be validated against the schema and dynamically populated with values from the `.env` file.

``` bash
gulp manifest
```

## Deploying the manifest

Using the `yoteams-deploy` plugin, automatically added to the project, deployment of the manifest to the Teams App store can be done manually using `gulp tenant:deploy` or by passing the `--publish` flag to any of the `serve` tasks.

## Configuration

Configuration is stored in the `.env` file.

## Debug and test locally

To debug and test the solution locally you use the `serve` Gulp task. This will first build the app and then start a local web server on port 3007, where you can test your Tabs, Bots or other extensions. Also this command will rebuild the App if you change any file in the `/src` directory.

``` bash
gulp serve
```

To debug the code you can append the argument `debug` to the `serve` command as follows. This allows you to step through your code using your preferred code editor.

``` bash
gulp serve --debug
```

## Useful links

* [Debugging with Visual Studio Code](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/vscode.md)
* [Developing with ngrok](https://github.com/pnp/generator-teams/blob/master/docs/docs/concepts/ngrok.md)
* [Developing with Github Codespaces](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/codespaces.md)

## Additional build options

You can use the following flags for the `serve`, `ngrok-serve` and build commands:

* `--no-linting` or `-l` - skips the linting of Typescript during build to improve build times
* `--debug` - builds in debug mode and significantly improves build time with support for hot reloading of client side components
* `--env <filename>.env` - use an alternate set of environment files
* `--publish` - automatically publish the application to the Teams App store

## Deployment

The solution can be deployed to Azure using any deployment method.

* For Azure Devops see [How to deploy a Yo Teams generated project to Azure through Azure DevOps](https://www.wictorwilen.se/blog/deploying-yo-teams-and-node-apps/)
* For Docker containers, see the included `Dockerfile`

## Logging

To enable logging for the solution you need to add `msteams` to the `DEBUG` environment variable. See the [debug package](https://www.npmjs.com/package/debug) for more information. By default this setting is turned on in the `.env` file.

Example for Windows command line:

``` bash
SET DEBUG=msteams
```

If you are using Microsoft Azure to host your Microsoft Teams app, then you can add `DEBUG` as an Application Setting with the value of `msteams`.
# DCA-app
