import { randomBytes } from "node:crypto"
import { TokenGenerator } from "@application/services/TokenGenerator"

export class NodeTokenGenerator implements TokenGenerator {
    generate(): string {
        return randomBytes(32).toString("hex")
    }
}