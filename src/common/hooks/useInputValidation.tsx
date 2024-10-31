"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ErrorType = { [key: string]: string };

interface InputValidation {
  ref: React.RefObject<HTMLInputElement | null>;
  errors: ErrorType;
  isChanged: boolean;
}

interface Props {
  defaultValue?: string;
  validations?: {
    min?: {
      value: number;
      message: string;
    };
    max?: {
      value: number;
      message: string;
    };
  };
}

const useInputValidation = ({ defaultValue, validations = {} }: Props = {}): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  InputValidation
] => {
  const ref = useRef<HTMLInputElement>(null!);
  const [value, setValue] = useState<string>(defaultValue || "");
  const isChanged = useRef(false);

  const errorHandler = ({
    condition,
    key,
    message,
    errors,
  }: {
    condition: boolean | 0 | undefined;
    key: string;
    message: string;
    errors: ErrorType;
  }) => {
    if (!isChanged.current) return {};

    const newErrors = { ...errors };
    if (condition) {
      newErrors[key] = message;
    } else {
      delete newErrors[key];
    }

    return newErrors;
  };

  const errors: ErrorType = useMemo(() => {
    let newErros = {};

    // min
    if (validations?.min) {
      newErros = errorHandler({
        condition: value.toString().length < validations.min.value,
        key: "min",
        message: validations.min.message,
        errors: newErros,
      });
    }

    // Max
    if (validations?.max) {
      newErros = errorHandler({
        condition: value.toString().length > validations.max.value,
        key: "max",
        message: validations.max.message,
        errors: newErros,
      });
    }

    return newErros;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, value]);

  useEffect(() => {
    if (value !== defaultValue) isChanged.current = true;
    else isChanged.current = false;
  }, [defaultValue, value]);

  return [
    value,
    setValue,
    {
      ref,
      errors,
      isChanged: isChanged.current,
    },
  ];
};

export default useInputValidation;
