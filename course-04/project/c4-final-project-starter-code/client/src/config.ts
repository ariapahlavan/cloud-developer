// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '79ny7bsibg'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-udcwlacpvjdpr2o0.us.auth0.com',  // Auth0 domain
  clientId: 'nMqKygWwbUhJ8pJxQHEqNFD01jQC8WcE', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
