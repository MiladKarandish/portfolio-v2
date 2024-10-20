export const toEnglishDigits = (str: string) => {
  const pn = "۰۱۲۳۴۵۶۷۸۹";
  // const an = '٠١٢٣٤٥٦٧٨٩';

  if (/[۰-۹]/g.test(str)) {
    return str.replace(/[۰-۹]/g, (d) => pn.indexOf(d).toString());
  }

  return str;
};

export const convertToPersianNumbers = (input: string): string =>
  input.replace(/\d/g, (match) => String.fromCharCode(match.charCodeAt(0) + 1728));

export const convertToEnglishNumbers = (input: string): string =>
  input.replace(/[۰-۹]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 1728));

export const onInputNumberChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  options: { decimalPlaces?: number } = {}
): string | undefined => {
  const { value } = event.target;
  const { decimalPlaces } = options;

  const val = convertToEnglishNumbers(value).replace(/٫/g, ".");

  let newValue = val.replace(/[^0-9.]/g, "");

  if (newValue === "") return "";

  const parts = newValue.split(".");
  if (parts.length > 2) return;

  if (decimalPlaces !== undefined && parts[1]?.length > decimalPlaces) {
    parts[1] = parts[1].slice(0, decimalPlaces);
    newValue = parts.join(".");
  }

  const floatRegex = decimalPlaces !== undefined ? /^\d*\.?\d*$/ : /^\d*$/;

  if (!floatRegex.test(newValue)) return;

  return newValue;
};
