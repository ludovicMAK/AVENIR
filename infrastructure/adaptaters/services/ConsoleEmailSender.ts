import { EmailSender } from "@application/services/EmailSender"

export class ConsoleEmailSender implements EmailSender {
    async sendConfirmationEmail(email: string, token: string): Promise<void> {
        const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-registration?token=${token}`
        
        console.log("=".repeat(80))
        console.log("CONFIRMATION EMAIL")
        console.log("=".repeat(80))
        console.log(`To: ${email}`)
        console.log(`Subject: Confirm your registration`)
        console.log("")
        console.log(`Please confirm your registration by clicking on the following link:`)
        console.log(`${confirmationUrl}`)
        console.log("")
        console.log(`This link will expire in 24 hours.`)
        console.log("=".repeat(80))
    }
}