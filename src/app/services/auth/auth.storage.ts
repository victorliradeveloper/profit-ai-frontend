export const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
  USER_AVATAR_KEY: 'userAvatarKey',
  USER_AVATAR_URL: 'userAvatarUrl',
} as const;

export const AUTH_STORAGE_KEY_LIST: readonly string[] = Object.values(AUTH_STORAGE_KEYS);

