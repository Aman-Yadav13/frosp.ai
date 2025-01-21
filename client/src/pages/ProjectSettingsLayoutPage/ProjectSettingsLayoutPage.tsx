import ProjectSettingsLayout from "@/components/layout/ProjectSettingsLayout";
import { Outlet } from "react-router-dom";

const ProjectSettingsLayoutPage = () => {
  return (
    <ProjectSettingsLayout>
      <Outlet />
    </ProjectSettingsLayout>
  );
};

export default ProjectSettingsLayoutPage;
