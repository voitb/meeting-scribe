import { Card, CardContent } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/login-button";

export function LoginCard() {
  return (
    <Card className="border shadow-sm bg-muted/10">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Access Your Analysis History
            </h3>
            <p className="text-muted-foreground mb-2">
              Sign in to save your analyses and access them anytime
            </p>
          </div>
          <LoginButton />
        </div>
      </CardContent>
    </Card>
  );
}
