const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send restaurant onboarding credentials to the admin email.
 *
 * @param {object} opts
 * @param {string} opts.to          - recipient email
 * @param {string} opts.restaurantName
 * @param {string} opts.slug        - used to build the menu URL
 * @param {string} opts.restaurantId
 * @param {string} opts.email       - admin login email
 * @param {string} opts.password    - plaintext temp password
 * @param {string} opts.subscription
 * @param {string} opts.loginUrl    - full URL to the admin login page
 * @param {string} opts.menuUrl     - full public menu URL
 */
async function sendOnboardingEmail(opts) {
  const {
    to, restaurantName, slug, restaurantId,
    email, password, subscription, loginUrl, menuUrl,
  } = opts;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to QR Menu</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">

          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#5341cd,#6c5ce7);padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(228,223,255,0.75);">Restaurant Onboarding</p>
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Welcome to QR&nbsp;Menu&nbsp;✦</h1>
              <p style="margin:10px 0 0;font-size:14px;color:rgba(250,246,255,0.8);">Your restaurant is live. Here are your login details.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                Hi there,<br/><br/>
                <strong>${restaurantName}</strong> has been successfully set up on the platform.
                Use the credentials below to log in to your admin panel and start managing your menu and orders.
              </p>

              <!-- Credentials card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;border:1.5px solid #e4dfff;border-radius:12px;margin-bottom:28px;">
                <tr><td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6c5ce7;">Your Credentials</p>

                  ${row('Restaurant', restaurantName)}
                  ${row('URL Slug', '/' + slug)}
                  ${row('Restaurant ID', restaurantId)}
                  ${row('Subscription', subscription)}
                  ${divider()}
                  ${row('Admin Email', email)}
                  ${row('Temporary Password', password, true)}
                  ${divider()}
                  ${row('Menu URL', menuUrl)}
                  ${row('Login URL', loginUrl)}
                </td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#5341cd,#6c5ce7);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:9999px;letter-spacing:0.02em;">
                      Go to Admin Panel →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:1.5px solid #ffdcc3;border-radius:10px;margin-bottom:28px;">
                <tr><td style="padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#884800;line-height:1.5;">
                    <strong>⚠️ Security reminder:</strong> Please change your password after your first login. Do not share these credentials with anyone.
                  </p>
                </td></tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                If you have any questions, reply to this email or contact your platform administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This email was sent by QR Menu Platform · <a href="${menuUrl}" style="color:#5341cd;text-decoration:none;">View your menu</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to,
    subject: `Your QR Menu admin credentials — ${restaurantName}`,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}

/* ── helpers ── */
function row(label, value, mono = false) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="font-size:12px;font-weight:600;color:#9ca3af;width:140px;vertical-align:top;padding-top:2px;">${label}</td>
        <td style="font-size:13px;font-weight:700;color:#1f2937;${mono ? 'font-family:monospace;letter-spacing:0.05em;' : ''}">${value}</td>
      </tr>
    </table>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e4dfff;margin:14px 0;" />`;
}

module.exports = { sendOnboardingEmail };
