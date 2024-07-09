const AWS = require('aws-sdk');
const dotenv = require('dotenv');
// const { exec } = require('child_process');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_KEYID,
  secretAccessKey: process.env.AWS_KEYSECRET,
  region: 'ap-southeast-2',
});
const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const checkEC2 = (params) => {
  ec2.describeInstances(params, (err, data) => {
    if (err) {
      console.log('Error', err.stack);
    } else {
      return data.Reservations[0].Instances[0].State.Name;
    }
  });
};

module.exports = { checkEC2 };
