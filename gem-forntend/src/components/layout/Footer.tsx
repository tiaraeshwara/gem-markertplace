import { Link } from "react-router-dom";
import { Gem } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-lg text-primary mb-3"
            >
              <Gem className="h-5 w-5" />
              GemVault
            </Link>
            <p className="text-sm text-muted-foreground">
              The trusted marketplace for verified precious gemstones.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/gems" className="hover:text-foreground">
                  Browse Gems
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/register?role=seller"
                  className="hover:text-foreground"
                >
                  Sell a Gem
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth/login" className="hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-foreground">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:support@gemvault.com"
                  className="hover:text-foreground"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GemVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
