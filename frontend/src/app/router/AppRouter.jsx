import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "../../features/auth/pages/AuthPage";
import StatsPage from "../../features/stats/pages/StatsPage";
import GameEntryPage from "../../features/game/pages/GameEntryPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/records" element={<StatsPage />} />
      <Route path="/games/new" element={<GameEntryPage />} />
    </Routes>
  );
}

export default AppRouter;
