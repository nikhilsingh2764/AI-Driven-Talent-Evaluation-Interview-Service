const welcomeTemplate = (username) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to Our Platform</title>
    </head>

    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f4f4;">
            <tr>
                <td align="center">

                    <table width="600" cellpadding="0" cellspacing="0"
                        style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">

                        <tr>
                            <td align="center">
                                <h1 style="color:#2d3748;margin-bottom:10px;">
                                    🎉 Welcome, ${username}!
                                </h1>

                                <p style="font-size:18px;color:#555;">
                                    Your account has been created successfully.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding-top:20px;font-size:16px;color:#555;line-height:1.8;">

                                <p>
                                    Thank you for joining us! We're excited to have you as part of our community.
                                </p>

                                <p>
                                    Your registration was successful, and your account is now ready to use.
                                </p>

                                <p>
                                    You can now log in, explore the platform, and enjoy all the features we've built for you.
                                </p>

                                <p>
                                    If you ever need help, our support team is always here to assist you.
                                </p>

                                <p style="margin-top:30px;">
                                    Best regards,<br>
                                    <strong>The Team</strong>
                                </p>

                                <hr style="margin:30px 0;">

                                <p style="font-size:12px;color:#888;text-align:center;">
                                    This is an automated email. Please do not reply to this message.
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};

export default welcomeTemplate; 


//this is a welcome template send to every client