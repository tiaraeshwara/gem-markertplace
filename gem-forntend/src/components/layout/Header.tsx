import { Link, useNavigate } from "react-router-dom";
import {
  Gem,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { authApi } from "@/api";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isAuthenticated, logout, refreshToken } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      /* ignore */
    }
    logout();
    navigate("/auth/login");
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "seller"
        ? "/seller/dashboard"
        : "/buyer/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <Gem className="h-6 w-6" />
          GemVault
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/gems"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Gems
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Chat
              </Link>
              <Link
                to="/notifications"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  to={`${dashboardPath}`}
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  {user?.fullName?.split(" ")[0] || "Account"}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link
            to="/gems"
            className="block text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Browse Gems
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="block text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="block text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Chat
              </Link>
              <Link
                to="/notifications"
                className="block text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="block text-sm font-medium text-destructive"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="block text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/auth/register"
                className="block text-sm font-medium text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
