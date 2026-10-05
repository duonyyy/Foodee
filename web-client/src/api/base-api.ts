/* eslint-disable @typescript-eslint/no-explicit-any */

// Key phải khớp với AUTH_TOKEN_KEY trong auth.tsx
const STORAGE_TOKEN_KEY = 'authToken';

/**
 * Tự động lấy JWT token từ localStorage.
 * Trả về undefined nếu đang ở server-side (SSR).
 */
function getStoredToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(STORAGE_TOKEN_KEY) ?? undefined;
}

/**
 * Thực hiện yêu cầu HTTP đến API backend.
 *
 * Token xác thực sẽ được **tự động lấy từ localStorage** nếu không được truyền vào.
 * Điều này giúp các hàm gọi API không cần truyền token thủ công.
 *
 * @template T - Kiểu dữ liệu trả về từ API.
 * @param endpoint - Đường dẫn tương đối, ví dụ: '/users', '/orders/123'.
 * @param method - Phương thức HTTP: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'.
 * @param options - Tuỳ chọn: token, data, formData, query params.
 * @throws {Error} Khi response không ok (status ngoài 200-299).
 */
export async function apiRequest<T>(
  endpoint: string,
  method: string,
  options?: {
    /** Dữ liệu JSON gửi trong body (POST/PUT/PATCH). */
    data?: object | null;
    /** Token JWT. Nếu không truyền, tự động lấy từ localStorage. */
    token?: string;
    /** Query params thêm vào URL. Ví dụ: { page: 1, size: 10 } → '?page=1&size=10' */
    query?: Record<string, string | number | boolean>;
    /** FormData gửi trong body (upload file). Không cần set Content-Type. */
    formData?: FormData;
  }
): Promise<T> {
  const { data, formData } = options || {};

  // Ưu tiên token được truyền vào, fallback sang localStorage
  const token = options?.token ?? getStoredToken();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${apiBase}${path}`;
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: any = undefined;

  if (formData) {
    body = formData;
  } else if (data) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  if (options?.query) {
    const filteredQuery = Object.fromEntries(
      Object.entries(options.query).filter(([, value]) => value !== undefined && value !== null)
    );
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filteredQuery).map(([key, value]) => [key, value.toString()])
      )
    ).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}