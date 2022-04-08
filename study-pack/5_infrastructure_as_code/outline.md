# Infrastructure as Code: Today's Learning

In the previous session we automated the deployment of our application, but we were still reliant on the architecture for that application already existing. In today's session, we'll look at two ways of provisioning the architecture 'as code', rather than interacting with the console. To start with, we'll look at **Cloud Formation**, which one of AWS's services, then we'll move to the more versatile **Terraform**, which handles multi-platform infrastructure. We'll be able to look once again at the services required to deploy the modern infrastructure we've been working with from this last perspective.

## Pre Session

Over the last few days we have looked at many AWS services. Have a little reflection this morning - what difficulties have you faced? What do you think would have made things easier?

Are you aware of any use of infrastructure as code in your workplace?

Have a look at these introductory videos (the inhouse Terraform one is a little longer and goes into a bit more depth than you need right now):

- [AWS Cloud Formation](https://www.youtube.com/watch?v=Omppm_YUG2g)
- [Intro to Terraform](https://www.terraform.io/intro/index.html)
- Or you might prefer [this third party one](https://youtu.be/cpxKbf51ccU?t=8)

How do you think these services might have solved some of your problems?

## Post Session

### Self-assessment questions

Use these to help you identify gaps in your knowledge - then ask!

1. What are the benefits of codifying cloud architecture vs creating it via a UI?
2. In what situations you would you use CloudFormation instead of Terraform?
3. What are some reasons you would choose to use Terraform over CloudFormation?
4. How do Terraform and CloudFormation handle creation of resources that depend on others?
5. What different "block" types are available for use in Hashicorp Configuration Language?

### Skills checklist

These are things to tick off over the longer term. Test yourself by doing! The notes should be able to help you with different steps.

- I can write a template to create virtual infrastructure resources via the CloudFormation service in AWS
- I can use template parameters to aid reuse of CloudFormation templates
- I can write code for Terraform to create resources in AWS
- I can run `terraform plan` and `terraform apply` and demonstrate the declarative nature of the tool
- I can use parameters to make Terraform code reusable
- I can quickly remove any of the infrastructure created by Terraform of CloudFormation

### Further activities

Time to tie everything together! If you want some more discrete IAC practice first, try making some small-scale AWS architecture with Cloud Formation or Terraform - or both. Here are a few ideas using some services we haven't dug into:

- A Lambda function triggered by a 'cron job' - a regularly timed trigger hosted on CloudWatch, using a [scheduled event](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).
- An [API Gateway](https://aws.amazon.com/api-gateway/) for a Lambda function (or two... - which would be a good reason to explore [Terraform modules](https://www.terraform.io/docs/configuration/modules.html)).
- An [SES](https://aws.amazon.com/ses/) (Simple Email Service) instance to trigger sending an email when a Lambda function is hit.

When you're feeling more confident you can tackle some of the larger scale projects. Please don't forget to use the Slack channel for questions, ideas and to share successes!
