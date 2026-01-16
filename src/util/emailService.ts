import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail App Password (NOT your login password)
    }
});

export const sendPasswordEmail = async (email: string, password: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your New Account Password',
            text: `Welcome! Your account has been created via Google Login.\n\nYour temporary password is: ${password}\n\nPlease login and change it immediately.`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Password email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendUserWelcomeEmail = async (email: string, name: string) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Mack Trading!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
            
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        
                        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                            
                            <tr>
                                <td style="background-color: #1a202c; padding: 30px; text-align: center;">
                                    <img src="https://res.cloudinary.com/dkidles6w/image/upload/v1763217901/logo-remove-bg_qapadg.png" 
                                         alt="Mack Trading Logo" 
                                         style="max-width: 150px; height: auto; display: block; margin: 0 auto;"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 40px 30px; color: #333333;">
                                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px;">Welcome, ${name}!</h2>
                                    
                                    <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
                                        Thank you for registering with <strong>Mack Trading</strong>. We are thrilled to have you on board! Your account has been successfully created.
                                    </p>
                                    
                                    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                                        You can now access your dashboard and start trading.
                                    </p>

                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="http://your-website-url.com/login" 
                                           style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                                           Login to Your Account
                                        </a>
                                    </div>

                                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                                        If you have any questions, feel free to reply to this email.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                                    <p style="margin: 0 0 10px 0; color: #888888; font-size: 12px;">
                                        &copy; ${new Date().getFullYear()} Mack Trading. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #888888; font-size: 12px;">
                                        Powered by <strong>Web Sonic Softwares</strong>
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
            
        </body>
        </html>
    `
    };
    await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (toEmail: string, order: any, user: any) => {

    // Generate Item Rows for the Table
    const itemsHtml = order.items.map((item: any) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.item.name || 'Product'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.qty}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">LKR ${(item.item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join('');

    // Email Template
    const mailOptions = {
        from: `"Mack Trading" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Order Confirmation - ${order.tracking_number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #061653;">Thank you for your order!</h2>
                <p>Hi ${user.firstName},</p>
                <p>We have received your order. Here are the details:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> ${order.tracking_number}</p>
                    <p><strong>Total Amount:</strong> LKR ${order.totalAmount}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #061653; color: white;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: left;">Qty</th>
                            <th style="padding: 10px; text-align: left;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <p style="margin-top: 20px;">We will notify you once your items are shipped.</p>
                <p style="color: #888; font-size: 12px;">Mack Trading Team</p>
            </div>
        `
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation sent to ${toEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};