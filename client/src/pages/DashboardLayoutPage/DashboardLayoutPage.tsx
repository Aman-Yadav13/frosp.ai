import DashboardLayout from "@/components/layout/DashboardLayout";
import { withProtectedRoute } from "@/hoc/withProtectedRoute";
import { Outlet } from "react-router-dom";

const DashboardLayoutPage = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const protectedDashboardLayoutPage = withProtectedRoute(DashboardLayoutPage);
export default protectedDashboardLayoutPage;
