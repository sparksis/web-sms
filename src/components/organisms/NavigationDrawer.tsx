"use client";

import React from "react";
import Avatar from "../atoms/Avatar";
import Icon from "../atoms/Icon";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@auth0/nextjs-auth0/client";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { user } = useUser();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-zinc-950 z-50 shadow-2xl flex flex-col">
        <div className="p-6 bg-primary text-white">
          <Avatar name={user?.email || ""} size="lg" className="mb-4" />
          <div className="font-semibold truncate">{user?.email || "User"}</div>
          <div className="text-xs text-zinc-200">VoIP.ms API</div>
        </div>

        <nav className="flex-1 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="px-6 py-3 flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Icon name="message" size={20} />
            <span>Messages</span>
          </Link>
          <div className="px-6 py-3 flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer">
            <Icon name="archive" size={20} />
            <span>Archived</span>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="px-6 py-3 flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Icon name="settings" size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

export default NavigationDrawer;
