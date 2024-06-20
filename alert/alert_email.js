const nodemailer = require('nodemailer');
const pug = require('pug');
// const htmlToText = require('html-to-text');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email, // list of receivers
    subject: 'New Error!', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
};

sendEmail('pengzhihsuan@gmail.com');
