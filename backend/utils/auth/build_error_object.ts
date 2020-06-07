import { ValidationError } from 'class-validator';

const getMessages = (constraints: { [type: string]: string } | undefined) => {
  if (!constraints) return [];

  return Object.keys(constraints).map((k) => constraints[k]);
};

export const buildErrorObject = (result: any) => {
  if (!result.errors) return [];

  return result.errors[0].extensions.exception.validationErrors.map(
    (vErr: ValidationError) => {
      return {
        property: vErr.property,
        messages: getMessages(vErr.constraints),
      };
    }
  );
};
