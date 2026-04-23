import { test, expect } from '@playwright/experimental-ct-react';
import ConversationList from './ConversationList';
import { Conversation } from '@/lib/models';

test.use({ viewport: { width: 500, height: 500 } });

const mockConversations: Conversation[] = [
  {
    contact: '5557654321',
    lastMessage: {
      id: '1',
      date: new Date().toISOString(),
      type: 'incoming',
      did: '5551234567',
      contact: '5557654321',
      message: 'Hello there!',
    },
    unreadCount: 0,
  },
  {
    contact: '5550001111',
    lastMessage: {
      id: '2',
      date: new Date(Date.now() - 3600000).toISOString(),
      type: 'outgoing',
      did: '5551234567',
      contact: '5550001111',
      message: 'Sent message',
    },
    unreadCount: 2,
  },
];

test('renders loading state', async ({ mount }) => {
  const component = await mount(<ConversationList conversations={[]} isLoading={true} />);
  await expect(component.locator('.animate-pulse')).toHaveCount(5);
});

test('renders empty state', async ({ mount }) => {
  const component = await mount(<ConversationList conversations={[]} />);
  await expect(component).toContainText('No conversations found.');
});

test('renders conversation list', async ({ mount }) => {
  const component = await mount(<ConversationList conversations={mockConversations} />);
  await expect(component).toContainText('5557654321');
  await expect(component).toContainText('Hello there!');
  await expect(component).toContainText('5550001111');
  await expect(component).toContainText('Sent message');
});

test('mobile responsiveness', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const component = await mount(<ConversationList conversations={mockConversations} />);
  // Check if it still renders correctly on small screen
  await expect(component).toBeVisible();
  await expect(component.locator('text=5557654321')).toBeVisible();
});
