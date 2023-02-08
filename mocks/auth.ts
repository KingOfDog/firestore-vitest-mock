import { vi } from "vitest";

export interface FirebaseUser {
  uid: string;
  sendEmailVerification: unknown;
}

export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockDeleteUser = vi.fn();
export const mockSendVerificationEmail = vi.fn();
export const mockSignInWithEmailAndPassword = vi.fn();
export const mockSendPasswordResetEmail = vi.fn();
export const mockVerifyIdToken = vi.fn<unknown[], FirebaseUser>();
export const mockGetUser = vi.fn<unknown[], Record<string, never>>();
export const mockCreateCustomToken = vi.fn<unknown[], string>();
export const mockSetCustomUserClaims = vi.fn<unknown[], Record<string, never>>();
export const mockSignOut = vi.fn();
export const mockUseEmulator = vi.fn();

export class FakeAuth {
  private currentUserRecord: FirebaseUser;

  constructor(currentUser?: FirebaseUser) {
    this.currentUserRecord = currentUser ?? {} as FirebaseUser;
    this.currentUserRecord.sendEmailVerification = mockSendVerificationEmail;
  }

  createUserWithEmailAndPassword(): Promise<{ user: FirebaseUser }> {
    mockCreateUserWithEmailAndPassword(...arguments);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  deleteUser(): Promise<"👍"> {
    mockDeleteUser(...arguments);
    return Promise.resolve("👍");
  }

  signInWithEmailAndPassword(): Promise<{ user: FirebaseUser }> {
    mockSignInWithEmailAndPassword(...arguments);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  signOut(): Promise<"👍"> {
    mockSignOut();
    return Promise.resolve("👍");
  }

  sendPasswordResetEmail(): void {
    mockSendPasswordResetEmail(...arguments);
  }

  verifyIdToken(): Promise<FirebaseUser> {
    return Promise.resolve(
      mockVerifyIdToken(...arguments) || this.currentUserRecord
    );
  }

  getUser(): Promise<Record<string, never>> {
    return Promise.resolve(mockGetUser(...arguments) || {});
  }

  createCustomToken(): Promise<string> {
    return Promise.resolve(mockCreateCustomToken(...arguments) || "");
  }

  setCustomUserClaims(): Promise<Record<string, never>> {
    return Promise.resolve(mockSetCustomUserClaims(...arguments) || {});
  }

  useEmulator(): void {
    mockUseEmulator(...arguments);
  }

  get currentUser(): Readonly<FirebaseUser> {
    const { uid, ...data } = this.currentUserRecord;
    return { uid, data };
  }
}
