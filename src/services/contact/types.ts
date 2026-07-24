/**
 * Types and the initial state live outside the action file on purpose: every
 * export of a `"use server"` module is rewritten into a server reference, so a
 * plain object exported from there arrives on the client as an opaque function
 * rather than the object it looks like.
 */

export interface IContactFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"name" | "email" | "message", string>>;
  /** Echoed back so a failed submit does not wipe what the visitor typed. */
  values: { name: string; email: string; message: string };
}

export const initialContactState: IContactFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: { name: "", email: "", message: "" },
};
