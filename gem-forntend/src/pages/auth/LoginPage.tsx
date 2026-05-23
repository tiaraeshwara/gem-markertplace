import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Gem } from "lucide-react";
import { authApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.login(data),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      toast({
        title: "Welcome back!",
        description: `Hello, ${user.fullName || user.email}`,
      });
      const path =
        user.role === "admin"
          ? "/admin"
          : user.role === "seller"
            ? "/seller/dashboard"
            : "/buyer/dashboard";
      navigate(path);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed";
      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link
            to="/"
            className="flex justify-center items-center gap-2 mb-2 text-primary font-bold text-xl"
          >
            <Gem className="h-6 w-6" /> GemVault
          </Link>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your GemVault account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
