
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "@application/repositories/users";
import { SessionRepository } from "@application/repositories/session";
import { Role } from "@domain/values/role";

export function createRoleMiddleware(
  userRepository: UserRepository,
  sessionRepository: SessionRepository,
  requiredRole: Role
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userId = request.headers["x-user-id"] as string;
      const authHeader = request.headers.authorization as string;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!userId || !token) {
        return response.status(401).json({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      // Vérifier la session
      const isConnected = await sessionRepository.isConnected(userId, token);
      if (!isConnected) {
        return response.status(401).json({
          code: "UNAUTHORIZED",
          message: "Invalid or expired session",
        });
      }

      // Récupérer l'utilisateur
      const user = await userRepository.findById(userId);
      if (!user) {
        return response.status(401).json({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      // Vérifier le rôle
      if (!user.role.equals(requiredRole)) {
        return response.status(403).json({
          code: "FORBIDDEN",
          message: `Access denied. Required role: ${requiredRole.getValue()}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return response.status(500).json({
        code: "INTERNAL_ERROR",
        message: "An error occurred while checking permissions",
      });
    }
  };
}
