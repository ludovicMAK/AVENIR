export const CACHE_CONFIG = {
  STATIC: {
    revalidate: 3600,
    tags: ['static'],
  },
  USER_DATA: {
    revalidate: 60,
    tags: ['user'],
  },
  MARKET_DATA: {
    revalidate: 10,
    tags: ['market'],
  },
  ACCOUNT_DATA: {
    revalidate: 30,
    tags: ['account'],
  },
  MESSAGES: {
    revalidate: 15,
    tags: ['messages'],
  },
} as const;

export function cacheOptions(type: keyof typeof CACHE_CONFIG) {
  const config = CACHE_CONFIG[type];
  return {
    next: {
      revalidate: config.revalidate,
      tags: config.tags,
    },
  };
}

export const NO_CACHE = {
  next: {
    revalidate: 0,
  },
} as const;

export const PERMANENT_CACHE = {
  next: {
    revalidate: false,
  },
} as const;
