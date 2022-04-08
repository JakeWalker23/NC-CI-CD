# Domain 2: Security & Compliance

## 2.1 Define the AWS shared responsibility model

The **Shared Responsibility Model** is an AWS whitepaper which outlines who is responsible for the security of various elements of infrastructure. Similar models are adopted by other cloud providers. It is summarised thoroughly [here](https://aws.amazon.com/compliance/shared-responsibility-model/), but to draw out the key points here:

- **AWS** is responsible for hardware, software, networking and facilities that run 'the cloud'
- **Customers** are responsible data, access management, and the configuration of software, networking and encryption

Practically, this means different things for different services. For example, an EC2 instance comes with a much lower level of AWS-managed software than an S3 bucket. With EC2, AWS will be responsible for maintaining and patching the operating systems that they make available to customers, but all the software that is installed and the networking that is set up is the responsibility of the customer; with S3, there is a lot more AWS-managed software involved and it just becomes the customer's responsibility to configure access, networking and encryption options.

## 2.2 Define AWS Cloud security and compliance concepts

In order for AWS to be a practical proposition for many industries, the ability to ensure that their operations comply with the requirements of regulatory bodies is key. Some industries, like health and banking have high regulatory loads, but even less regulated areas will have to comply with local regulatory measures that govern things like the security of customer data.

**Compliance** is an example of shared responsibility - the [risk and compliance whitepaper](https://docs.aws.amazon.com/whitepapers/latest/aws-risk-and-compliance/welcome.html?refid=ps_a134p000006gxrtaam&trkcampaign=glbl-fy21-traincert-certification_paidsearch) outlines how AWS comply with regulatory frameworks, and outlines the tools available for companies to gain assurance - necessary, as the 'legal buck' will always stop with the customer. The compliance programmes for which AWS outlines their standards can be found [here](https://aws.amazon.com/compliance/programs/).

**Encryption** is a key security concept - there is an excellent blog about how AWS facilitates encryption [here](https://aws.amazon.com/blogs/security/importance-of-encryption-and-how-aws-can-help/). The key things you should understand are:

- Encryption happens _in transit_ on AWS. They use the TLS protocol and implement [their own, open source, auditable version](https://github.com/aws/s2n-tls) of OpenSSL.
- Encryptions happens _at rest_ on AWS - though you _sometimes need to enable this_ - for example, you don't on S3, but would on Parameter Store. It uses a modern and very safe algorithm called AES-256.
- Encryption keys can be managed using a service called [**AWS KMS**](https://aws.amazon.com/kms/), and the usage of these keys, amongst other things, can be audited using [**AWS CloudTrail**](https://aws.amazon.com/cloudtrail/). Logs for these services can be manages with [**AWS CloudWatch**].

The **Principle of Least Privilege** requires a subject only receives permissions for a task they need to complete. This should be based on the _function_ that they need to complete, rather than their _identity_ - as such, permissions should be revoked at the point where that function is complete.

## 2.3 Identify AWS access management capabilities

In practice, the Principle of Least Privilege means a big degree of granularity of controls, which is something that AWS offers through [IAM](https://aws.amazon.com/iam/) _policies_. Through a mix of the concepts of _users_, _groups_ and _roles_, you can abide strictly with this principle. This, and more good practices, are outlined in [this user guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

Other practices around the security of identity management include:

- using policies to define how users create passwords and access keys (i.e. rotating them regularly, having them be a degree complexity)
- ensuring that user logins require [Multi-factor Authentication](https://aws.amazon.com/iam/features/mfa/)
- use the root account only where necessary (for some IAM and billing requirements) and limit access otherwise

More details and ideas can be found [in this document](https://aws.amazon.com/premiumsupport/knowledge-center/security-best-practices/).

## 2.4 Identify resources for security support

The [AWS security homepage](https://aws.amazon.com/security/) is a great location to see the range of resources available to support users in developing secure applications - it hosts articles, blog posts and specific guides.

[This page specifically](https://aws.amazon.com/products/security/?nc=sn&loc=2&refid=ps_a134p000006gxrtaam&trkcampaign=glbl-fy21-traincert-certification_paidsearch) outlines all the different services involved in security and their main responsibilities. Aside from native solutions, more complex custom solutions are available in the Amazon Marketplace.

Security checks are included in [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/), an automated service that also evaluates best practices around cost & efficiency, resilience and performance.
