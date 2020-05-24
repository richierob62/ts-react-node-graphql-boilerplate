import yup from 'yup';

export const emailAndPasswordValidation = yup.object().shape({
  email: yup.string().min(3).max(100).email(),
  password: yup.string().min(3).max(100),
});

export const passwordValidation = yup.object().shape({
  password: yup.string().min(3).max(100),
});
