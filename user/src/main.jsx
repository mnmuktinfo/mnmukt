import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import { HelmetProvider } from "react-helmet-async";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { queryClient, idbPersister } from "./lib/queryClient";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: idbPersister,
        maxAge: 1000 * 60 * 30,
        buster: "v1",
      }}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
