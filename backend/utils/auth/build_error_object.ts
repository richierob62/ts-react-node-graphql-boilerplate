import { ValidationError } from 'class-validator';

const getMessages = (constraints: { [type: string]: string } | undefined) => {
  if (!constraints) return [];

  return Object.keys(constraints).map((k) => constraints[k]);
};

export const buildErrorObject = (result: any) => {
  if (!result.errors) return [];

  if (result.errors[0].message === 'Invalid credentials') {
    return [
      {
        property: 'creds',
        messages: ['Invalid credentials'],
      },
    ];
  }

  if (
    result.errors[0].message ===
    'Please confirm your email address (see email sent)'
  ) {
    return [
      {
        property: 'creds',
        messages: ['Please confirm your email address (see email sent)'],
      },
    ];
  }

  if (
    result.errors[0].message ===
    'Invalid credentials.  Try again or use social media login'
  ) {
    return [
      {
        property: 'creds',
        messages: ['Invalid credentials.  Try again or use social media login'],
      },
    ];
  }

  return result.errors[0].extensions.exception.validationErrors.map(
    (vErr: ValidationError) => {
      return {
        property: vErr.property,
        messages: getMessages(vErr.constraints),
      };
    }
  );
};
