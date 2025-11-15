const API_BASE_URL = 'http://localhost:3010/api';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Set current user in localStorage
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove current user from localStorage
export const removeCurrentUser = (): void => {
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Login function
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
  setCurrentUser(data.user);
  return data;
};

// Register function
export const register = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
  setCurrentUser(data.user);
  return data;
};

// Logout function
export const logout = (): void => {
  removeToken();
  removeCurrentUser();
};

// Get authenticated fetch headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Fetch with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeaders = getAuthHeaders();
  
  // Merge headers - use Record<string, string> for easier handling
  let headers: Record<string, string> = {};
  
  // Convert existing headers to object if needed
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      headers = { ...options.headers };
    }
  }
  
  // Add auth headers
  if (authHeaders instanceof Headers) {
    authHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(authHeaders)) {
    authHeaders.forEach(([key, value]) => {
      headers[key] = value;
    });
  } else {
    Object.assign(headers, authHeaders);
  }

  // Don't override Content-Type if it's FormData (browser will set it automatically with boundary)
  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    // For FormData, don't set Content-Type - let browser set it with boundary
    delete headers['Content-Type'];
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

