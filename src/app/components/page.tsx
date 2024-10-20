"use client";

import Input from "@/common/components/Input";
import useInputValidation from "@/common/hooks/useInputValidation";

const ComponentsPage = () => {
  const [name, setName, { ref, errors }] = useInputValidation({
    validations: {
      min: {
        value: 1,
        message: "Name must be at least 1 character long",
      },
    },
  });

  console.count("Render");

  return (
    <div className={`w-dvw h-dvh flex flex-col items-center justify-center text-lg`}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Input
          inputRef={ref}
          label="Name"
          type="number"
          value={name}
          errors={errors}
          onInputChange={(value) => {
            setName(value);
          }}
          separator
        />

        <input type="text" className={`text-black`} value={name} onChange={(e) => setName(e.target.value)} />

        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded-md`}
          disabled={Object.keys(errors).length > 0}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ComponentsPage;
