const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASSWORD,
  },
});

exports.sendFirstErrorEmail = async (email) => {
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email, // list of receivers
    subject: 'New Error!', // Subject line
    text: 'Your app got an new error, check it out right now!', // plain text body
    html: '<b>Hello world?</b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
};

exports.sendAnomalyEmail = async (email) => {
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email, // list of receivers
    subject: 'Anomaly Detect!', // Subject line
    text: 'Your app got an anamoly, check it out right now!', // plain text body
    html: '<b>Hello world?</b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
};
