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
### Error Details
- Shows stack traces
- Shows some important params

![image](https://github.com/user-attachments/assets/d0a85f38-c1a7-4c65-806d-75ea88f822f8)




## Setup Instructions
1. Sign up for a NodeGuardian account, or you can use this account to sign in, email: guest@gmail.com, password: guest.
2. Sign in to your account and create a project, when creating projects, you will get an access token which will be used to initialize the SDK.
3. Install [this](https://www.npmjs.com/package/node-guardian) NPM package, the package's README contains information about how to start the NodeGuardian services.
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
![Finish2 drawio](https://github.com/user-attachments/assets/4363e308-6f77-4715-83e9-c8a951d22207)

## Stress Test
The system's bottleneck seems to occur during the processing of error log data, which is why this stress test aims to explore the effectiveness of workers that are capable of auto scale compared to a single worker.

### Data & Graph Comparison
<img width="900" src="https://github.com/user-attachments/assets/c1a11a20-7625-4f74-958b-ee436f0d1040">

![image](https://github.com/user-attachments/assets/7fa8469f-8f94-4e8e-a066-c6c3f904cf96)


#### Summary
As stats above, it is clear that an auto-scaling group can save a significant amount of time. Implementing extra instances will cost an additional amount of money, which is why the following section will calculate that and evaluate the overall cost-effectiveness of this approach.

### Extra Cost
The section below summarize the extra amount of money required to use the auto scaling group, I hypothesize that the situation where the 
scaling group is needed will happen once per day. (This number is only hypothetical, its mere purpose is to let me estimate the extra cost 
of money.) I am using t2.micro, its on demand hourly rate is $0.0146.

![image](https://github.com/user-attachments/assets/0cb74e55-177a-4220-a352-35aacd15c7a9)
![image](https://github.com/user-attachments/assets/42fc4c99-3cff-4ed4-b716-0f2e270cbfe4)


### Conclusion
Implementing auto scaling group can save a significant amount of time, and it is not at all expensive. The system right now can process and send notification emails **within 1 minute** at a rate of **12,000 data points per second**. Please note that the real throughput may be different from this test's hypothetical value and that close monitoring of worker's status is crucial in deciding the scale out strategy.

# Other Tech Options 

### Lambda Function
AWS Lambda is particularly suitable in this scenario due to its ability to scale automatically without any additional configuration. Furthermore, it eliminates the need to worry about infrastructure or unexpected machine failures. Further testing may be needed to determine if this implementation can handle large throughput.
![lambda drawio](https://github.com/user-attachments/assets/26cc8769-73af-4514-8264-acf982df4e50)

### Elastic Container Service - Fargate
AWS ECS is another excellent option for container management. It offers robust features such as automatic scaling and the capability to restart containers in the event of a failure. ECS operates containers within clusters, which can be managed using either AWS Fargate or EC2 instances. Due to the serverless nature of AWS Fargate, it scales rapidly in response to traffic surges, making it a strong choice for my application.
![Far drawio (1)](https://github.com/user-attachments/assets/aabf6fdc-8237-4b69-b934-a43f6049600c)







