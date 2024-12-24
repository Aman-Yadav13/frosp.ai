import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/api/user";
import { getStatus } from "@/hooks/getStatus";
import { useUser } from "@/hooks/useUser";
import { HomePageContent } from "@/components/HomePageContent";

const HomePage = () => {
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

  // const onReplCreate = async () => {
  //   if (!replId || !language) {
  //     setError("Please enter a REPL name and select a language");
  //     return;
  //   }
  //   const payload = {
  //     replId,
  //     language,
  //   };

  //   console.log(payload);
  //   await axios.post(`${SERVICE_URL}/project`, payload);

  //   history(`/repl/${language}?replId=${replId}`);
  // };

  return (
    <main className="bg-gray-900 h-full w-full">
      <Navbar isLoginProcessed={isLoginProcessed} />
      <HomePageContent />
    </main>
  );
};

export default HomePage;
