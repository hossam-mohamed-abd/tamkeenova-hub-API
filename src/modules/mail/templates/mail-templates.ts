const LOGO_URL = 'https://tamkeenova-hub.vercel.app/images/logo.svg';

type Variant = 'primary' | 'success' | 'danger';

const PALETTE: Record<
  Variant,
  { dark: string; deep: string; glow: string; glowSoft: string }
> = {
  primary: {
    dark: '#004265',
    deep: '#012636',
    glow: '#D9AE6F',
    glowSoft: 'rgba(217,174,111,0.35)',
  },
  success: {
    dark: '#1F5C43',
    deep: '#0E3327',
    glow: '#6FCBA3',
    glowSoft: 'rgba(111,203,163,0.35)',
  },
  danger: {
    dark: '#7A2E27',
    deep: '#3F1613',
    glow: '#E5897E',
    glowSoft: 'rgba(229,137,126,0.35)',
  },
};

const BASE = {
  background: '#EEF1F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F7F9',
  border: '#E1E6EA',
  text: '#101E27',
  textMuted: '#5B6B74',
  gold: '#BE8A3F',
};

// -- Build Email Hero Section --
function heroSection(
  variant: Variant,
  eyebrow: string,
  title: string,
  subtitle: string,
): string {
  const p = PALETTE[variant];
  return `
          <tr>
            <td align="center" bgcolor="${p.dark}" style="background: linear-gradient(135deg, ${p.dark} 0%, ${p.deep} 100%); padding: 44px 32px 40px;">

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 22px;">
                <tr>
                  <td align="center" bgcolor="#FFFFFF" style="width:92px; height:92px; border-radius:50%; background-color:#FFFFFF; box-shadow: 0 0 0 6px ${p.glowSoft}, 0 0 34px 6px ${p.glowSoft};">
                    <table role="presentation" width="92" height="92" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle" style="width:92px; height:92px;">
                          <img src="${LOGO_URL}" alt="TamkeeNova" width="52" style="width:52px; height:auto;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px; color:${p.glow}; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
                ${eyebrow}
              </p>

              <h1 style="margin:0 0 12px; color:#FFFFFF; font-size:24px; font-weight:800; line-height:1.4;">
                ${title}
              </h1>

              <p style="margin:0; color:rgba(255,255,255,0.75); font-size:14px; line-height:1.9; max-width:340px; display:inline-block;">
                ${subtitle}
              </p>
            </td>
          </tr>`;
}

// -- Wrap Email Content in the Shared Layout --
function wrapEmail(
  variant: Variant,
  heroHtml: string,
  bodyContent: string,
): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>TamkeeNova HUB</title>
  <style>
    body, table, td { font-family: 'Tahoma', 'Segoe UI', Arial, sans-serif; }
    body { margin: 0; padding: 0; background-color: ${BASE.background}; }
    img { border: 0; display: block; }
    @media only screen and (max-width: 480px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 22px !important; padding-right: 22px !important; }
      .otp-digits { font-size: 30px !important; letter-spacing: 8px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${BASE.background};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BASE.background}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%; background-color:${BASE.surface}; border-radius:22px; overflow:hidden; box-shadow: 0 18px 46px rgba(0,20,35,0.16);">

          ${heroHtml}

          ${bodyContent}

          <tr>
            <td style="padding: 8px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BASE.border}; padding-top:20px;">
                <tr>
                  <td align="center" style="padding-top:20px; color:${BASE.textMuted}; font-size:11px; line-height:1.9; letter-spacing:0.3px;">
                    منصة تمكينوفا هب لتدريب وتأهيل الكوادر البشرية والحلول المؤسسية في صعيد مصر
                    <br />
                    جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} TamkeeNova HUB
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// -- Create One-Time Password Email Template --
export function getOtpEmailTemplate(otp: string): string {
  const p = PALETTE.primary;

  const hero = heroSection(
    'primary',
    'TAMKEENOVA HUB',
    'تأكيد البريد الإلكتروني',
    'استخدم الكود ده عشان تكمل عملية التحقق من حسابك',
  );

  const body = `
          <tr>
            <td align="center" class="email-padding" style="padding: 34px 40px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; background: linear-gradient(180deg, ${BASE.surfaceAlt} 0%, ${BASE.surface} 100%); border:1.5px solid ${p.dark}22; border-radius:16px;">
                <tr>
                  <td align="center" style="padding: 26px 16px;">
                    <span class="otp-digits" style="display:inline-block; font-size:38px; font-weight:800; letter-spacing:14px; color:${p.dark}; direction:ltr; font-family:'Courier New', monospace; text-shadow: 0 0 18px ${BASE.gold}55;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 18px 40px 34px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${BASE.surfaceAlt}; border-radius:999px;">
                <tr>
                  <td style="padding:8px 18px; color:${BASE.textMuted}; font-size:12.5px; font-weight:600;">
                    ⏱ الكود هينتهي خلال 10 دقايق
                  </td>
                </tr>
              </table>
              <p style="margin: 18px 0 0; color:${BASE.textMuted}; font-size:12px; line-height:1.8;">
                لو مطلبتش الكود ده، تجاهل الإيميل وحسابك هيفضل آمن.
              </p>
            </td>
          </tr>`;

  return wrapEmail('primary', hero, body);
}

