import ProjectSettingsLayout from "@/components/layout/ProjectSettingsLayout";
import { withProtectedRoute } from "@/hoc/withProtectedRoute";
import { Outlet } from "react-router-dom";

const ProjectSettingsLayoutPage = () => {
  return (
    <ProjectSettingsLayout>
      <Outlet />
    </ProjectSettingsLayout>
  );
};

const protectedProjectSettingsLayoutPage = withProtectedRoute(ProjectSettingsLayoutPage);
export default protectedProjectSettingsLayoutPage;