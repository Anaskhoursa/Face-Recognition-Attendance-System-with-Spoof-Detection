const jwt = require("jsonwebtoken");
const fs = require('fs')

const privateKey = fs.readFileSync('./Key 12_6_2025, 2_34_51 PM.pk', 'utf8');


function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

function generateJitsiToken(user, roomId, isModerator = false) {
  const payload = {
    aud: "jitsi",
    iss: "chat",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
    nbf: Math.floor(Date.now() / 1000),
    sub: 'vpaas-magic-cookie-af14ee6b9535490ab98f4552fcbbe618',
    room: '*',
    context: {
      user: {
        id: user.id.toString(),
        name: user.first_name,
        email: user.email || '',
        avatar: '',
        moderator: isModerator,
        'hidden-from-recorder': false,
      },
      "features": {
        "livestreaming": true,
        "file-upload": true,
        "outbound-call": true,
        "sip-outbound-call": false,
        "transcription": true,
        "list-visitors": false,
        "recording": true,
        "flip": false
      }
    }
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: {
      kid: "vpaas-magic-cookie-af14ee6b9535490ab98f4552fcbbe618/dff0ee",
      typ: 'JWT',
      alg:'RS256'
    }
  });

  console.log(token)

  return token;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateJitsiToken
};
