/**
 * Configuration du cache pour l'application AVENIR
 * 
 * Next.js utilise plusieurs stratégies de cache:
 * 1. Request Memoization - cache automatique pour les requêtes fetch() pendant une requête
 * 2. Data Cache - cache persistant pour les données fetch()
 * 3. Full Route Cache - cache des pages rendues côté serveur
 * 4. Router Cache - cache côté client
 */

/**
 * Options de revalidation pour les différents types de données
 */
export const CACHE_CONFIG = {
  // Données statiques (changent rarement)
  STATIC: {
    revalidate: 3600, // 1 heure
    tags: ['static'],
  },
  
  // Données utilisateur (changent fréquemment)
  USER_DATA: {
    revalidate: 60, // 1 minute
    tags: ['user'],
  },
  
  // Données de marché (changent constamment)
  MARKET_DATA: {
    revalidate: 10, // 10 secondes
    tags: ['market'],
  },
  
  // Données de compte (changent à chaque transaction)
  ACCOUNT_DATA: {
    revalidate: 30, // 30 secondes
    tags: ['account'],
  },
  
  // Messages et conversations
  MESSAGES: {
    revalidate: 15, // 15 secondes
    tags: ['messages'],
  },
} as const;

/**
 * Helper pour créer des options de fetch avec cache
 */
export function cacheOptions(type: keyof typeof CACHE_CONFIG) {
  const config = CACHE_CONFIG[type];
  return {
    next: {
      revalidate: config.revalidate,
      tags: config.tags,
    },
  };
}

/**
 * Helper pour désactiver le cache
 */
export const NO_CACHE = {
  next: {
    revalidate: 0,
  },
} as const;

/**
 * Helper pour activer le cache permanent (ISR)
 */
export const PERMANENT_CACHE = {
  next: {
    revalidate: false,
  },
} as const;
