import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage/HomePage";
import ReplPage from "./pages/ReplPage/ReplPage";
import ModalProvider from "./components/providers/modal-provider";
import HomeLayoutPage from "./pages/HomeLayoutPage/HomeLayoutPage";
import UserProjectsPage from "./pages/UserProjectsPage/UserProjectsPage";
import ProjectSettingsLayoutPage from "./pages/ProjectSettingsLayoutPage/ProjectSettingsLayoutPage";
import GeneralSettingsPage from "./pages/GeneralSettingsPage/GeneralSettingsPage";
import CollaboratorsSettingsPage from "./pages/CollaboratorsSettingsPage/CollaboratorsSettingsPage";
import InvitePage from "./pages/InvitePage/InvitePage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster position="top-center" />
        <ModalProvider />
        <Routes>
          <Route path="/" element={<HomeLayoutPage />}>
            <Route path="" element={<HomePage />} />
            <Route path="projects" element={<UserProjectsPage />} />
          </Route>
          <Route
            path="/projects/:projectId"
            element={<ProjectSettingsLayoutPage />}
          >
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route
              path="collaborators"
              element={<CollaboratorsSettingsPage />}
            />
          </Route>
          <Route path="/project/:userId/:projectId" element={<ReplPage />} />
          <Route
            path="/invite/:projectId/:inviteCode"
            element={<InvitePage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
