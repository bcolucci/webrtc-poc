const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_CHAT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
} = process.env;

module.exports = ({ user, roomName }) => {
  const accessToken = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET
  );
  accessToken.identity = user.username;

  const videoGrant = new VideoGrant();
  videoGrant.room = roomName;
  accessToken.addGrant(videoGrant);

  const chatGrant = new ChatGrant({ serviceSid: TWILIO_CHAT_SID });
  accessToken.addGrant(chatGrant);

  return accessToken.toJwt();
};
