const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASSWORD,
  },
});

exports.sendFirstErrorEmail = async (email, name, projectName, payLoad) => {
  const { errMessage } = payLoad;
  const html = pug.renderFile(`${__dirname}/../views/emails/firstError.pug`, {
    name,
    // url: this.url,
    projectName,
    errMessage,
    payLoad,
  });

  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Alert! New Error from ${projectName}! ${errMessage}`,
    html,
    text: htmlToText(html),
  });
  console.log('Message sent: %s', info.messageId);
};

exports.sendAnomalyEmail = async (row, payLoad) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/anamoly.pug`, {
    row,
    payLoad,
  });
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: row.email,
    subject: 'Anomaly Detect! An error just exceeded your project threshold!',
    html,
    text: htmlToText(html),
  });

  console.log('Message sent: %s', info.messageId);
};

exports.sendReactivateEmail = async (row, payLoad) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/reactivate.pug`, {
    row,
    payLoad,
  });
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: row.email,
    subject: 'Error Reactivated! A resolved error just got reactivated!',
    html,
    text: htmlToText(html),
  });

  console.log('Message sent: %s', info.messageId);
};

exports.sendProjectInvitation = async (
  email,
  name,
  projectOwner,
  projectName,
  confirmUrl,
) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/invitation.pug`, {
    name,
    projectOwner,
    projectName,
    confirmUrl,
  });
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Hi! Here is your invitation!',
    html,
    text: htmlToText(html),
  });
  console.log('Message sent: %s', info.messageId);
};

exports.sendProjectInvitationAndSignUp = async (
  email,
  projectOwner,
  projectName,
  signUpUrl,
) => {
  const html = pug.renderFile(
    `${__dirname}/../views/emails/inviteAndSignUp.pug`,
    {
      projectOwner,
      projectName,
      signUpUrl,
    },
  );
  const info = await transporter.sendMail({
    from: `"NodeGuardian" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Hi! Here is your invitation!',
    html,
    text: htmlToText(html),
  });
  console.log('Message sent: %s', info.messageId);
};
