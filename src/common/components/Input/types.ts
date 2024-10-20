import { DetailedHTMLProps, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export type TextareaProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

export type Props = (InputProps | TextareaProps) & {
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  label?: string;
  type?: string;
  isTextArea?: boolean;
  loading?: boolean;
  decimalPlaces?: number;
  thousandsSeparator?: boolean;
  errors?: { [key: string]: string };
  onInputChange: (value: string) => void;
};
