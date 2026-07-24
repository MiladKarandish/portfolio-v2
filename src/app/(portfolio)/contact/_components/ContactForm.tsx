"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm } from "@/services/contact/actions/contact";
import { initialContactState } from "@/services/contact/types";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={`btn btn-primary`} disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </button>
  );
};

const ContactForm = () => {
  const [state, formAction] = useActionState(submitContactForm, initialContactState);

  return (
    <form action={formAction} className={`space-y-4`} noValidate>
      <div>
        <label htmlFor="contact-name" className={`mb-1.5 block text-sm font-semibold`}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={state.values.name}
          placeholder="Your name"
          className={`field`}
          aria-invalid={Boolean(state.fieldErrors.name)}
          aria-describedby={state.fieldErrors.name ? "contact-name-error" : undefined}
        />
        {state.fieldErrors.name && (
          <p id="contact-name-error" className={`mt-1.5 text-sm text-red-200`}>
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className={`mb-1.5 block text-sm font-semibold`}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values.email}
          placeholder="you@company.com"
          className={`field`}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "contact-email-error" : undefined}
        />
        {state.fieldErrors.email && (
          <p id="contact-email-error" className={`mt-1.5 text-sm text-red-200`}>
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className={`mb-1.5 block text-sm font-semibold`}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          defaultValue={state.values.message}
          placeholder="What are you working on?"
          className={`field resize-y`}
          aria-invalid={Boolean(state.fieldErrors.message)}
          aria-describedby={state.fieldErrors.message ? "contact-message-error" : undefined}
        />
        {state.fieldErrors.message && (
          <p id="contact-message-error" className={`mt-1.5 text-sm text-red-200`}>
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot — off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden="true" className={`absolute left-[-9999px] h-0 w-0 overflow-hidden`}>
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={`flex flex-wrap items-center gap-4`}>
        <SubmitButton />

        {state.message && (
          <p
            role="status"
            className={`text-sm ${state.status === "success" ? "opacity-90" : "text-red-200"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
