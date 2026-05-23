import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/userSlice";

import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import EventTypesPage from "./pages/EventTypesPage";
import EventTypeEditPage from "./pages/EventTypeEditPage";
import AvailabilityListPage from "./pages/AvailabilityListPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingsPage from "./pages/BookingsPage";
import TeamsPage from "./pages/TeamsPage";
import AppsPage from "./pages/AppsPage";
import RoutingPage from "./pages/RoutingPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import InsightsPage from "./pages/InsightsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";

function ProtectedRoutes() {
  const loggedIn = useSelector((s) => s.user.loggedIn);
  if (!loggedIn) return <Navigate to="/" replace />;
  return <DashboardLayout />;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/event-types" element={<EventTypesPage />} />
        <Route path="/event-types/:id" element={<EventTypeEditPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/availability" element={<AvailabilityListPage />} />
        <Route path="/availability/:id" element={<AvailabilityPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/routing" element={<RoutingPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Route>

      <Route path="/booking/:id" element={<BookingConfirmationPage />} />
      <Route path="/:username" element={<PublicProfilePage />} />
      <Route path="/:username/:slug" element={<PublicBookingPage />} />
    </Routes>
  );
}
