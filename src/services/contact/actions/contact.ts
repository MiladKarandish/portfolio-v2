"use server";

export const onSubmitEmail = async (prevState: unknown, formData: FormData) => {
  const { name, email, message } = Object.fromEntries(formData) as {
    name: string;
    email: string;
    message: string;
  };

  if (name.length < 3) {
    return {
      errors: "name has to be more than 3 characters!",
    };
  }

  const response = await fetch("http://localhost:3000/api/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};
