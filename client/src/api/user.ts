import API_CLIENT from ".";

export const loginUser = async (payload: {
  email: string;
  username: string;
  password: string;
}) => {
  const response = await API_CLIENT.post("/user/login", payload);
  return response.data;
  //return response.data.data.user
};

export const registerUser = async (payload: {
  email: string;
  username: string;
  password: string;
  fullName: string;
}) => {
  const response = await API_CLIENT.post("/user/register", payload);
  return response.data;
};

export const logoutUser = async () => {
  await API_CLIENT.post("/user/logout");
};

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await API_CLIENT.post("/user/change-password", payload);
  return response.data;
};

export const updateAccount = async (payload: {
  email: string;
  fullName: string;
}) => {
  const response = await API_CLIENT.patch("/user/update-account", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API_CLIENT.get("/user/current-user");
  return response.data;
};

export const refreshToken = async () => {
  const response = await API_CLIENT.post("/user/refresh-token");
  // const { accessToken } = response.data?.data || {};

  // if (accessToken) {
  //   document.cookie = `accessToken=${accessToken}; path=/; secure; HttpOnly;`;
  // }

  return response.data;
};

export const getLoginStatus = async () => {
  const response = await API_CLIENT.get("/user/get-login-status");
  return response.data;
};
