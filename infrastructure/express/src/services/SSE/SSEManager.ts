import { SSEService } from "./SSEService"

/**
 * Singleton manager pour le service SSE
 * Permet l'accès global au service SSE depuis n'importe où dans l'application
 */
export class SSEManager {
  private static instance: SSEService | null = null

  /**
   * Initialise le singleton SSEService
   */
  static initialize(): SSEService {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEService()
    }
    return SSEManager.instance
  }

  /**
   * Retourne l'instance du SSEService
   */
  static getInstance(): SSEService {
    if (!SSEManager.instance) {
      return SSEManager.initialize()
    }
    return SSEManager.instance
  }

  /**
   * Réinitialise le singleton (utile pour les tests)
   */
  static reset(): void {
    if (SSEManager.instance) {
      SSEManager.instance.cleanup()
      SSEManager.instance = null
    }
  }
}
