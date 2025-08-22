import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1. Create a transporter (the service that will send the email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `Unieats Support <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
};

const sendVendorApprovalEmail = async (email, name) => {
    const subject = 'Congratulations! Your Unieats Vendor Application is Approved';
    const html = `
        <h2>Hello ${name},</h2>
        <p>We are excited to inform you that your vendor application for Unieats has been approved!</p>
        <p>You can now log in to the vendor dashboard to set up your menu and start receiving orders.</p>
        <p>Welcome aboard!</p>
        <p>The Unieats Team</p>
    `;
    await sendEmail({ email, subject, html });
};

const sendVendorRejectionEmail = async (email, name) => {
    const subject = 'Update on Your Unieats Vendor Application';
    const html = `
        <h2>Hello ${name},</h2>
        <p>Thank you for your interest in becoming a vendor on Unieats.</p>
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>We appreciate you taking the time to apply.</p>
        <p>Sincerely,</p>
        <p>The Unieats Team</p>
    `;
    await sendEmail({ email, subject, html });
};

export { sendVendorApprovalEmail, sendVendorRejectionEmail };