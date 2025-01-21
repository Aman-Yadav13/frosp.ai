import HomeLayout from "@/components/layout/HomeLayout";
import { Outlet } from "react-router-dom";

const HomeLayoutPage = () => {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
};

export default HomeLayoutPage;
