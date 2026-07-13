module.exports = (data) => {
  return {
    subject: 'Appointment Cancelled - MediBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: #38bdf8; margin: 0;">MediBook</h1>
        </div>
        <div style="padding: 30px 20px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${data.name || 'User'},</h2>
          <p style="line-height: 1.6; color: #475569;">This is a notification regarding your MediBook account.</p>
          ${data.body ? `<p style="line-height: 1.6; color: #475569;">${data.body}</p>` : ''}
          ${data.details ? `
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              ${Object.entries(data.details).map(([key, value]) => `<p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>`).join('')}
            </div>
          ` : ''}
          ${data.link ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.link}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">${data.linkText || 'View Details'}</a>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MediBook Healthcare. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
  };
};
