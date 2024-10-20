interface IValidationError {
  isValid: false;
  errorMessage: string;
}

export type ValidatorFn = ({
  value,
  rule,
  errorMessage,
}: {
  value: string;
  rule: string | number;
  errorMessage?: string;
}) => true | IValidationError;

// Min
export const minLengthValidator: ValidatorFn = ({
  value,
  rule = 1,
  errorMessage = "Minimum length is 1",
}): true | IValidationError => {
  if (value && value.length < +rule) {
    return {
      isValid: false,
      errorMessage,
    };
  }

  return true;
};

// Max
export const maxLengthValidator: ValidatorFn = ({
  value,
  rule = 1,
  errorMessage = "Maximum length is 1",
}): true | IValidationError => {
  if (value && value.length > +rule) {
    return {
      isValid: false,
      errorMessage,
    };
  }

  return true;
};
