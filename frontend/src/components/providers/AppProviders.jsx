"use client";

import { AuthSessionProvider } from "@/features/auth/session/AuthSessionContext";

export default function AppProviders({ children }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
