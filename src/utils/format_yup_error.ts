import { ValidationError } from 'yup';

export const formatYupError = (e: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = [];

  e.inner.forEach((error) => {
    errors.push({ path: error.path, message: error.message });
  });

  return errors;
};
