# Domain 4: Billing and Pricing

## 4.1 Compare and contrast the various pricing models for AWS

On AWS, you pay for what you use (or what you choose to commit to spending). There are no subscriptions or long-term contracts.

The price of services normally comes down to three things:

- _Compute_, or the time and power you devote to carrying out computational processes on their servers. You will generally pay for this according to how much time you use them for (i.e. cost per hour).
- _Storage_, or the space you take up in stored data, generally charged per GB.
- _Data transfer_ out of the AWS cloud, again generally charged per GB. With a few exceptions, you aren't charged for putting data _in_ to AWS.

Different services have different pricing structures - generally, the more you use them, the less you pay for unit costs.

The cost of EC2 machines fluctuates according to supply and demand. There are several mechanisms for purchasing EC2s designed to suit a range of needs:

- [_On demand_](https://aws.amazon.com/ec2/pricing/on-demand/) - you pay for usage, and stop paying when you terminate your instances. The cost depends on market fluctuations, but this is the most expensive - and most flexible - way to pay.
- [_Reserved standard instances_](https://aws.amazon.com/ec2/pricing/reserved-instances/) - you commit to paying for a type of EC2 instance for one or three years, for a significant discount. You can't change many parameters if your needs change, but you can sell unused capacity on the [RI Marketplace](https://aws.amazon.com/ec2/pricing/reserved-instances/#marketplace). Reserved instances can be used on a number of services including ECS and RDS.
- _Reserved convertible instances_ - similar to above, but for less discount, you can reserve instances but build in the opportunity to convert them at a later to date (into a less/more powerful machine, to a different Availability Zone, etc). You cannot sell these on the marketplace.
- [_Savings plan_](https://aws.amazon.com/savingsplans/) - commit to spending a certain amount over one or three years, then pay all/some/none upfront and a monthly fee accordingly, for a discount. This introduces some flexibility that was complicated to manage with reserved instances, if your business needs meant changing your EC2 reservations. This is usable only on EC2 and ECS.
- [_Spot instances_](https://aws.amazon.com/ec2/spot/?cards.sort-by=item.additionalFields.startDateTime&cards.sort-order=asc) - submit a request for EC2 capacity at a price you are willing to pay, and then these machines will automatically start when the price goes beneath that amount, and automatically stop when it exceeds it again.
- [_Dedicated hosts_](https://aws.amazon.com/ec2/dedicated-hosts/) - provides physical EC2 instances for your applications to ensure they are only used by you, which can help with regulatory compliance. These can be paid for on-demand or through reservation.

You can read more about the instance families and what they are designed to do [here](https://docs.aws.amazon.com/whitepapers/latest/cost-optimization-right-sizing/overview-amazon-ec2-amazon-rds.html).

New AWS Accounts have access to a 'free tier', which includes limited usage of a number of services per month for a year. These are hours on EC2, S3, RDS and CloudFront.

There are also free tiers for DynamoDb and Lambda that exist for all users, for all time.

## 4.2 Recognize the various account structures in relation to AWS billing and pricing

An _account_ is the main entity for billing in AWS.

Accounts can exist within [organizations](https://aws.amazon.com/organizations/). The main account in an organization can act as the billing account for all accounts in that organization. This comes with several practical benefits in consolidating costs in one place, but also allows you to combine your free / cheaper allowances so you can take advantage of one account's allowances in another account.

Companies have different ways of organizing their accounts according to their needs. Some choose to create accounts per department; some create accounts for each project. Accounts can be created hierarchically using _organizational units_, so you could have a production and a dev account that existed under a project account, which itself was one of many accounts under a company account.

You can read more about best practices [here](https://aws.amazon.com/blogs/mt/best-practices-for-organizational-units-with-aws-organizations/).

Account have [support tiers](https://aws.amazon.com/premiumsupport/plans/):
- _Basic_ - for dipping into - free, support only on billing and account enquiries
- _Developer_ - for trying things out, testing etc. Low cost, some support, some diagnostic tools
- _Business_ - for production workloads. Still fairly low cost, 1hr response times, additional guidance.
- _Enterprise_ - for mission critical, heavy workloads. Very expensive, 15 min response times, dedicated Technical Account Manager.

## 4.3 Identify resources available for billing support

Some services exist on AWS to support with billing and pricing:

- [_AWS Pricing Calculator_](https://calculator.aws/#/) can be used to create a cost estimate for you business needs, suitable for presentations etc.
- [Cost Explorer](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-what-is.html) analyses your usage and provides breakdowns according to various metrics, and forecasts based on usage.
- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/) allows you to set budgets for various parts of infrastructure and trigger alarms / notifications if these are breached.
- [Cost Allocation Tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html) allow you to use the tags on resources to gather information about particular resources that share a tag.