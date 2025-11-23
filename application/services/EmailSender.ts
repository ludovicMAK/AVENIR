export interface EmailSender {
    sendConfirmationEmail(email: string, token: string, firstname: string, lastname: string): Promise<void>
}