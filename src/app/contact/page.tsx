"use client";

import { onSubmitEmail } from "@/services/contact/actions/contact";
import { useFormState } from "react-dom";

const Contact = () => {
  const [state, formAction] = useFormState(onSubmitEmail, undefined);
  console.log(state);

  return (
    <form action={formAction} className={`text-black`}>
      <label htmlFor="name">Name</label>
      <input type="text" name="name" placeholder="Enter your name" required />

      <label htmlFor="email">Email</label>
      <input type="email" name="email" placeholder="Enter your email" required />

      <label htmlFor="message">Message</label>
      <textarea name="message" placeholder="Enter your message" required></textarea>

      <button type="submit">Send it away</button>
    </form>
  );
};

export default Contact;
