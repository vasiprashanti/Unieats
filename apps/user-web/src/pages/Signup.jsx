import React from "react";
import AuthPage from "../components/auth/AuthPage";

export default function Signup() {
  return <AuthPage initialMode="signup" roleLabel="User" />;
}