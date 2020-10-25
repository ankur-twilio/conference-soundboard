/**
 *
 * Voice_token.js
 * Twilio 2020 – Soundboard Blog
 * 
 * This Function is generates a Voice Token 
 * for our soundboard dashboard. 
 *
 */

 exports.handler = function(context, event, callback) {
  const response = new Twilio.Response();
  const IDENTITY = "soundboard_operator"; // This is not secure. Use auth in other real apps.
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader("Content-Type", "application/json");

  const AccessToken = Twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const accessToken = new AccessToken(context.ACCOUNT_SID, context.API_KEY, context.API_SECRET);

  accessToken.identity = IDENTITY;

  const grant = new VoiceGrant({
    outgoingApplicationSid: context.TWIML_APP_SID
  });

  accessToken.addGrant(grant);

  response.setBody({
    identity: IDENTITY,
    token: accessToken.toJwt()
  });

  callback(null, response);
};
