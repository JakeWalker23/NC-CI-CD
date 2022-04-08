# Continuous Integration and Deployment: Today's Learning

In this session, we'll use **Github Actions** to manage the **continuous integration** of our codebase and the **continuous deployment** of the application to AWS. We'll explore the different stages that can make up a **pipeline** from **tests**, **static code analysis**, **code building** and **deployment**. We'll take the opportunity to revisit the AWS container architecture too and what we need to bear in mind when we deploy new versions of our application.

## Pre Session

Some questions to kick us off in the morning:

- Do you have pipelines set up at work?
- What provider do they use?
- What are they used for?

Two advert-y pages from Github Actions, which we'll be using to provision a pipeline for our integration and deployment: [here](https://github.com/features/actions) and [here](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd/) - note that Github Actions has been used to manage internal Github resources like projects and issues longer than it has been used for CI/CD.

What benefits can you see for development and deployment processes from using these services?

## Post Session

### Self-assessment questions

Use these to help you identify gaps in your knowledge - then ask!

1. What are the differences between continuous integration, continuous delivery and continuous deployment?
2. Why is it useful to create a CI/CD pipeline?
3. Which parts of a CI/CD pipeline would you expect to carry out first and why?
4. Give an example of some tasks that could run in your pipeline concurrently.
5. Give an example of some tasks that should not run in your pipeline concurrently.
6. Why is it a good idea to run your pipeline tests in a container?
7. How can you prevent any secrets (such as access keys) from being discoverable, even by other people at your organisation, on your CI/CD provider?
8. Why should you limit the access that your pipeline has to any external services?
9. How do you ensure a deployment happened correctly as part of a pipeline?

### Skills checklist

These are things to tick off over the longer term. Test yourself by doing! The notes should be able to help you with different steps.

- I understand the differences between continuous integration, continuous delivery and continuous deployment
- I can run tests when changes are pushed to a remote Git repository
- I can run code quality tools in parallel with tests
- I can publish a build artefact (Docker image) after successful tests and code quality on the master branch
- I can handle secrets securely on the build server
- I can run integration tests on an application running in Docker Compose
- I can automatically deploy an application and verify it is running

### Further activities

One common use case for pipelines that we haven't used is to run end-to-end tests on the front end of an application, using something like [Cypress](https://www.cypress.io/). Try adding a rendered endpoint to your Express application and test your built image with Cypress's Docker service image. The docs are [here](https://hub.docker.com/r/cypress/included) but the pages it links to will be particularly useful.

Alternatively, in the lecture we've used AWS-provided actions to handle interactions with their resources. But these are just neat abstractions of the AWS SDK - there's nothing to stop us writing our own implementations! Except common sense... but this could be a good opportunity for writing discrete scripts (with tests mocking the SDK) to test your understanding to the individual steps.