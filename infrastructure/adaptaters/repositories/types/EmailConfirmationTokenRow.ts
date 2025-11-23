export type EmailConfirmationTokenRow = {
    user_id: string
    token: string
    expires_at: Date
}