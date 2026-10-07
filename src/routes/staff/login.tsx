import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Field } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { DEMO_STAFF, ROLE_LABEL } from "@/lib/catalog";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/login")({
  component: LoginPage,
});

function LoginPage() {
  const login = useDallema((state) => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_STAFF.email);
  const [password, setPassword] = useState("");
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-fit rounded-card bg-cream px-2 py-1.5">
        <Logo />
      </div>
      <h1 className="mt-4 font-display text-4xl text-forest-ink">Staff entrance</h1>
      <p className="mt-2 text-muted">The demo owner can see every desk. Roles exist on the model; this login is the owner.</p>
      <form
        className="mt-6 space-y-4 rounded-card border border-line bg-card p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          const result = login(email, password);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          void navigate({ to: "/staff" });
        }}
      >
        <div className="rounded-card bg-cream-deep p-3 text-sm">
          <p className="font-semibold">Demo login</p>
          <p>Email {DEMO_STAFF.email}</p>
          <p>Password {DEMO_STAFF.password}</p>
          <p className="mt-1 text-muted">Roles: {Object.values(ROLE_LABEL).join(", ")}</p>
        </div>
        <Field label="Email" id="email">
          <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </Field>
        <Field label="Password" id="password">
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        </Field>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </main>
  );
}
