import pkg from 'agora-access-token';

const { RtcTokenBuilder, RtcRole } = pkg;

export const generateToken = async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.json({ success: true, token, appId, channelName });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
