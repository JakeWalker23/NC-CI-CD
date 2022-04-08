# Cloud Infrastructure Part 1: Today's Learning

In this session, we'll start to look at some key **cloud services**, using AWS as an example. First we'll visit **IAM**, which manages permissions for interacting with services, so we're taking a more secure approach on our travels. We'll then look at the cornerstone of serverless hosting, **EC2** - how to provision, manage and communicate with computers on the cloud. Then we'll take a sidestep to **S3**, used for the storage of all sorts of resources. Finally, we'll explore cloud functions with **Lambda** - useful if we just want a bitesize bit of code on the cloud. We'll also explore how Lambda functions might inter-operate with other cloud services.

## Pre Session

Some questions to kick us off in the morning:

- Where does your company host its production code?
- What do they use cloud services for (if anything)?
- Why have they chosen to manage their services in this way?

There are many cloud providers - the three biggest being Amazon Web Services, Google Cloud and Microsoft Azure. They all provide many services with overlapping capabilities - we'll focus on AWS but concepts will be applicable to other cloud providers.

Get a basic introduction to the service we'll be exploring by watching these short videos:
[Amazon Simple Storage Service](https://www.youtube.com/watch?v=77lMCiiMilo) (Amazon S3)
[Amazon Elastic Compute Cloud](https://www.youtube.com/watch?v=TsRBftzZsQo) (Amazon EC2)
[AWS Lambda](https://www.youtube.com/watch?v=eOBq__h4OJ4)
[AWS Identity and Access Management](https://youtu.be/Ul6FW4UANGc) (IAM)

How could you see each of these services being used with the products / services offered by your workplace?

## Post Session

### Self-assessment questions

Use these to help you identify gaps in your knowledge - then ask!

#### IAM

[AWS Identity and Access Management](https://youtu.be/Ul6FW4UANGc) (IAM) enables you to manage access to AWS services and resources securely. Using IAM, you can create and manage AWS users and groups, and use permissions to allow and deny their access to AWS resources.

1. Why should you not use the root account credentials any more than is absolutely necessary?
2. Why is it better to use an IAM user's credentials than the root account credentials even if that IAM user has "Administrator Privileges"?
3. What is the benefit of creating and using IAM users with only the permissions they need?

#### EC2

[Amazon Elastic Compute Cloud](https://www.youtube.com/watch?v=TsRBftzZsQo) (Amazon EC2) is a web service that provides secure, resizable compute capacity in the cloud.

1. In what ways can you customise an EC2 instance when setting it up?
2. How can you manage access to an EC2 instance?
3. How can you install software on an EC2 instance running the Amazon Linux 2 operating system?

#### S3

[Amazon Simple Storage Service](https://www.youtube.com/watch?v=77lMCiiMilo) (Amazon S3) is a versatile object storage service focusing on scalability, data availability, security, and performance.

1. What are some common use cases for S3?
2. How does S3 manage data hierarchy?
3. How does S3 differ from a database?
4. What do you have to consider when choosing a name for a new S3 bucket?

#### Lambda

[AWS Lambda](https://www.youtube.com/watch?v=eOBq__h4OJ4) lets you run code without provisioning or managing servers. You pay only for the compute time you consume. With Lambda, you can run code for virtually any type of application or backend service.

1. What benefits does using AWS Lambda bring over using a more traditional architecture?
2. What considerations do you need to make when creating a Lambda function that will interact with other AWS services?
3. What kinds of events can trigger a Lambda function?

### Skills checklist

These are things to tick off over the longer term. Test yourself by doing! The notes should be able to help you with different steps.

- I can create a virtual server on AWS
- I can limit access to the server using a network security group
- I can access the server over SSH and install a package
- I can access the server over HTTP
- I can create an S3 bucket using the AWS CLI
- I can upload files to the S3 bucket using the AWS CLI
- I can create a Lambda function using the AWS console
- I can trigger the Lambda function by uploading a file to S3

### Further activities

We've managed to log some information on Cloudwatch from our Lamdba function, triggered by an upload to S3. Have a go at actually storing this information using another AWS service - DynamoDB.

DynamoDB is AWS's enterprise level noSQL database, and has a complex and powerful API. You won't need to do anything too crazy with it to achieve this however - you just need to store the path and content type of the image once uploaded and store them. This is actually a common practice - if you were creating some sort of gallery and wanted a list of all the images you had available, reading their paths from DynamoDB is much more efficient than getting the data from S3.

Some helpful links:
- [Getting Started with DynamoDB - Create a Table](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html)
- [Node.js and DynamoDB - Create a New Item](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
