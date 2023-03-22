import {
  MessagingOptions,
  MessagingPayload,
  type Message,
} from "firebase-admin/lib/messaging/messaging-api";
import { vi } from "vitest";

export const mockSend = vi.fn();
export const mockSendAll = vi.fn();
export const mockSendMulticast = vi.fn();
export const mockSendToCondition = vi.fn();
export const mockSendToDevice = vi.fn();
export const mockSendToDeviceGroup = vi.fn();
export const mockSendToTopic = vi.fn();
export const mockSubscribeToTopic = vi.fn();
export const mockUnsubscribeFromTopic = vi.fn();

export class FakeMessaging {
  constructor() {}

  async send(message: Message, dryRun?: boolean): Promise<string> {
    const result = mockSend(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendAll(messages: Message[], dryRun?: boolean): Promise<string> {
    const result = mockSendAll(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendMulticast(message: Message, dryRun?: boolean): Promise<string> {
    const result = mockSendMulticast(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendToCondition(
    condition: string,
    payload: MessagingPayload,
    options: MessagingOptions = {}
  ): Promise<string> {
    const result = mockSendToCondition(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendToDevice(
    registrationTokenOrTokens: string | string[],
    payload: MessagingPayload,
    options: MessagingOptions = {}
  ): Promise<string> {
    const result = mockSendToDevice(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendToDeviceGroup(
    notificationKey: string,
    payload: MessagingPayload,
    options: MessagingOptions = {}
  ): Promise<string> {
    const result = mockSendToDeviceGroup(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async sendToTopic(
    topic: string,
    payload: MessagingPayload,
    options: MessagingOptions = {}
  ): Promise<string> {
    const result = mockSendToTopic(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async subscribeToTopic(
    registrationTokenOrTokens: string | string[],
    topic: string
  ): Promise<string> {
    const result = mockSubscribeToTopic(...arguments);
    return result ?? Promise.resolve("👍");
  }

  async unsubscribeFromTopic(
    registrationTokenOrTokens: string | string[],
    topic: string
  ): Promise<string> {
    const result = mockUnsubscribeFromTopic(...arguments);
    return result ?? Promise.resolve("👍");
  }
}
