import nodemailer, { Transporter } from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import { EmailSender } from "@application/services/EmailSender"
import { InfrastructureError } from "@application/errors"
import { readEnv } from "@adapters/utils/env"

function generateConfirmationEmail(confirmationUrl: string, firstname: string, lastname: string): { html: string; text: string } {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: #ffffff;
                    border: 2px solid #e5e7eb;
                }
                .header { 
                    background-color: #171717; 
                    color: #ffffff; 
                    padding: 40px 20px; 
                    text-align: center; 
                }
                .header h1 {
                    margin: 0;
                    font-size: 32px;
                    font-weight: normal;
                }
                .content { 
                    padding: 40px 40px; 
                    background-color: #f0f0f0;
                    color: #1a1a1a;
                }
                .content p {
                    margin: 20px 0;
                    font-size: 16px;
                }
                .button { 
                    display: inline-block; 
                    padding: 14px 40px; 
                    background-color: #171717; 
                    color: #ffffff !important; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 30px 0;
                    font-size: 16px;
                }
                .link-section {
                    margin: 30px 0;
                }
                .footer { 
                    background-color: #171717;
                    padding: 30px 20px; 
                    text-align: center; 
                    font-size: 14px; 
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Confirm Your Email</h1>
                </div>
                <div class="content">
                    <p>Hello ${firstname} ${lastname},</p>
                    <p>Thank you for registering! Please confirm your email address by clicking the button below:</p>
                    <div style="text-align: center;">
                        <a href="${confirmationUrl}" class="button" style="color: #ffffff;">Confirm Email</a>
                    </div>
                    <div class="link-section">
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all;"><a href="${confirmationUrl}" style="color: #0066cc;">${confirmationUrl}</a></p>
                    </div>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                </div>
                <div class="footer">
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
    `

    const text = `
Hello ${firstname} ${lastname},

Thank you for registering! Please confirm your email address by clicking the link below:

${confirmationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.
    `.trim()

    return { html, text }
}

export class SmtpEmailSender implements EmailSender {
    private readonly transporter: Transporter

    constructor() {
        const host = readEnv("SMTP_HOST")
        const port = Number(readEnv("SMTP_PORT"))
        const secure = process.env.SMTP_SECURE === "true"
        const user = readEnv("SMTP_USER")
        const password = readEnv("SMTP_PASSWORD")

        const options: SMTPTransport.Options = {
            host,
            port,
            secure,
            auth: {
                user,
                pass: password,
            },
        }

        this.transporter = nodemailer.createTransport(options)
    }

    async sendConfirmationEmail(email: string, token: string, firstname: string, lastname: string): Promise<void> {
        const confirmationUrl = `${readEnv("FRONTEND_URL")}/confirm-registration?token=${token}`
        const fromEmail = process.env.SMTP_FROM_EMAIL || readEnv("SMTP_USER")

        const { html, text } = generateConfirmationEmail(confirmationUrl, firstname, lastname)

        try {
            await this.transporter.sendMail({
                from: fromEmail,
                to: email,
                subject: "Confirm your registration",
                html,
                text,
            })
        } catch (error) {
            console.error("Failed to send confirmation email:", error)
            throw new InfrastructureError("Failed to send confirmation email")
        }
    }
}