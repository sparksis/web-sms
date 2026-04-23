"use client";

import React, { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Icon from "../atoms/Icon";

const PushSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    isLoading
  } = usePushNotifications();

  const [pollingFrequency, setPollingFrequency] = useState("manual");

  useEffect(() => {
    const saved = localStorage.getItem("polling_frequency");
    if (saved) setPollingFrequency(saved);
  }, []);

  const handleFrequencyChange = (freq: string) => {
    setPollingFrequency(freq);
    localStorage.setItem("polling_frequency", freq);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-lg flex gap-3">
        <Icon name="warning" size={20} />
        <p className="text-sm">Web Push is not supported by your browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Push Notifications</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            permission === "granted" ? "bg-green-100 text-green-700" :
            permission === "denied" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"
          }`}>
            {permission.toUpperCase()}
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-900 dark:text-white font-medium">Enable Notifications</p>
              <p className="text-sm text-zinc-500">Receive alerts for new incoming SMS messages.</p>
            </div>
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={isLoading || (permission === "denied")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                isSubscribed ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSubscribed ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Polling Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {["manual", "15m", "1h"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    pollingFrequency === freq
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {freq === "manual" ? "Push Only" : freq}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Frequency of background checks even without a push notification.
            </p>
          </div>

          {permission === "denied" && (
            <p className="mt-4 text-xs text-red-500">
              Notification permission was denied. Please reset permissions in your browser settings to enable.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white">VoIP.ms Webhook Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            To receive real-time notifications, you must configure a Callback URL for your DIDs in the VoIP.ms portal.
          </p>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-mono break-all text-primary select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/push/webhook?did={DID}` : '...'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Step-by-Step Guide:</h4>
            <ol className="text-sm text-zinc-600 dark:text-zinc-400 list-decimal list-inside space-y-2">
              <li>Log in to your <a href="https://voip.ms/m/login.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">VoIP.ms Portal</a>.</li>
              <li>Go to <strong>DID Management</strong> &gt; <strong>DID Numbers</strong>.</li>
              <li>Click the <strong>Edit DID</strong> icon (yellow pencil) for your number.</li>
              <li>Scroll down to <strong>SMS Settings</strong>.</li>
              <li>Enable <strong>SMS Real Time Logging</strong>.</li>
              <li>Check <strong>URL Callback</strong>.</li>
              <li>Paste the URL above into the <strong>URL Callback</strong> field.</li>
              <li>Ensure <strong>URL Callback Retry</strong> is enabled if you want reliability.</li>
              <li>Click <strong>Save Changes</strong> at the bottom.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PushSettings;
