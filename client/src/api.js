const JSON_TYPE = "application/json";

const DEFAULT_HEADERS = {
  Accept: JSON_TYPE,
  "Content-Type": JSON_TYPE
};

const authHeader = authToken => ({ Authorization: `Bearer ${authToken}` });

export const SERVER_URL = `https://${location.hostname}:3001`;

export const fetchUser = async authToken => {
  try {
    const res = await fetch(`${SERVER_URL}/me`, {
      headers: {
        ...DEFAULT_HEADERS,
        ...authHeader(authToken)
      }
    });
    if (res.status !== 200) {
      return null;
    }
    return res.json();
  } catch (err) {
    return null;
  }
};

export const signIn = async ({ username, password }) => {
  try {
    const res = await fetch(`${SERVER_URL}/auth`, {
      method: "POST",
      headers: {
        ...DEFAULT_HEADERS
      },
      body: JSON.stringify({ username, password })
    });
    if (res.status !== 200) {
      return null;
    }
    return res.json();
  } catch (err) {
    return null;
  }
};

export const fetchAccessToken = async ({ authToken, roomName }) => {
  try {
    const res = await fetch(`${SERVER_URL}/token?roomName=${roomName}`, {
      headers: {
        ...DEFAULT_HEADERS,
        ...authHeader(authToken)
      }
    });
    if (res.status !== 200) {
      return null;
    }
    return res.json();
  } catch (err) {
    return null;
  }
};
