import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";

const mainContainer = document.getElementById('main-content');

const isDevelopment = document.documentElement.hasAttribute("development");

if (isDevelopment) {
    ReactDOM.render(<StrictMode><App /></StrictMode>, mainContainer);
} else {
    ReactDOM.render(<App />, mainContainer);
}

