import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface RoleGuardProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleGuard({
  allowedRoles,
  redirectTo = "/auth/login",
}: RoleGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (!user || !allowedRoles.includes(user.role)) {
    const fallback =
      user?.role === "admin"
        ? "/admin"
        : user?.role === "seller"
          ? "/seller/dashboard"
          : "/buyer/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
