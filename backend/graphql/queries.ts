export const loginMutation = `
mutation login($data: LoginInput!) {
  login(data: $data) {
    id
    email
    firstName
    lastName
  }
}
`;

export const currentUserQuery = `
query {
  currentUser{
    id
    email
    firstName
    lastName
  }
}
`;

export const registerMutation = `
mutation Register($data: RegisterInput!) {
  register(data: $data) {
    id
    email
    firstName
    lastName
  }
}
`;

export const forgotPasswordMutation = `
mutation ForgotPassword($data: EmailInput!) {
  forgotPassword(data: $data) 
}
`;

export const resetPasswordMutation = `
mutation ResetPassword($data: PasswordResetInput!) {
  resetPassword(data: $data) 
}
`;

export const logoutMutation = `
mutation Logout {
  logout
}
`;
