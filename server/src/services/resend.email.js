import { Resend } from 'resend';

const resend = new Resend('re_7g8xkD66_LgwotUQAH9MNEQpS6T1U4tgT');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'mnmuktinfo@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});