import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Gem } from "lucide-react";
import { authApi } from "@/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["seller", "buyer"]),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole =
    (searchParams.get("role") as "seller" | "buyer") || "buyer";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.register(data),
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      navigate("/auth/login");
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      toast({
        title: "Registration failed",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const role = watch("role");

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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join GemVault to buy or sell gems</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            <div>
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["buyer", "seller"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue("role", r)}
                    className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                      role === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    {r === "buyer" ? "🔍 Buy Gems" : "💎 Sell Gems"}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-destructive text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-destructive text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>
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
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 000 0000"
                {...register("phone")}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
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
              <p className="text-xs text-muted-foreground mt-1">
                Min 8 chars, 1 uppercase, 1 number
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