// -- Create Trainer Application Notification Email --
export function getTrainerRequestEmailTemplate(
  trainerName: string,
  trainerEmail: string,
): string {
  const hero = heroSection(
    'primary',
    'TAMKEENOVA HUB',
    'طلب انضمام مدرب جديد',
    'في طلب جديد محتاج مراجعة واعتماد من لوحة التحكم',
  );

  const body = `
          <tr>
            <td class="email-padding" style="padding: 30px 40px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BASE.surfaceAlt}; border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px; border-bottom:1px solid ${BASE.border};">
                    <p style="margin:0 0 4px; color:${BASE.textMuted}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">الاسم</p>
                    <p style="margin:0; color:${BASE.text}; font-size:15px; font-weight:700;">${trainerName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 4px; color:${BASE.textMuted}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">البريد الإلكتروني</p>
                    <p style="margin:0; color:${BASE.text}; font-size:15px; font-weight:700; direction:ltr; text-align:right;">${trainerEmail}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 26px 40px 34px;">
              <p style="margin:0; color:${BASE.textMuted}; font-size:12.5px; line-height:1.8;">
                راجع الطلب واعتمده من لوحة تحكم المدربين
              </p>
            </td>
          </tr>`;

  return wrapEmail('primary', hero, body);
}

// -- Create Trainer Approval Email --
export function getTrainerApprovedEmailTemplate(trainerName?: string): string {
  const hero = heroSection(
    'success',
    'TAMKEENOVA HUB',
    'تهانينا، تم اعتماد حسابك 🎉',
    trainerName
      ? `أهلاً ${trainerName}، حسابك كمدرب اتفعّل بنجاح`
      : 'حسابك كمدرب اتفعّل بنجاح',
  );

  const body = `
          <tr>
            <td align="center" style="padding: 30px 40px 34px;">
              <p style="margin:0; color:${BASE.textMuted}; font-size:13.5px; line-height:1.9;">
                تقدر دلوقتي تسجّل دخولك وتبدأ تستقبل طلبات الحجز من المتدربين على المنصة.
              </p>
            </td>
          </tr>`;

  return wrapEmail('success', hero, body);
}

// -- Create Trainer Rejection Email --
export function getTrainerRejectedEmailTemplate(reason: string): string {
  const hero = heroSection(
    'danger',
    'TAMKEENOVA HUB',
    'تم رفض طلب الانضمام',
    'للأسف مش قدرنا نكمل معاك الخطوة دي حالياً',
  );

  const body = `
          <tr>
            <td class="email-padding" style="padding: 30px 40px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BASE.surfaceAlt}; border-radius:14px; border-inline-start: 4px solid ${PALETTE.danger.dark};">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 6px; color:${BASE.textMuted}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">السبب</p>
                    <p style="margin:0; color:${BASE.text}; font-size:14px; line-height:1.8;">${reason}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 26px 40px 34px;">
              <p style="margin:0; color:${BASE.textMuted}; font-size:12.5px; line-height:1.8;">
                لو حابب تستفسر أو تعدّل بياناتك، تواصل معانا وهنساعدك.
              </p>
            </td>
          </tr>`;

  return wrapEmail('danger', hero, body);
}
