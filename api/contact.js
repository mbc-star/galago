export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, organisation, service, message } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const serviceLabels = {
    deploy:    'Galago Deploy — platform build',
    boost:     'Galago Boost — AI training',
    kit:       'Galago Kit — prompt packs',
    discovery: 'Discovery call',
  };

  const serviceLabel = serviceLabels[service] || 'Not specified';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Galago Contact <contact@mygalago.com>',
        to:   ['contact@mygalago.com'],
        reply_to: email,
        subject: `New contact: ${name}${organisation ? ` · ${organisation}` : ''}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F0EDE6; border-radius: 12px;">
            <div style="margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #1A9E4A; margin-bottom: 8px;">New message via mygalago.com</div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0A150D; margin: 0;">${name}</h1>
              ${organisation ? `<div style="font-size: 14px; color: #5A6E5C; margin-top: 4px;">${organisation}</div>` : ''}
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 12px; background: #E8E4DC; border-radius: 8px 8px 0 0; font-size: 12px; font-weight: 600; color: #5A6E5C; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
                <td style="padding: 10px 12px; background: #E8E4DC; border-radius: 8px 8px 0 0; font-size: 14px; color: #0A150D;"><a href="mailto:${email}" style="color: #1A9E4A;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #fff; font-size: 12px; font-weight: 600; color: #5A6E5C; text-transform: uppercase; letter-spacing: 0.08em;">Service</td>
                <td style="padding: 10px 12px; background: #fff; font-size: 14px; color: #0A150D;">${serviceLabel}</td>
              </tr>
            </table>
            ${message ? `
            <div style="background: #fff; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6E5C; margin-bottom: 8px;">Message</div>
              <div style="font-size: 14px; line-height: 1.7; color: #2A3D2E; white-space: pre-wrap;">${message}</div>
            </div>` : ''}
            <div style="font-size: 12px; color: #5A6E5C; border-top: 1px solid #D8D4CC; padding-top: 16px;">
              Sent from mygalago.com · Reply directly to this email to respond.
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
