import React from "react";
import { Navbar } from "../Navbar";
import { getCurrentUser } from "@/api/user";
import { getStatus } from "@/hooks/getStatus";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect, useCallback } from "react";

const HomeLayout = (props: { children?: React.ReactNode }) => {
  const state = useUser((state) => state);
  const [isLoginProcessed, setIsLoginProcessed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = getStatus();

  const getUser = useCallback(async () => {
    const user = await getCurrentUser();
    if (user) {
      state.setUserInfo({
        _id: user.data._id,
        email: user.data.email,
        fullName: user.data.fullName,
        username: user.data.username,
        updatedAt: user.data.updatedAt,
        createdAt: user.data.createdAt,
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      state.setIsLoggedIn(true);
      getUser();
    }
    setIsLoginProcessed(true);
  }, [getUser, isLoggedIn]);
  return (
    <main className="bg-gray-900 w-full h-full">
      <Navbar isLoginProcessed={isLoginProcessed} />
      {props.children}
    </main>
  );
};

export default HomeLayout;
