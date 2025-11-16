import { createHash } from "node:crypto"
import { PasswordHasher } from "@application/services/PasswordHasher"

export class CryptoPasswordHasher implements PasswordHasher {
    async hash(plain: string): Promise<string> {
        return createHash("sha256").update(plain).digest("hex")
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        const candidate = await this.hash(plain)
        return candidate === hashed
    }
}
