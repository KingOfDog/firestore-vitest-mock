import { vi } from "vitest";

export interface FirebaseUser {
  uid: string;
  sendEmailVerification: unknown;
  [key: string]: unknown;
}

export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockDeleteUser = vi.fn();
export const mockSendVerificationEmail = vi.fn();
export const mockSignInWithEmailAndPassword = vi.fn();
export const mockSendPasswordResetEmail = vi.fn();
export const mockVerifyIdToken = vi.fn<unknown[], FirebaseUser>();
export const mockGetUser = vi.fn<unknown[], Record<string, never>>();
export const mockCreateCustomToken = vi.fn<unknown[], string>();
export const mockSetCustomUserClaims = vi.fn<
  unknown[],
  Record<string, never>
>();
export const mockSignOut = vi.fn();
export const mockUseEmulator = vi.fn();

export class FakeAuth {
  private readonly currentUserRecord: FirebaseUser;

  constructor(currentUser?: FirebaseUser) {
    this.currentUserRecord = currentUser ?? ({} as FirebaseUser);
    this.currentUserRecord.sendEmailVerification = mockSendVerificationEmail;
  }

  async createUserWithEmailAndPassword(): Promise<{ user: FirebaseUser }> {
    mockCreateUserWithEmailAndPassword(...arguments);
    return await Promise.resolve({ user: this.currentUserRecord });
  }

  async deleteUser(): Promise<"👍"> {
    mockDeleteUser(...arguments);
    return await Promise.resolve("👍");
  }

  async signInWithEmailAndPassword(): Promise<{ user: FirebaseUser }> {
    mockSignInWithEmailAndPassword(...arguments);
    return await Promise.resolve({ user: this.currentUserRecord });
  }

  async signOut(): Promise<"👍"> {
    mockSignOut();
    return await Promise.resolve("👍");
  }

  sendPasswordResetEmail(): void {
    mockSendPasswordResetEmail(...arguments);
  }

  async verifyIdToken(): Promise<FirebaseUser> {
    return await Promise.resolve(
      mockVerifyIdToken(...arguments) || this.currentUserRecord
    );
  }

  async getUser(): Promise<Record<string, never>> {
    return await Promise.resolve(mockGetUser(...arguments) || {});
  }

  async createCustomToken(): Promise<string> {
    return await Promise.resolve(mockCreateCustomToken(...arguments) || "");
  }

  async setCustomUserClaims(): Promise<Record<string, never>> {
    return await Promise.resolve(mockSetCustomUserClaims(...arguments) || {});
  }

  useEmulator(): void {
    mockUseEmulator(...arguments);
  }

  get currentUser(): Readonly<FirebaseUser> {
    const { uid, ...data } = this.currentUserRecord;
    return { uid, data } as unknown as FirebaseUser;
  }
}
