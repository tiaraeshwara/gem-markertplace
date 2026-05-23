import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import { notificationsApi } from "@/api";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/components/layout/RoleGuard";

// Public Pages
import LandingPage from "@/pages/public/LandingPage";
import BrowseGemsPage from "@/pages/public/BrowseGemsPage";
import GemDetailPage from "@/pages/public/GemDetailPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Seller Pages
import SellerDashboard from "@/pages/seller/SellerDashboard";
import MyGemsPage from "@/pages/seller/MyGemsPage";
import GemFormPage from "@/pages/seller/GemFormPage";
import GemBidsPage from "@/pages/seller/GemBidsPage";

// Buyer Pages
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import ReservationsPage from "@/pages/buyer/ReservationsPage";
import MyBidsPage from "@/pages/buyer/MyBidsPage";

// Chat Pages
import ChatInboxPage from "@/pages/chat/ChatInboxPage";
import ChatRoomPage from "@/pages/chat/ChatRoomPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

// Notifications
import NotificationsPage from "@/pages/NotificationsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppInner() {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = connectSocket(accessToken);

      // Load initial notifications
      notificationsApi.getAll().then((r) => setNotifications(r.data || []));

      // Listen for new notifications
      socket?.on("notification", (notif: Record<string, unknown>) => {
        addNotification(notif as Parameters<typeof addNotification>[0]);
      });
    } else {
      disconnectSocket();
    }

    return () => {
      /* socket cleaned up in disconnect */
    };
  }, [isAuthenticated, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth (no layout) */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

        {/* Public routes with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gems" element={<BrowseGemsPage />} />
          <Route path="/gems/:id" element={<GemDetailPage />} />

          {/* Notifications (any authenticated user) */}
          <Route
            path="/notifications"
            element={
              <RoleGuard allowedRoles={["seller", "buyer", "admin"]}>
                <NotificationsPage />
              </RoleGuard>
            }
          />

          {/* Chat (seller or buyer) */}
          <Route
            path="/chat"
            element={
              <RoleGuard allowedRoles={["seller", "buyer"]}>
                <ChatInboxPage />
              </RoleGuard>
            }
          />
          <Route
            path="/chat/:roomId"
            element={
              <RoleGuard allowedRoles={["seller", "buyer"]}>
                <ChatRoomPage />
              </RoleGuard>
            }
          />

          {/* Seller routes */}
          <Route
            path="/seller/dashboard"
            element={
              <RoleGuard allowedRoles={["seller"]}>
                <SellerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/gems"
            element={
              <RoleGuard allowedRoles={["seller"]}>
                <MyGemsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/gems/new"
            element={
              <RoleGuard allowedRoles={["seller"]}>
                <GemFormPage />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/gems/:id/edit"
            element={
              <RoleGuard allowedRoles={["seller"]}>
                <GemFormPage />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/gems/:id/bids"
            element={
              <RoleGuard allowedRoles={["seller"]}>
                <GemBidsPage />
              </RoleGuard>
            }
          />

          {/* Buyer routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <RoleGuard allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/buyer/reservations"
            element={
              <RoleGuard allowedRoles={["buyer"]}>
                <ReservationsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/buyer/bids"
            element={
              <RoleGuard allowedRoles={["buyer"]}>
                <MyBidsPage />
              </RoleGuard>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <AdminReviewsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <AdminUsersPage />
              </RoleGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
