import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter for sending emails
const createTransporter = () => {
    console.log('Creating email transporter...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
    
    // Using Gmail SMTP (you can change this to any email service)
    if (process.env.EMAIL_SERVICE === 'gmail') {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            const errorMsg = 'Email configuration missing! Please set EMAIL_USER and EMAIL_APP_PASSWORD environment variables';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        
        try {
            return createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD, // Use App Password for Gmail
                },
                debug: process.env.NODE_ENV !== 'production', // Enable debug in non-production
                logger: process.env.NODE_ENV !== 'production' // Enable logging in non-production
            });
        } catch (error) {
            console.error('Failed to create Gmail transporter:', error);
            throw error;
        }
    }
    
    // Default SMTP configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        const errorMsg = 'Email configuration missing! Please set EMAIL_USER and EMAIL_PASSWORD environment variables';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    
    try {
        return createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            debug: process.env.NODE_ENV !== 'production',
            logger: process.env.NODE_ENV !== 'production'
        });
    } catch (error) {
        console.error('Failed to create SMTP transporter:', error);
        throw error;
    }
};

// Send verification email
export const sendVerificationEmail = async (email, fullName, verificationToken) => {
    let transporter;
    try {
        console.log('Attempting to send verification email to:', email);
        
        try {
            transporter = createTransporter();
        } catch (error) {
            console.error('Failed to create email transporter:', error.message);
            console.error('Email configuration error - check environment variables');
            return false;
        }
        
        if (!transporter) {
            console.error('Transporter is null - email configuration is missing');
            return false;
        }
        
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
        console.log('Verification URL:', verificationUrl);
        
        const mailOptions = {
            from: `"Chat App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Chat App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #667eea, #764ba2); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome to Chat App!</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Hi ${fullName},</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Thank you for signing up! Please verify your email address to complete your registration.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: linear-gradient(to right, #667eea, #764ba2); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Verify Email
                            </a>
                        </div>
                        <p style="color: #999; font-size: 14px;">
                            Or copy and paste this link in your browser:
                        </p>
                        <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                            ${verificationUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            `,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully to:', email);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending verification email:', error.message);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        console.error('Full error stack:', error.stack);
        
        // Log specific error types with more detail
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check EMAIL_USER and EMAIL_APP_PASSWORD environment variables.');
            console.error('For Gmail, make sure you are using an App Password, not your regular password.');
        } else if (error.code === 'ECONNECTION') {
            console.error('Connection failed. Check your internet connection and firewall settings.');
            console.error('Also verify EMAIL_HOST and EMAIL_PORT if using custom SMTP.');
        } else if (error.code === 'ESOCKET') {
            console.error('Socket error. The email service might be blocking the connection.');
        } else if (error.responseCode === 535) {
            console.error('Authentication failed (535). Your email credentials are incorrect.');
        }
        
        return false;
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, fullName, resetToken) => {
    try {
        const transporter = createTransporter();
        
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"Chat App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Chat App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #667eea, #764ba2); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Hi ${fullName},</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(to right, #667eea, #764ba2); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #999; font-size: 14px;">
                            Or copy and paste this link in your browser:
                        </p>
                        <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                            ${resetUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, fullName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Chat App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Chat App! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(to right, #667eea, #764ba2); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome Aboard! 🚀</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Hi ${fullName},</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Your email has been successfully verified! You're all set to start chatting.
                        </p>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Here's what you can do now:
                        </p>
                        <ul style="color: #666; font-size: 16px; line-height: 1.8;">
                            <li>Start conversations with friends</li>
                            <li>Share images and files</li>
                            <li>Customize your profile</li>
                            <li>Enjoy real-time messaging</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                               style="background: linear-gradient(to right, #667eea, #764ba2); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Start Chatting
                            </a>
                        </div>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            If you have any questions, feel free to reach out to our support team.
                        </p>
                    </div>
                </div>
            `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', email);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};
