import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ReplPage from "./pages/ReplPage/ReplPage";
import ModalProvider from "./components/providers/modal-provider";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster position="top-center" />
        <ModalProvider />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/repl/:language" element={<ReplPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
