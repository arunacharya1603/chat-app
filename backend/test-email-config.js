// Quick script to test email configuration locally
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('=== Email Configuration Test ===\n');

// Check environment variables
console.log('1. Environment Variables Check:');
console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET ❌');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET ❌');
console.log('   EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'SET ✅' : 'NOT SET ❌');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET (using default)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('\n❌ ERROR: Email configuration is incomplete!');
    console.log('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
    process.exit(1);
}

console.log('\n2. Testing Email Connection...');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

// Verify connection
transporter.verify(function(error, success) {
    if (error) {
        console.log('\n❌ Email connection FAILED!');
        console.log('Error:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\nPossible issues:');
            console.log('1. EMAIL_APP_PASSWORD is incorrect');
            console.log('2. You need to use an App Password, not your regular Gmail password');
            console.log('3. 2-Step Verification must be enabled on your Google account');
            console.log('\nTo get an App Password:');
            console.log('1. Go to https://myaccount.google.com/security');
            console.log('2. Enable 2-Step Verification');
            console.log('3. Go to App passwords');
            console.log('4. Generate a new password for "Mail"');
            console.log('5. Use that 16-character password as EMAIL_APP_PASSWORD');
        }
    } else {
        console.log('\n✅ Email connection successful!');
        console.log('Your email configuration is working correctly.');
        
        // Try sending a test email
        console.log('\n3. Sending test email...');
        
        const mailOptions = {
            from: `"Test App" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email - Configuration Working!',
            html: `
                <h2>✅ Email Configuration Test Successful!</h2>
                <p>If you're seeing this email, your configuration is working correctly.</p>
                <p>You can now deploy your app with these environment variables.</p>
                <hr>
                <p><small>Sent from your Chat App email configuration test</small></p>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('❌ Failed to send test email:', error.message);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('   Message ID:', info.messageId);
                console.log('   Check your inbox at:', process.env.EMAIL_USER);
            }
            process.exit(0);
        });
    }
});
