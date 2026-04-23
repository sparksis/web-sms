import { test, expect } from '@playwright/experimental-ct-react';
import MessageBubble from './MessageBubble';
import { Message } from '@/lib/models';

const incomingMessage: Message = {
  id: '1',
  date: '2023-10-27T10:00:00Z',
  type: 'incoming',
  did: '5551234567',
  contact: '5557654321',
  message: 'Hello, this is an incoming message',
};

const outgoingMessage: Message = {
  id: '2',
  date: '2023-10-27T10:05:00Z',
  type: 'outgoing',
  did: '5551234567',
  contact: '5557654321',
  message: 'This is an outgoing reply',
};

test('renders incoming message with correct styles', async ({ mount }) => {
  const component = await mount(<MessageBubble message={incomingMessage} />);
  await expect(component).toContainText('Hello, this is an incoming message');
  await expect(component).toHaveClass(/justify-start/);
  await expect(component.locator('div').first()).toHaveClass(/bg-zinc-200/);
});

test('renders outgoing message with correct styles', async ({ mount }) => {
  const component = await mount(<MessageBubble message={outgoingMessage} />);
  await expect(component).toContainText('This is an outgoing reply');
  await expect(component).toHaveClass(/justify-end/);
  await expect(component.locator('div').first()).toHaveClass(/bg-primary/);
});
