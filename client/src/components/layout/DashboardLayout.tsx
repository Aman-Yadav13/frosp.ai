import { Navbar } from "../Navbar";
import { getStatus } from "@/hooks/getStatus";
import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "@/api/user";
import { useUser } from "@/hooks/useUser";

const DashboardLayout = (props: { children?: React.ReactNode }) => {
  const state = useUser((state) => state);
  const [isLoginProcessed, setIsLoginProcessed] = useState(false);
  const [isLoggedIn, _] = getStatus();

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

    sessionStorage.setItem("user", JSON.stringify(user.data));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      state.setIsLoggedIn(true);
      getUser();
    }
    setIsLoginProcessed(true);
  }, [getUser, isLoggedIn]);

  return (
    <main className="bg-gray-900 w-full h-auto min-h-[100vh]">
      <Navbar isLoginProcessed={isLoginProcessed} />
      {props.children}
    </main>
  );
};

export default DashboardLayout;