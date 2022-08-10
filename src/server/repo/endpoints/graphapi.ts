import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Request, Router } from 'express';
import debug from 'debug';

const log = debug('graphapi');

const router = Router();

const port = '<PORT_NUMBER>';
const tenantId = '<TENANT_ID>';
const clientId = '<CLIENT_ID>';
const clientSecret = '<CLIENT_SECRET>';
const scopes = '<SCOPE>';
const redirectUri = `http://localhost:${process.env.PORT}/authresponse`;
const authorityHost = 'https://login.microsoftonline.com';

export const callGraphApi = async (input: string) => {
  const credential = new ClientSecretCredential(process.env.MICROSOFT_APP_TENANT_ID, process.env.TAB_APP_ID, process.env.TAB_APP_PASSWORD);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, { scopes: [process.env.TAB_APP_SCOPE] });
  const client = Client.initWithMiddleware({
    debugLogging: true,
    authProvider
  });
  const res = await client.api(`${input}`).get();
  log(res);
  return res;
};

router.get('/graph', async (req, res) => {
  log('Run graph api test');
  try {
    const result = await callGraphApi(req.body.cmd);
    res.status(200).send(result);
  } catch (err) {
    log('Encountered an error:\n\n', err);
    res.status(500).send(err);
  }
});

export default {
  callGraphApi,
  router
};
