import nodemailer from 'nodemailer';

export interface EmailData {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  const { from, to, subject, text, html } = data;

  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
