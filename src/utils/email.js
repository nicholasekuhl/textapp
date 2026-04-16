// Sending addresses (set via env or defaults):
// RESEND_FROM_INVITES=invites@veloxo.io
// RESEND_FROM_NOREPLY=noreply@veloxo.io
// RESEND_FROM_BILLING=billing@veloxo.io
// RESEND_FROM_SUPPORT=support@veloxo.io

const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = {
  invites: process.env.RESEND_FROM_INVITES || 'invites@veloxo.io',
  noreply: process.env.RESEND_FROM_NOREPLY || 'noreply@veloxo.io',
  billing: process.env.RESEND_FROM_BILLING || 'billing@veloxo.io',
  support: process.env.RESEND_FROM_SUPPORT || 'support@veloxo.io',
}

const sendCreditPurchaseEmail = async ({
  toEmail, agentName, creditType,
  creditAmount, dollarAmount, newBalance
}) => {
  await resend.emails.send({
    from: FROM.billing,
    to: toEmail,
    subject: `Credit Purchase Confirmed — ${creditAmount} ${creditType} Credits`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0a0a0f">Purchase Confirmed</h2>
        <p>Hi ${agentName},</p>
        <p>Your credit purchase was successful.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Credit Type</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">
              ${creditType} Credits</td>
          </tr>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Credits Added</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">
              +${creditAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Amount Charged</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">
              $${dollarAmount}</td>
          </tr>
          <tr>
            <td style="padding:8px">New Balance</td>
            <td style="padding:8px;font-weight:bold">
              ${newBalance.toLocaleString()} credits</td>
          </tr>
        </table>
        <p>Questions? Reply to this email or contact
           <a href="mailto:support@veloxo.io">support@veloxo.io</a></p>
        <p style="color:#666;font-size:12px;margin-top:24px">
          Veloxo &middot; veloxo.io</p>
      </div>
    `
  })
}

module.exports = { sendCreditPurchaseEmail, FROM, resend }
