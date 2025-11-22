export interface EmailSender {
    sendConfirmationEmail(email: string, token: string): Promise<void>
}