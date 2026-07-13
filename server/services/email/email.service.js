const { createTransporter } = require('../../config/nodemailer');

const templates = {
  welcome: require('./templates/welcome'),
  forgotPassword: require('./templates/forgotPassword'),
  appointmentBooked: require('./templates/appointmentBooked'),
  appointmentConfirmed: require('./templates/appointmentConfirmed'),
  appointmentCancelled: require('./templates/appointmentCancelled'),
  appointmentReminder: require('./templates/appointmentReminder'),
  paymentSuccess: require('./templates/paymentSuccess'),
  paymentReceipt: require('./templates/paymentReceipt'),
  prescriptionUploaded: require('./templates/prescriptionUploaded'),
  healthRecordUpdated: require('./templates/healthRecordUpdated'),
  passwordChanged: require('./templates/passwordChanged')
};

/**
 * Send an email using a predefined template
 * @param {string} to - Recipient email
 * @param {string} templateName - Name of the template to use
 * @param {Object} data - Data to inject into the template
 */
const sendEmail = async (to, templateName, data) => {
  try {
    const transporter = createTransporter();
    const template = templates[templateName];
    
    if (!template) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    const { subject, html } = template(data);

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'MediBook'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Email '${templateName}' sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email '${templateName}' to ${to}:`, error.message);
    return false;
  }
};

module.exports = { sendEmail };
