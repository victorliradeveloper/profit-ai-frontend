export const API_PATHS = {
  auth: {
    base: '/v1/auth',
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    profile: '/v1/auth/profile',
    avatar: '/v1/auth/profile/avatar',
    password: '/v1/auth/password',
  },
  s3: {
    upload: '/v1/s3/upload',
    downloadByKey: (key: string) => `/v1/s3/download/${encodeURIComponent(key)}`,
  },
} as const;

