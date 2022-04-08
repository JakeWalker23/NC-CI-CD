# Domain 1: Cloud Concepts

## 1.1 Define the AWS Cloud and its value proposition

AWS list a range of benefits that they believe form their value proposition. These benefits are designed to make companies feel comfortable with choosing AWS as their infrastructure provider whatever the stage of their company (start-up / growth / established) because they can satisfy both their needs at the time and future growth needs they may expect to have.

- _Scalability_ and _global reach_ ensure the company can grow and maintain levels of service for customers.
- _Reliability_ and _high availability_ ensure the company is able to focus on revenue generating activity, not on ensuring that existing features can be reached.
- Similarly, _security_ means that increased scrutiny on the company for compliance reasons is not a blocker on useful activity.
- _Elasticity_, _economy of scale_ and _pay as you go pricing_ ensure that the company is not paying too much in anticipation of growth, but pays for what they need.
- _Agility_ ensures that the company can feel confident in making changes of direction without technology being a blocker, and doesn't need to prepare too far into the future.

The general picture is that a company should be able to think about what its customer wants as much as possible, and think as little as possible about the commonalities that all companies must consider: the infrastructure that provides secure access to their customers for their services - as cheaply as possible.

[These aspects are front and centre of how AWS defines and sells cloud computing](https://aws.amazon.com/what-is-cloud-computing/)

More in the Well Architected Framework: https://wa.aws.amazon.com/wellarchitected/2020-07-02T19-33-23/index.en.html

## 1.2 Identify aspects of AWS Cloud economics
**Total Cost of Ownership (TCO)** is a phrase that defines the assembled costs of running a company's tech infrastructure. This is a useful phrase for AWS to promote, because it encourages companies to think about the **capital expenses (CapEx)** that can be vastly reduced by provisioning on the cloud, as well as the **operational expenses (OpEx)** that using cloud service providers incurred.

In brief, a company does not have to pay for its own servers (CapEx) when it provisions on the cloud, but instead distributes that cost over with 'pay-as-you-go' pricing for services used (OpEx). This is appealing for a start-up, that can start reaching customers globally with very little upfront costs.

AWS would also like companies that do operate on-premises servers to think about the OpEx incurred by running and maintaining these; the AWS value proposition also removes these costs, even if it does replace them with other operational expenditure.

Software licensing is highlighted as one area which can be complicated when moving to the cloud - it may be that traditional commercial licenses that applied for one on-premises data server may not map neatly to the cloud, and a company does have to consider the potential costs of a licenses should that number of computers that operate this software scale up or down.

AWS provides tools for evaluating TCO, and also migrating services, as outlined in [this whitepaper](https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/aws-pricingtco-tools.html).

Operations on the cloud that may reduce costs:

- _right-sized infrastructure_ - not overpaying for infrastructure in anticipation of growth that may never come, or may drop back down.
- _benefits of automation_ - reducing labour costs for activities which can be automated
- _reduce compliance scope_ - allow common compliance requirements - for example the encryption of customer data - to be handled by AWS, and even for AWS to provide the certification of compliance for you
- _managed services_ - again, common tasks like scaling up provision, replicating and backing up data etc, can be encapsulated into a 'managed service' which allows focus to be on new features.

## 1.3 Explain the different cloud architecture design principles
AWS, like all major cloud providers, creates services that aim to adhere to common cloud architecture design principles. A brief explanation for some of these:

- _design for failure_ - making an assumption that at some point there will be a fault in the software or hardware that underpins a product. If software is designed to recover quickly from such failures, this puts less onus on the more expensive option of increasing availability and capacity to cover these eventualities.

- _decoupled components versus monolithic architecture_ - by separating out levels of abstraction or through the modularisation of a service, you gain several advantages:

  - reusing modules of architecture without having to redesign them each time
  - easier identification of a point of failure
  - ease of updating or swapping out elements of infrastructure as needs change or other options become available

- _implement elasticity in the cloud versus on-premises_ - essentially, it's easier to click a button to provision a server than install on site! (and even easier to set up some sort of alarm to provision one automatically for you...)

- _think parallel_ - the idea of parallelisation is that you replace a task that is repeated, consecutively, x times, and instead have x tasks running simultaneously (i.e. in parallel) and have the job done in the time it takes to do one of those tasks. Storing, processing and retrieving data are all jobs that can benefit from parallelisation, for example, and cloud providers set themselves up to enable this.

There is some overlap here with the **AWS Well-Architected Framework**, which we will explore in more detail in another session; you can see the design principles for 'operational excellence' [listed here](https://docs.aws.amazon.com/wellarchitected/latest/framework/oe-design-principles.html).
