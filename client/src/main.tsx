import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="dark" storageKey="fixero-repl">
      <App />
    </ThemeProvider>
);
