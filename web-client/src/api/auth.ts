import { apiRequest } from "./base-api";

// ─── Token Utilities ───────────────────────────────────────────────────────────

export const AUTH_TOKEN_KEY = 'authToken';

const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      // Set cookie cho middleware access (7 ngày)
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    } catch (error) {
      console.error("Error saving auth token:", error);
    }
  }
};

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    document.cookie = 'auth_token=; path=/; max-age=0';
  }
};

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface BackendRole {
  id: number;
  name: string;
}

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: BackendRole;
  address?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  birthday?: string | Date;
  learningtime: number;
  coursenumber: number;
  createdAt: string | Date;
  lastLoginAt?: string | Date;
}

export interface LoginResponse {
  user: BackendUser;
  token: string;
  message: string;
  isNewUser?: boolean;
}

export interface RegisterResponse {
  user: BackendUser;
  message: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface GoogleRegisterData {
  googleId: string;
  email: string;
  name: string;
  accessToken: string;
}

interface MessageResponse {
  message: string;
}

// ─── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {
  /** Đăng ký / liên kết tài khoản qua Google. */
  async registerWithGoogle(googleData: GoogleRegisterData): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/register/google', 'POST', { data: googleData });
  },

  /** Đăng nhập qua Facebook Access Token. */
  async loginWithFacebook(accessToken: string): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/auth/login/facebook', 'POST', {
      data: { accessToken },
    });
    if (!response.token) {
      throw new Error("Login successful, but no session token received from server.");
    }
    setAuthToken(response.token);
    return response;
  },

  /** Đăng nhập bằng email và mật khẩu. */
  async loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiRequest<LoginResponse>('/auth/login/email', 'POST', {
        data: { email, password },
      });
      if (!response.token) {
        throw new Error("Login successful, but no session token received from server.");
      }
      setAuthToken(response.token);
      return response;
    } catch (error) {
      removeAuthToken();
      throw error;
    }
  },

  /** Đăng xuất — gửi token lên server rồi xóa khỏi localStorage. */
  async logout(): Promise<LogoutResponse> {
    const token = getAuthToken();
    if (!token) return { message: "No active session found.", success: true };
    try {
      const response = await apiRequest<LogoutResponse>('/auth/logout', 'POST', { token });
      removeAuthToken();
      return response;
    } catch (error) {
      removeAuthToken();
      throw error;
    }
  },

  /** Đăng ký tài khoản mới bằng email. */
  async register(userData: { email: string; password: string; name: string }): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>('/auth/register', 'POST', { data: userData });
  },

  /** Lấy thông tin user hiện tại từ token đang lưu. Trả về null nếu không hợp lệ. */
  async getCurrentUser(): Promise<BackendUser | null> {
    const token = getAuthToken();
    if (!token) return null;
    try {
      return await apiRequest<BackendUser>('/users/me', 'GET', { token });
    } catch {
      removeAuthToken();
      return null;
    }
  },

  /** Gửi email đặt lại mật khẩu. */
  async forgetPassword(email: string): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/auth/forgot-password', 'POST', { data: { email } });
  },

  /** Đặt lại mật khẩu bằng token từ email. */
  async resetPassword(token: string, email: string, newPassword: string): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/auth/reset-password', 'POST', {
      data: { token, email, newPassword },
    });
  },

  // Expose utilities để dùng trong Context/Provider
  utils: { setAuthToken, getAuthToken, removeAuthToken },
};