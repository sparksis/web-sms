"use client";

import React, { useState } from "react";
import Icon from "../atoms/Icon";
import NavigationDrawer from "../organisms/NavigationDrawer";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <header className="bg-primary text-white shadow-md z-10 flex items-center px-4 py-3 min-h-[56px]">
        <div className="mr-4">
          {showBackButton ? (
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <Icon name="back" size={24} />
            </button>
          ) : (
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              <Icon name="menu" size={24} />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-200 truncate leading-tight">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {actions}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>

      {!showBackButton && (
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
