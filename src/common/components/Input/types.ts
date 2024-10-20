import { DetailedHTMLProps, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export type TextareaProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

export type Props = (InputProps | TextareaProps) & {
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  isTextArea?: boolean;
  loading?: boolean;
  separator?: boolean;
  datatype?: "string" | "number";
  label?: string;
  type?: string;
  errorMessage?: string;
  hasError?: boolean;
  allowFloat?: boolean;
  decimalPlaces?: number;
  onInputChange: (value: string) => void;
  errors?: { [key: string]: string };
};
