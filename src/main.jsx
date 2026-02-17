import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore";

useAuthStore.getState().initialize();

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, sans-serif",
  components: {
    Button: {
      defaultProps: {
        size: "md",
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>
);
