import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authApi } from "@/api";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const mutation = useMutation({
    mutationFn: (t: string) => authApi.verifyEmail(t),
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  useEffect(() => {
    if (token) mutation.mutate(token);
    else setStatus("error");
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p>Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Email Verified!</h2>
            <p className="text-muted-foreground">Your account is now active.</p>
            <Link to="/auth/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p className="text-muted-foreground">
              The link may be expired or invalid.
            </p>
            <Link to="/auth/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
