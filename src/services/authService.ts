import { UserProfile, SupportedLanguage } from '../types';

/**
 * Jurislink Security & Phone-Based OTP Authentication Service
 * Implements privacy-preserving phone authentication without logging sensitive credentials.
 */

export class AuthService {
  private static AUTH_KEY = 'jurislink_auth_user';

  static getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static sendOtp(phoneNumber: string): Promise<{ success: boolean; simulatedOtp: string; message: string }> {
    return new Promise((resolve) => {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const simulatedOtp = '7429'; // Predictable demo OTP

      setTimeout(() => {
        resolve({
          success: true,
          simulatedOtp,
          message: `OTP sent successfully to +91 ${cleanPhone.slice(-10)}`
        });
      }, 500);
    });
  }

  static verifyOtp(phoneNumber: string, enteredOtp: string, lang: SupportedLanguage = 'hi'): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Accept demo OTP '7429' or any 4 digits in demo mode
        if (enteredOtp.length === 4) {
          const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
          const user: UserProfile = {
            phoneNumber: cleanPhone.slice(-10) || '9876543210',
            preferredLanguage: lang,
            isHighContrast: false,
            isVoiceAutoPlay: true,
            savedCnrs: ['DLHC01-008472-2024'],
            role: 'CITIZEN',
            token: `jwt-jurislink-${Date.now()}`
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
          }

          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid OTP. Please enter the 4-digit verification code.' });
        }
      }, 600);
    });
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.AUTH_KEY);
    }
  }
}
