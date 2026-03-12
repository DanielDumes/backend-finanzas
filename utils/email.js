// backend/utils/email.js
const { Resend } = require('resend');

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendVerificationEmail(email, nombre, token) {
    const resend = getResend();
  const verifyUrl = `${process.env.FRONTEND_URL}/verificar?token=${token}`;

  await resend.emails.send({
    from: 'FinFlow <onboarding@resend.dev>',
    to: email,
    subject: '✅ Verifica tu cuenta de FinFlow',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; background: #f4f7f4; padding: 40px 24px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <h1 style="font-size: 28px; color: #1a2e1d; margin: 0 0 8px;">
            Fin<span style="color: #2d7a3a;">Flow</span>
          </h1>
          <p style="color: #5a7a5e; font-size: 14px; margin: 0 0 32px;">Control de finanzas personales</p>

          <h2 style="font-size: 20px; color: #1a2e1d; margin: 0 0 12px;">
            Hola, ${nombre} 👋
          </h2>
          <p style="color: #5a7a5e; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
            Gracias por registrarte en FinFlow. Para activar tu cuenta haz clic en el botón de abajo.
          </p>

          <a href="${verifyUrl}"
            style="display: inline-block; background: #2d7a3a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.05em;">
            Verificar mi cuenta
          </a>

          <p style="color: #92ab95; font-size: 12px; margin: 28px 0 0; line-height: 1.6;">
            Este enlace expira en <strong>24 horas</strong>. Si no creaste esta cuenta puedes ignorar este correo.
          </p>

          <hr style="border: none; border-top: 1px solid #e4ede4; margin: 24px 0;" />
          <p style="color: #92ab95; font-size: 11px; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} FinFlow — Control de finanzas personales
          </p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };