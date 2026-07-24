"use server";

import { Resend } from "resend";
import { person } from "@/data/profile";
import { renderContactEmail } from "../email";
import type { IContactFormState } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactForm = async (
  _prevState: IContactFormState,
  formData: FormData
): Promise<IContactFormState> => {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  // A field no human sees and no human fills in. Bots fill in everything.
  const honeypot = String(formData.get("company") ?? "").trim();

  const values = { name, email, message };
  const fieldErrors: IContactFormState["fieldErrors"] = {};

  if (name.length < 2) fieldErrors.name = "Please tell me your name.";
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "That does not look like an email address.";
  if (message.length < 10) fieldErrors.message = "A little more detail would help.";
  if (message.length > 5000) fieldErrors.message = "That is longer than 5000 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors, values };
  }

  // Report success to the bot; send nothing.
  if (honeypot) {
    return { status: "success", message: "Thanks — your message is on its way.", fieldErrors: {}, values };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message: `The form is not configured right now — please email ${person.email} directly.`,
      fieldErrors: {},
      values,
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { html, text } = renderContactEmail({ name, email, message });

    const { error } = await resend.emails.send({
      // Resend's shared sender works without a verified domain and delivers to
      // the account owner — which is exactly this inbox. Set CONTACT_FROM_EMAIL
      // once a domain is verified.
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [person.email],
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      // `html` + `text`, not Resend's `react` field — that one needs the
      // `@react-email/render` peer dependency and failed at runtime without it.
      // See ../email.ts.
      html,
      text,
    });

    if (error) {
      console.error("Resend rejected the contact email:", error);
      return {
        status: "error",
        message: `Something went wrong sending that. Email ${person.email} directly and it will reach me.`,
        fieldErrors: {},
        values,
      };
    }

    return {
      status: "success",
      message: "Thanks — that reached me. I usually reply within a day or two.",
      fieldErrors: {},
      values: { name: "", email: "", message: "" },
    };
  } catch (error) {
    console.error("Contact form failed:", error);
    return {
      status: "error",
      message: `Something went wrong sending that. Email ${person.email} directly and it will reach me.`,
      fieldErrors: {},
      values,
    };
  }
};
