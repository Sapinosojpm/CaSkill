import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { AdminDashboardPage } from "./admin/AdminDashboardPage";
import { CheatFlagsPage } from "./admin/CheatFlagsPage";
import { SubmissionReviewDetailPage } from "./admin/SubmissionReviewDetailPage";
import { SubmissionReviewListPage } from "./admin/SubmissionReviewListPage";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { CreatorDashboardPage } from "./creator/CreatorDashboardPage";
import { CreatorGuidePage } from "./creator/CreatorGuidePage";
import { CreatorIdePage } from "./creator/CreatorIdePage";
import { CreatorSubmissionDetailPage } from "./creator/CreatorSubmissionDetailPage";
import { MySubmissionsPage } from "./creator/MySubmissionsPage";
import { UploadGamePage } from "./creator/UploadGamePage";
import { CatalogPage } from "./games/CatalogPage";
import { GameDetailPage } from "./games/GameDetailPage";
import { LandingPage } from "./games/LandingPage";
import { LeaderboardPage } from "./games/LeaderboardPage";
import { NotFoundPage } from "./games/NotFoundPage";
import { PlayGamePage } from "./games/PlayGamePage";
import { ProfilePage } from "./games/ProfilePage";
import { StorePage } from "./games/StorePage";
import { RequireAuth } from "../components/guards/RequireAuth";
import { RequireRole } from "../components/guards/RequireRole";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/games" element={<CatalogPage />} />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
        <Route path="/games/:gameId/play" element={<PlayGamePage />} />
        <Route path="/leaderboards/:gameId" element={<LeaderboardPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/store"
          element={
            <RequireRole allowedRoles={["PLAYER"]}>
              <StorePage />
            </RequireRole>
          }
        />
        <Route
          path="/creator"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <CreatorDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/creator/guide"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <CreatorGuidePage />
            </RequireRole>
          }
        />
        <Route
          path="/creator/ide"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <CreatorIdePage />
            </RequireRole>
          }
        />
        <Route
          path="/creator/upload"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <UploadGamePage />
            </RequireRole>
          }
        />
        <Route
          path="/creator/submissions"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <MySubmissionsPage />
            </RequireRole>
          }
        />
        <Route
          path="/creator/submissions/:submissionId"
          element={
            <RequireRole allowedRoles={["CREATOR", "ADMIN"]}>
              <CreatorSubmissionDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <SubmissionReviewListPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/submissions/:submissionId"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <SubmissionReviewDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/cheat-flags"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <CheatFlagsPage />
            </RequireRole>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}


