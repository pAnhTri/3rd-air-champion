import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Private from "./routes/Private.tsx";
import Authorization from "./components/destkop/Authorization.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Private>
              <App />
            </Private>
          }
        />
        <Route path="/login" element={<Authorization />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
