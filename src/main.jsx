import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import App from "./app";
import "remixicon/fonts/remixicon.css";
import "@mdi/font/css/materialdesignicons.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./shared/styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
