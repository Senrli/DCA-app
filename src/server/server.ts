import Express from 'express';
import * as http from 'http';
import * as path from 'path';
import morgan from 'morgan';
import { MsTeamsApiRouter, MsTeamsPageRouter } from 'express-msteams-host';
import debug from 'debug';
import dotenv from 'dotenv';
import compression from 'compression';

// import {
//   CardFactory,
//   CloudAdapter,
//   ConfigurationServiceClientCredentialFactory,
//   createBotFrameworkAuthenticationFromConfiguration
// } from 'botbuilder';

// import DiscountClaimRequestCard from './teamsBotPocYeomanBot/cards/discountClaimRequestCard';
// import { MessageBot } from './teamsBotPocYeomanBot/messageBot';

// The import of components has to be done AFTER the dotenv config
// eslint-disable-next-line import/first
import * as allComponents from './TeamsAppsComponents';
import TeamsBotPocYeomanBot from './teamsBotPocYeomanBot/TeamsBotPocYeomanBot';
import app from './app/app';

// Initialize debug logging module
const log = debug('msteams');

log('Initializing Microsoft Teams Express hosted App...');

// Initialize dotenv, to use .env file settings if existing
dotenv.config();

// Create the Express webserver
const express = Express();
const port = process.env.port || process.env.PORT || 3007;

// Create router for the bot services
const router = Express.Router();

// Inject the raw request body onto the request object
express.use(
  Express.json({
    verify: (req, res, buf: Buffer, encoding: string): void => {
      (req as any).rawBody = buf.toString();
    }
  })
);
express.use(Express.urlencoded({ extended: true }));

// Express configuration
express.set('views', path.join(__dirname, '/'));

// Add simple logging
express.use(morgan('tiny'));

// Add compression - uncomment to remove compression
express.use(compression());

// Add /scripts and /assets as static folders
express.use('/scripts', Express.static(path.join(__dirname, 'web/scripts')));
express.use('/assets', Express.static(path.join(__dirname, 'web/assets')));

// routing for bots, connectors and incoming web hooks - based on the decorators
// For more information see: https://www.npmjs.com/package/express-msteams-host
express.use(MsTeamsApiRouter(allComponents));

// routing for pages for tabs and connector configuration
// For more information see: https://www.npmjs.com/package/express-msteams-host
express.use(
  MsTeamsPageRouter({
    root: path.join(__dirname, 'web/'),
    components: allComponents
  })
);

// Set default web page
express.use(
  '/',
  Express.static(path.join(__dirname, 'web/'), {
    index: 'index.html'
  })
);

express.use('/', router);

// Set the port
express.set('port', port);

// Set the endpoints for the bot
router.use('/bot', TeamsBotPocYeomanBot.router);

// Set the endpoints for the app backend
router.use('/app', app.router);

// Start the webserver
http.createServer(express).listen(port, () => {
  log(`Server running on ${port}`);
});
