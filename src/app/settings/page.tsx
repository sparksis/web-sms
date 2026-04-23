"use client";

import React from "react";
import MainLayout from "@/components/templates/MainLayout";
import PushSettings from "@/components/organisms/PushSettings";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const actions = (
    <button
      onClick={() => router.push("/")}
      className="p-2 rounded-full hover:bg-white/10 transition-colors"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );

  return (
    <MainLayout title="Settings" actions={actions}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 overflow-y-auto h-full">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
          <p className="text-zinc-500">Manage your notifications and account preferences.</p>
        </header>

        <PushSettings />

        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-center text-zinc-400">
            VoIP.ms SMS Web Client v0.1.0
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
