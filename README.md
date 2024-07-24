# NodeGuardian
![image](https://github.com/user-attachments/assets/00736604-9a7e-4f61-b329-8cf1f22da5c2)

Website Link: [NodeGuardian](https://nodeguardianapp.com/home)

## Introduction
NodeGuardian is a centralized log management service aiming at helping developers debug and monitor their applications. 
By collecting log data from clients, NodeGuardian is able to organize the data and render it in a way that is easier for developers to inspect.
It is also capable of sending notification emails when an anomaly occurs, making it an excellent monitoring tool.

## Features
- **Easy-to-understand management dashboard**: turning raw data into meaningful information.
- **Alarm system**: sending emails upon detecting anomaly. 
- **Different rules settings**: letting users modify their notification settings based on their need.
- **Collaboration feature**: allowing users to manage projects with others.

### Management page
- Shows numbers of occurrences
- Shows their timeline
- Shows numbers of affected IP
  
![image](https://github.com/user-attachments/assets/21bfa254-a05d-41b2-b996-c202c0ffa1d6)
### Error deatils
- Shows stack traces
- Shows some important params

![image](https://github.com/user-attachments/assets/d0a85f38-c1a7-4c65-806d-75ea88f822f8)




## Setup instructions
1. Sign up for a NodeGuardian account, or you can use this account to sign in, email: guest@gmail.com, password: guest.
2. Sign in to your account and create a project, when creating projects, you will get an access token which will be used to initialize the SDK.
3. Install [this](https://www.npmjs.com/package/node-guardian) NPM package, the package's README contains information about how to start the NodeGuardian Services.
<img width="726" alt="image" src="https://github.com/user-attachments/assets/2d715666-74c3-4b7b-9614-7441f658b3e9">

## Tech/Framework Used
- Node.js
- Express
- Pug
- Docker
- RabbitMQ
- Elasticsearch
- AWS cloud services
  - EC2
  - Elasticache
  - RDS (MySQL)
## Architecture
![Final drawio](https://github.com/user-attachments/assets/679c2246-7cd9-44d2-b074-7cb33b35aa31)




