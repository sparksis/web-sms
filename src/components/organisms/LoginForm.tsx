"use client";

import React, { useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { useAuth } from "@/hooks/useAuth";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [apiPassword, setApiPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login({ email, apiPassword });

    if (!result.success) {
      setError(result.error || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">VoIP.ms SMS</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Sign in to the VoIP.ms API</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="VoIP.ms account email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />
        <Input
          label="VoIP.ms API password"
          type="password"
          value={apiPassword}
          onChange={(e) => setApiPassword(e.target.value)}
          placeholder="API Password"
          required
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <p className="mb-2"><strong>Important:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Enable API access in your VoIP.ms portal.</li>
            <li>Use your API Password, not your account password.</li>
            <li>Whitelist &quot;0.0.0.0&quot; IP for API access if needed.</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
