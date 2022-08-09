import debug from 'debug';
import * as express from 'express';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { oboRequest, oboSuccessRespnse, oboFailResponse } from '../../lib/accessToken';

import * as msal from '@azure/msal-node';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import jwtDecode from 'jwt-decode';

// Initialize debug logging module
const log = debug('msteams');

// Initialize router for express
const router = express.Router();

// ------------------------------------------ Code below is copied

/**
 * Validates a JWT
 * @param {Request} req - The incoming request
 * @param {Response} res - The outgoing response
 * @returns {Promise<string | null>} - Returns the token if valid, returns null if invalid
 */
function validateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const ssoToken = authHeader.split(' ')[1];
  if (ssoToken) {
    const validationOptions = {
      audience: process.env.TAB_APP_ID
    };
    jwt.verify(ssoToken, getSigningKey, validationOptions, (err, payload) => {
      if (err) {
        return res.sendStatus(403);
      }
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

/**
 * Parses the JWT header and retrieves the appropriate public key
 * @param {JwtHeader} header - The JWT header
 * @param {SigningKeyCallback} callback - Callback function
 */
function getSigningKey(header: JwtHeader, callback: SigningKeyCallback): void {
  const client = jwksClient({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/keys'
  });
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err, undefined);
    } else {
      callback(null, key.getPublicKey());
    }
  });
}

/**
 * Gets an access token for the user using the on-behalf-of flow
 * @param authHeader - The Authorization header value containing a JWT bearer token
 * @returns {Promise<string | null>} - Returns the access token if successful, null if not
 */
async function getAccessTokenOnBehalfOf(req: Request, res: Response): Promise<void> {
  // The token has already been validated, just grab it
  const authHeader = req.headers.authorization;
  const ssoToken = authHeader.split(' ')[1];
  log(`REQ BODY: ${JSON.stringify(req.body)}`);
  log(`SSO TOKEN: ${ssoToken}`);

  // Create an MSAL client
  const msalClient = new msal.ConfidentialClientApplication({
    auth: {
      clientId: req.body.clientid,
      clientSecret: process.env.TAB_APP_PASSWORD
    }
  });

  const scopeExtracted = ['.default'];
  log(`SCOPES: ${JSON.stringify(req.body.scopes)}`);
  // log(typeof req.body.scopes);
  try {
    const result = await msalClient.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${jwtDecode<any>(ssoToken).tid}`,
      oboAssertion: ssoToken,
      scopes: scopeExtracted,
      skipCache: true
    });

    res.json({ access_token: result?.accessToken });
  } catch (error) {
    log(`ERROR: ${JSON.stringify(error)}`);
    if (error.errorCode === 'invalid_grant' || error.errorCode === 'interaction_required') {
      // This is expected if it's the user's first time running the app ( user must consent ) or the admin requires MFA
      res.status(403).json({ error: 'consent_required' }); // This error triggers the consent flow in the client.
    } else {
      // Unknown error
      res.status(500).json({ error: error.message });
    }
  }
}

// An example for using POST and with token validation using middleware
router.post('/token', validateJwt, async (req, res) => {
  log('someone called /token endpoint!');
  await getAccessTokenOnBehalfOf(req, res);
});

// ------------------------------------------------------- Code above is copied

function toQueryString(queryParams) {
  const encodedQueryParams = [];
  for (const key in queryParams) {
    encodedQueryParams.push(key + '=' + encodeURIComponent(queryParams[key]));
  }
  return encodedQueryParams.join('&');
}

router.get('/token', async (req, res) => {
  const tToken = req.query.token.toString();
  if (!tToken) {
    res.status(500).send('No Token');
    return;
  } else {
    log('\x1b[33m%s\x1b[0m', 'Easy peasy Token from Teams...');
    log('-----------------------------------------');
    log(tToken);
    log('\x1b[32m', '-----------------------------------------');
  }

  const oboPromise = new Promise((resolve, reject) => {
    const url = `https://login.microsoftonline.com/${jwtDecode<any>(tToken).tid}/oauth2/v2.0/token`;

    const config: AxiosRequestConfig = {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const params: oboRequest = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: process.env.TAB_APP_ID,
      client_secret: process.env.TAB_APP_PASSWORD,
      scope: process.env.TAB_APP_SCOPE,
      requested_token_use: 'on_behalf_of',
      assertion: tToken
    };

    axios.post(url, toQueryString(params), config).then((result: AxiosResponse<oboFailResponse>) => {
      if (result.status !== 200) {
        reject(new Error(JSON.stringify({ error: result.data.error })));
      } else {
        resolve(result.data);
      }
    });
  });

  oboPromise.then(
    (result: oboSuccessRespnse) => {
      log('\x1b[36m%s\x1b[0m', ' Oh my heavens, it is the access token! ');
      log('-----------------------------------------');
      log(result.access_token);
      log('\x1b[32m', '-----------------------------------------');

      const config: AxiosRequestConfig = {
        headers: {
          accept: 'application/json',
          authorization: 'bearer ' + result.access_token
        }
      };

      // graph call using the access token
      axios.get<MicrosoftGraph.User>('https://graph.microsoft.com/v1.0/me/', config).then((result) => {
        log(result.data);
        res.send(result.data);
      });
    },
    (err) => {
      log(err); // Error:
      res.send(err);
    }
  );
});

export default {
  router
};
