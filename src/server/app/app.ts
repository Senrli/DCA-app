import * as debug from 'debug';
import * as express from 'express';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { oboRequest, oboSuccessRespnse, oboFailResponse } from '../../lib/accessToken';

// Initialize debug logging module
const log = debug('msteams');

// Initialize router for express
const router = express.Router();

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
    const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

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
