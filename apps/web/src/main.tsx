import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./app/router";
import "@galipette/ui/globals.css";
import "./index.css";
import "./app/styles/app.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root mount element in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
