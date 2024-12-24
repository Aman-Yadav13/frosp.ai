import { getLoginStatus } from "@/api/user";
import { useCallback, useEffect, useState } from "react";

export const getStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const getStatus = useCallback(async () => {
    try {
      const status = await getLoginStatus();
      setIsLoggedIn(status.data.isLoggedIn);
    } catch (error) {
      return null;
    }
  }, []);

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  return [isLoggedIn, setIsLoggedIn];
};
