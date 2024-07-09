const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_KEYID,
  secretAccessKey: process.env.AWS_KEYSECRET,
  region: 'ap-southeast-2',
});
const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const startInstances = (params) => {
  ec2.startInstances(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else if (data) {
      console.log('Success', data.StartingInstances);
    }
  });
};

const stopInstances = (params) => {
  ec2.stopInstances(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else if (data) {
      console.log('Success', data.StartingInstances);
    }
  });
};

const checkInstances = (params) => {
  ec2.describeInstances(params, (err, data) => {
    if (err) {
      console.log('Error', err.stack);
    } else {
      return data.Reservations[0].Instances[0].State.Name;
    }
  });
};

module.exports = { startInstances, stopInstances, checkInstances };
