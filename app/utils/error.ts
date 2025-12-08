/**
 * Error Handling Utilities
 */

import React from "react";
import { ERROR_MESSAGES } from "../constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(public message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(public message: string = "You don't have permission") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (error instanceof AuthorizationError) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Handle API error response
 */
export function handleApiError(response: Response, data: any): never {
  const status = response.status;
  const message = data?.pesan || data?.message || "An error occurred";

  switch (status) {
    case 400:
      throw new ValidationError(message);
    case 401:
      throw new AuthenticationError(message);
    case 403:
      throw new AuthorizationError(message);
    case 404:
      throw new ApiError(status, "Resource not found");
    case 500:
      throw new ApiError(status, ERROR_MESSAGES.SERVER_ERROR);
    default:
      throw new ApiError(status, message);
  }
}

/**
 * Handle network error
 */
export function handleNetworkError(error: Error): never {
  if (error.message.includes("Failed to fetch")) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
  throw error;
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : "";

  if (error instanceof Error) {
    console.error(
      `[${timestamp}]${contextStr} ${error.name}: ${error.message}`,
      error.stack
    );
  } else {
    console.error(`[${timestamp}]${contextStr}`, error);
  }
}

/**
 * Retry failed request
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

/**
 * Create error boundary component
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, "ErrorBoundary");
    console.error("Error Info:", errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-lg font-semibold text-red-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-red-700 text-sm mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
