import React from 'react';
import { beforeMount } from '@playwright/experimental-ct-react/hooks';

beforeMount(async () => {
  console.log('Before mount');
  // If we really need MSW in CT, we should ensure the service worker is available.
  // For these atomic component tests, we might not actually need it if we pass props.
  // But let's try to make it optional to avoid registration errors in some environments.
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const { worker } = await import('../src/mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            url: '/mockServiceWorker.js'
        }
      });
    }
  } catch (e) {
    console.error('MSW failed to start', e);
  }
});
