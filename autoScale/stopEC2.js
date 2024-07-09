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

// const params = {
//   InstanceIds: [process.argv[3]],
//   DryRun: true,
// };

const stopInstance = (params) => {
  ec2.stopInstances(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else if (data) {
      console.log('Success', data.StartingInstances);
    }
  });
};

// else if (process.argv[2].toUpperCase() === 'STOP') {
//   ec2.stopInstances(params, (err, data) => {
//     if (err && err.code === 'DryRunOperation') {
//       params.DryRun = false;
//       ec2.stopInstances(params, (err, data) => {
//         if (err) {
//           console.log('Error', err);
//         } else if (data) {
//           console.log('Success', data.StoppingInstances);
//         }
//       });
//     } else {
//       console.log("You don't have permission to stop instances");
//     }
//   });
// }
