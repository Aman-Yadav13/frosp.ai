import axios from "axios";

export const API_CLIENT = axios.create({
  baseURL:
    import.meta.env.VITE_INIT_SERVICE_API || "http://localhost:3001/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API_CLIENT.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest.__isRetryRequest &&
      originalRequest.url !== "/user/refresh-token"
    ) {
      originalRequest.__isRetryRequest = true;

      try {
        await refreshAccessToken();
        return API_CLIENT(originalRequest);
      } catch (refreshError) {
        try {
          await refreshAccessToken();
          return API_CLIENT(originalRequest);
        } catch (finalRefreshError) {
          await forceLogoutUser();
          return Promise.reject(finalRefreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const refreshAccessToken = async () => {
  try {
    const response = await API_CLIENT.post("/user/refresh-token");
    return response.data?.data;
  } catch (error) {
    throw error;
  }
};

export const forceLogoutUser = async () => {
  try {
    await API_CLIENT.post("/user/forceLogout");
  } catch (error) {
    console.error("Failed to log out:", error);
  } finally {
    // window.location.href = "/login";
  }
};

export default API_CLIENT;
