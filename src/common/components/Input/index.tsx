"use client";

import { useMemo } from "react";
import { cn } from "@/utils/className";
import { InputProps, Props, TextareaProps } from "./types";
import { isObjectEmpty } from "@/utils/objects";
import { onInputNumberChange } from "@/utils/numbers";

const Input = ({
  inputRef,
  value,
  errors = {},
  label,
  type,
  isTextArea,
  decimalPlaces,
  thousandsSeparator: separator,
  loading,
  onInputChange,
  ...rest
}: Props) => {
  const isFloat = value?.toString().split(".")[1];

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === "number") {
      const newValue = onInputNumberChange(e, { decimalPlaces });
      if (newValue || newValue === "") {
        onInputChange(newValue);
      }
    } else {
      const value = e.target.value;
      onInputChange(value.trim() === "" ? "" : value);
    }
  };

  const formattedValue = useMemo(() => {
    return value
      ? (isFloat === undefined || (isFloat?.length > 0 && isFloat?.at(-1) != "0")) && separator
        ? Number(value)?.toLocaleString(undefined, {
            maximumFractionDigits: decimalPlaces ? decimalPlaces + 1 : 5,
          })
        : value
      : "";
  }, [decimalPlaces, isFloat, separator, value]);

  return (
    <div className={`animate-fadeIn w-full`}>
      <div
        className={cn(
          `input ${type === "number" && separator ? "thousands-separate" : ""} ${type === "number" ? "ltr" : "rtl"}`,
          {
            "input-loading": loading,
          }
        )}
        data-value={formattedValue === "0" ? "" : formattedValue}
      >
        {isTextArea ? (
          <textarea
            {...(rest as TextareaProps)}
            ref={inputRef as React.LegacyRef<HTMLTextAreaElement> | undefined}
            placeholder=""
            value={value || ""}
            onChange={onChange}
            rows={4}
            className=""
          />
        ) : (
          <>
            <input
              {...(rest as InputProps)}
              ref={inputRef as React.LegacyRef<HTMLInputElement> | undefined}
              placeholder=""
              inputMode={type === "number" ? "numeric" : "text"}
              value={value}
              onChange={onChange}
            />

            {separator && <textarea onChange={onChange} value={formattedValue} />}
          </>
        )}
        {label && <label htmlFor={rest.name}>{label}</label>}
      </div>
      {!isObjectEmpty(errors) && (
        <div>
          {Object.values(errors).map((error) => (
            <p key={error} className={cn("mt-1 text-red-500 text-sm")}>
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Input;
