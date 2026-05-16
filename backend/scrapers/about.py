import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = "smtp.yourprovider.com"
SMTP_PORT = 587
SMTP_USER = "you@example.com"
SMTP_PASS = "your-password"

def send_subscription_email(to_email, user_name="Subscriber"):
    subject = "Thanks for subscribing to our newsletter"

    text = f"""
Hi {user_name},

Thanks for subscribing to our newsletter.

You’ll start receiving updates from us soon.

If this wasn’t you, you can ignore this email.
"""

    html = f"""
    <html>
      <body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                     style="max-width:600px; background:#ffffff; border-radius:12px; padding:40px;">
                <tr>
                  <td align="center">
                    <h1 style="margin:0 0 16px; color:#222;">Thanks for subscribing</h1>
                    <p style="margin:0 0 16px; color:#555; font-size:16px; line-height:1.6;">
                      Hi {user_name},
                    </p>
                    <p style="margin:0 0 24px; color:#555; font-size:16px; line-height:1.6;">
                      Thank you for subscribing to our newsletter. You'll now receive updates, news, and useful content from us.
                    </p>
                    <a href="https://yourdomain.com/newsletter"
                       style="display:inline-block; padding:14px 24px; background:#01696f; color:#ffffff;
                              text-decoration:none; border-radius:8px; font-weight:bold;">
                      Visit our website
                    </a>
                    <p style="margin:24px 0 0; color:#888; font-size:13px; line-height:1.5;">
                      If you did not subscribe, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SMTP_USER
    message["To"] = to_email

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to_email, message.as_string())