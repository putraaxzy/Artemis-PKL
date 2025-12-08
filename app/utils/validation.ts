/**
 * Validation Utilities
 */

/**
 * Validate username format
 * Only letters, numbers, and underscores allowed
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username || username.length === 0) {
    return { valid: false, error: "Username is required" };
  }

  if (username.length > 255) {
    return { valid: false, error: "Username must be 255 characters or less" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length === 0) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.length === 0) {
    return { valid: false, error: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean;
  error?: string;
} {
  if (!phone || phone.length === 0) {
    return { valid: false, error: "Phone number is required" };
  }

  if (!/^\d{10,}$/.test(phone.replace(/\D/g, ""))) {
    return { valid: false, error: "Phone number must be at least 10 digits" };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url || url.length === 0) {
    return { valid: false, error: "URL is required" };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate Google Drive link
 */
export function validateGoogleDriveLink(url: string): {
  valid: boolean;
  error?: string;
} {
  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    return urlValidation;
  }

  if (!url.includes("drive.google.com")) {
    return { valid: false, error: "Must be a Google Drive link" };
  }

  return { valid: true };
}

/**
 * Validate task title
 */
export function validateTaskTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Task title is required" };
  }

  if (title.length > 255) {
    return { valid: false, error: "Task title must be 255 characters or less" };
  }

  return { valid: true };
}

/**
 * Validate grade (0-100)
 */
export function validateGrade(grade: number): {
  valid: boolean;
  error?: string;
} {
  if (grade === null || grade === undefined) {
    return { valid: false, error: "Grade is required" };
  }

  if (grade < 0 || grade > 100) {
    return { valid: false, error: "Grade must be between 0 and 100" };
  }

  return { valid: true };
}

/**
 * Validate teacher notes
 */
export function validateTeacherNotes(notes: string): {
  valid: boolean;
  error?: string;
} {
  if (notes && notes.length > 1000) {
    return { valid: false, error: "Notes must be 1000 characters or less" };
  }

  return { valid: true };
}
