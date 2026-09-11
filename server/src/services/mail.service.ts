import nodemailer from 'nodemailer';

import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, SERVER_URL } from '@utils/config.util.js'

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});


export class MailService {


    /**
 * Generates a professional email verification template
 * @param userName - The user's name
 * @param verificationCode - The verification code for the user
 * @param backendUrl - Your backend URL (default: http://localhost:3000)
 * @returns HTML string ready to be sent via email service
 */
    private prepareRegisterMailTemplate(
        userName: string,
        verificationCode: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            letter-spacing: -0.5px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .greeting {
            font-size: 14px;
            color: #333333;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .greeting strong {
            color: #000000;
            font-weight: 600;
        }
        
        .message {
            font-size: 14px;
            color: #555555;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        
        .code-section {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .code-label {
            font-size: 12px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        
        .verification-code {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .verify-button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 40px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 2px;
            border: 1px solid #000000;
            transition: all 0.2s ease;
        }
        
        .verify-button:hover {
            background-color: #333333;
            border-color: #333333;
        }
        
        .footer {
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
            line-height: 1.6;
        }
        
        .footer a {
            color: #000000;
            text-decoration: none;
            word-break: break-all;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .expiry-notice {
            background-color: #f0f0f0;
            border-left: 3px solid #000000;
            padding: 12px;
            margin: 20px 0;
            font-size: 12px;
            color: #666666;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hi <strong>${this.escapeHtml(userName)}</strong>,</p>
            
            <p class="message">
                Thank you for registering. Please verify your email address by clicking the button below to activate your account.
            </p>
            
            <div class="code-section">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">${this.escapeHtml(verificationCode)}</div>
            </div>
            
            <div class="button-container">
                <a href="${SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(verificationCode)}" class="verify-button">
                    Verify Email
                </a>
            </div>
            
            <div class="expiry-notice">
                <strong>Note:</strong> This verification code expires in 24 hours. If you didn't request this email, you can safely ignore it.
            </div>
        </div>
        
        <div class="footer">
            <p>
                If the button above doesn't work, copy and paste this link in your browser:<br>
                <a href="${SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(verificationCode)}">
                    ${SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(verificationCode)}
                </a>
            </p>
            <p style="margin-top: 15px;">
                &copy; 2024 Your Company. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
    }

    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param text - Text to escape
     * @returns Escaped HTML string
     */
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (char) => map[char]);
    }

    private static prepareResetPasswordMailTemplate(userName: string, resetLink: string): string {
        return `
            <div>
                <h1>Hello, ${userName}!</h1>
                <p>We received a request to reset your password. Please click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
            </div>
        `;
    }


    public async sendVerificationMail(userEmail: string, userName: string, verificationCode: string): Promise<void> {


        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: userEmail,
            subject: 'Welcome to Our Service!',
            html: this.prepareRegisterMailTemplate(userName, verificationCode),
        };

        await transporter.sendMail(mailOptions);
    }

}

