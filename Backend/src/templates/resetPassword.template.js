const resetPasswordTemplate = (otp) => {
    return `
        <h2>Password Reset OTP</h2>

        <p>Your OTP to reset your password is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 10 minutes.</p>

        <p>If you didn't request a password reset, please ignore this email.</p>
    `;
};

export default resetPasswordTemplate;