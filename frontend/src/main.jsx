import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@app/providers/AuthProvider";
import env from "@config/env";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
