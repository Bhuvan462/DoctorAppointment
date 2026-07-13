const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const verifyEmailConnection = async () => {
  console.log("verifyEmailConnection function called");

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email transporter configured.");
  } catch (err) {
    console.log("⚠️ Email skipped:", err.message);
  }
};

console.log("Exports =", {
  createTransporter,
  verifyEmailConnection,
});

module.exports = {
  createTransporter,
  verifyEmailConnection,
};