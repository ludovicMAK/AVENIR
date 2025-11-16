import { randomUUID } from "node:crypto"
import { UuidGenerator } from "@application/services/UuidGenerator"

export class NodeUuidGenerator implements UuidGenerator {
    generate(): string {
        return randomUUID()
    }
}
