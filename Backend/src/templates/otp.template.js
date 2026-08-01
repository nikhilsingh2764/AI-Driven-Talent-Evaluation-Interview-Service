const otpTemplate = (username, otp) => {  
    return `
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
    </head>

    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding:40px 0;">

                    <table width="600" cellpadding="0" cellspacing="0"
                        style="background:#ffffff;border-radius:8px;padding:40px;">

                        <tr>
                            <td align="center">
                                <h2>Email Verification</h2>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <p>Hello <strong>${username}</strong>,</p>

                                <p>
                                    Use the OTP below to verify your email address.
                                </p>

                                <div
                                    style="margin:30px 0;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;">
                                    ${otp}
                                </div>

                                <p>
                                    This OTP is valid for <strong>10 minutes</strong>.
                                </p>

                                <p>
                                    If you didn't request this, please ignore this email.
                                </p>

                                <hr>

                                <p style="font-size:12px;color:gray;">
                                    This is an automated email. Please do not reply.
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

export default otpTemplate;  //this is a OPT template send to every client