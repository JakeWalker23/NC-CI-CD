# Domain 2: Security & Compliance

## 3.1 Define methods of deploying and operating in the AWS Cloud

This is concerned with how you get your applications on the cloud, and how you work with them once they are there.

We have worked with several means of provisioning & interfacing with infrastructure:

- the management console
- programmatic access with the JavaScript SDK (i.e. using a Lambda function to find out more information about an object that's been uploaded to S3). There are SDKs available for several other languages.
- the CLI (i.e. using your command line to examine the contents of an S3 bucket)
- Infrastructure as code with CloudFormation and Terraform (which uses the SDK under the hood)

Both the SDK and the CLI use the AWS APIs under the hood to make requests to services. It's also possible to use the API directly, with whatever HTTP client you wish, but the SDK and CLI provide neat abstractions.

We have also worked with a public internet connection on an entirely cloud native basis, but AWS provides some 'halfway houses' for customers who don't want to or cannot work in this way

- connection via a VPN, so all connections to AWS happen within a private network
- [AWS Direct Connect](https://aws.amazon.com/directconnect/), which enables you to interact with AWS services with low-latency from essentially wherever you like.
- Hybridising or bringing AWS services on premises - some options [here](https://aws.amazon.com/hybrid/)

## 3.2 Define the AWS global infrastructure

AWS's global infrastructure is largely defined by

- **Regions**: a cluster of data centres in some geographic location
- **Availability Zones**: one set of data centres within that region, physically separated from others.
- **Edge Locations**: smaller centres around the world close to population centres.

Availability zones are currently unique to AWS as a cloud provider. They allow AWS to claim better fault tolerance that their competitors, if a customer deploys across multiple zones.

Edge locations allow customer requests to be made closer to home for lower latency. Two services that make use of edge locations are (**AWS CloudFront**)[https://aws.amazon.com/cloudfront/] which maintains 'points of presence' close to users where you can choose to place your data (useful for static websites, for example), and (**AWS Global Accelerator**)[https://aws.amazon.com/global-accelerator/] which intelligently 'pre-routes' for traffic to avoid congestion, much like checking road traffic before setting out on a journey.

You can also take advantage of global infrastructure patterns in order to

- recover from application failures by routing users to other places, or retrieve data stored in multiple places
- ensure data is stored within the appropriate jurisdiction for your requirements

## 3.3 Identify the core AWS services

AWS services are numerous, but many can be categorised neatly into

### _compute_

...or computing power for most imaginable workloads. This is based around EC2; there are different families of EC2 instances that are suitable for different tasks, like data management, networking capabilities, CPU types, data storage types etc. It also includes Lambda, a serverless interpretation of Compute, and ECS, which provides containerised compute services. **Load balancing** uses compute power to manage some aspects of traffic networking.

### _storage_

...or repositories in which you can place and retrieve assets / objects / documents / most imaginable things. S3 is the primary example; S3 Glacier is a cheaper variant for slower access to less frequently accessed objects. EBS and EFS are built around the idea of 'elasticity' - not actively provisioning additional servers for storage, but paying for what you use.

### _networking_

...or managing how traffic moves from one place to another. VPC replicates the idea of a traditional private network on the cloud, and Security Groups are used to manage types and sources of traffic into and within the VPC. Route 53 exists for managing DNS-related traffic rules.

### _database_

...or solutions for the logical storage and retrieval of data
