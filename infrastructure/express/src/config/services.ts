import { EmailSender } from "@application/services/EmailSender"
import { PasswordHasher } from "@application/services/PasswordHasher"
import { UuidGenerator } from "@application/services/UuidGenerator"
import { TokenGenerator } from "@application/services/TokenGenerator"
import { CryptoPasswordHasher } from "@adapters/services/CryptoPasswordHasher"
import { NodeUuidGenerator } from "@adapters/services/NodeUuidGenerator"
import { NodeTokenGenerator } from "@adapters/services/NodeTokenGenerator"
import { ConsoleEmailSender } from "@adapters/services/ConsoleEmailSender"
import { SmtpEmailSender } from "@adapters/services/SmtpEmailSender"
import { EmailDriver } from "@express/types/services"
import { IBANGenerator } from "@application/services/IBANGenreator"
import { NodeIBANGenerator } from "@adapters/services/NodeIBANGenerator"
import { GenerateAmortizationService } from "@application/services/GenerateAmortizationService"
import { NodeGenerateAmortizationService } from "@adapters/services/NodeGenerateAmortizationService"

function resolveEmailDriver(): EmailDriver {
    const driver = (process.env.EMAIL_DRIVER || "console").toLowerCase()
    
    if (driver === "smtp") {
        return "smtp"
    }
    
    return "console"
}

function buildEmailSender(driver: EmailDriver): EmailSender {
    if (driver === "smtp") {
        return new SmtpEmailSender()
    }
    
    return new ConsoleEmailSender()
}

export const emailDriver: EmailDriver = resolveEmailDriver()
process.stdout.write(`Email driver: ${emailDriver}\n`)

export const emailSender: EmailSender = buildEmailSender(emailDriver)
export const passwordHasher: PasswordHasher = new CryptoPasswordHasher()
export const uuidGenerator: UuidGenerator = new NodeUuidGenerator()
export const tokenGenerator: TokenGenerator = new NodeTokenGenerator()
export const ibanGenerator: IBANGenerator = new NodeIBANGenerator()
export const nodeGenerateAmortizationService: GenerateAmortizationService = new NodeGenerateAmortizationService()

