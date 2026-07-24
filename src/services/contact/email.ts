/**
 * The notification email sent when someone uses the contact form.
 *
 * This builds HTML and plain text directly instead of handing Resend a React
 * component via its `react:` field. That field needs `@react-email/render`, an
 * optional peer dependency of `resend` — it was never installed, so every
 * submission failed at runtime with "Failed to render React component" while
 * the form itself looked fine. A template string has no peer dependency and
 * cannot fail that way.
 *
 * Every send includes BOTH parts. A message with no plain-text alternative
 * scores worse with spam filters, and this form is how employers reach a
 * candidate — it landing in Junk is the same as it not arriving.
 */

/**
 * Escape text for interpolation into HTML.
 *
 * React did this automatically; a template string does not. Everything here
 * comes from a public form, so a message containing `<script>` or `</div>`
 * would otherwise break the email or inject markup into an inbox. Escape every
 * interpolated value, without exception — including the name and the email
 * address, which are just as attacker-controlled as the message body.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface ContactEmailInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactEmail {
  html: string;
  text: string;
}

export const renderContactEmail = ({ name, email, message }: ContactEmailInput): ContactEmail => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  /* `white-space: pre-wrap` in the style below preserves the line breaks the
     sender typed, so the message doesn't arrive as one run-on paragraph. */
  const safeMessage = escapeHtml(message);

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
  <h2 style="margin:0 0 12px">New message from your portfolio</h2>
  <p style="margin:0 0 4px"><strong>From:</strong> ${safeName}</p>
  <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
  <div style="padding:12px 16px;background:#f4f4f5;border-radius:8px;white-space:pre-wrap">${safeMessage}</div>
</div>`;

  const text = `New message from your portfolio

From:  ${name}
Email: ${email}

${message}`;

  return { html, text };
};
