import path from 'node:path';

export const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

/** Fresh browser context with no saved session (for login-page specs). */
export const EMPTY_STORAGE_STATE = { cookies: [], origins: [] };
