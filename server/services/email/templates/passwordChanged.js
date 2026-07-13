module.exports = (data) => {
  return {
    subject: 'Password Changed - MediBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: #38bdf8; margin: 0;">MediBook</h1>
        </div>
        <div style="padding: 30px 20px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${data.name || 'User'},</h2>
          <p style="line-height: 1.6; color: #475569;">Your MediBook password has been changed successfully.</p>
          <p style="line-height: 1.6; color: #475569;">If you did not perform this action, please contact support immediately.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MediBook Healthcare. All rights reserved.</p>
        </div>
      </div>
    `
  };
};
