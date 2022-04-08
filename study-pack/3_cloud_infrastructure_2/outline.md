# Cloud Infrastructure Part 2: Today's Learning

In this session, we'll explore some of the services that help us manage containers on the cloud, and through this, other ways AWS helps you manage secure communications to, from and amongst your services. This will include the **VPC**, and **security groups**. Using AWS's **Elastic Container Service**, we'll start to explore some of the benefits of deploying your application on containers (and the problems that you need to fix). We'll also have a look at **RDS** as a way of managing the relational data needed for our application.

## Pre Session

We looked at EC2 yesterday - here are short videos introducing two services offered by AWS that are formed out of specifically configured EC2 instances.

[Amazon Elastic Container Service](https://www.youtube.com/watch?v=eq4wL2MiNqo) (Amazon ECS)
[Amazon Relational Database Service](https://youtu.be/eMzCI7S1P9M) (Amazon RDS)

Some questions to kick us off in the morning:

What could these services offer in delivering your company's product?

As we start to connect more AWS services and serve more traffic, what concerns do you think might need addressing?

## Post Session

### Self-assessment questions

Use these to help you identify gaps in your knowledge - then ask!

#### RDS

[Amazon Relational Database Service](https://youtu.be/eMzCI7S1P9M) (Amazon RDS) is a web service that makes it easier to set up, operate, and scale a relational database in the AWS Cloud.

1. What does using RDS give you over managing your database directly in an EC2?
2. How should you manage access to an RDS database?

#### ECS / ECR

Amazon Elastic Container Registry (ECR) is a fully-managed Docker container registry that makes it easy for developers to store, manage, and deploy Docker container images.

1. How do you get your images on ECR?
2. Why might you choose to use Amazon ECR over another image registry such as Docker Hub?

[Amazon Elastic Container Service](https://www.youtube.com/watch?v=eq4wL2MiNqo) (Amazon ECS) is a fully managed container orchestration service.

1. What gets defined in a task definition?
2. What are some of the main parameters of a service?
3. What metrics can be used to trigger a service to scale up or down?

#### ALB

Application Load Balancers (ALBs) automatically distribute incoming application traffic across multiple targets, such as Amazon EC2 instances, containers, IP addresses, and Lambda functions.

1. What are the benefits of using an application load balancer?
2. How does an application load balancer work alongside an ECS service?
3. When creating an application load balancer, what different properties need to be defined?

### Skills checklist

These are things to tick off over the longer term. Test yourself by doing! The notes should be able to help you with different steps.

- I can create a new VPC containing public and private subnets
- I can create an RDS database instance for an application
- I can run an application inside containers on AWS Fargate
- I can send traffic via a load balancer to multiple containers
- I can build services so that they can scale horizontally
- I can implement autoscaling through a cloud infrastructure provider
- I can build services that can communicate with one another

### Further activities

We've covered a lot today so have a go at following the steps and recreating the architecture from the lecture. You can check your understanding by making changes to individual parts of the system, figuring out exactly which resources need updating and how. Here are some things you could alter:

- make an update to the application and store the latest version of the image on ECR, serving it from ECS
- create a replacement database (imaging you needed one with more space, though don't actually do this as it will cost you!)
- serve your application from a different port and ensure traffic still gets to it
