# CICD Integration

An Express app serving HTML files describing exactly how cool a chosen few AWS services are!
Available endpoints:

- `/s3`
- `/ec2`
- `/lambda`

## Requirements

You will need [Node](https://nodejs.org/en/) installed

## Setup

### 1. Fork and Clone

```sh
git clone https://github.com/<your-github-profile>/grad-cloudops-cicd-integration
```

### 2. Install Dependencies

```sh
cd grad-cloudops-cicd-integration
npm install
```

### 3. Test

Unit tests with [Jest](https://jestjs.io/)

```sh
npm test
```

Acceptance tests with Jest and [Supertest](https://github.com/visionmedia/supertest#readme)

```sh
npm run acceptance-test
```

End to End tests with [Cypress](https://www.cypress.io/)

- Ensure the server is running locally using `npm start`

```sh
npm run cy:open
```

- This will open up your browser where you'll need to then initiate the tests

### 4. Run Locally

With Node:

```sh
npm start
```

With hot reload:

```sh
npm run dev
```

## Task

Your task for today will be to implement a CICD pipeline using GitHub Actions to automate the following on every _push_ and _pull request_ to the _main_ branch:

- Unit Tests
- Linting
- Acceptance Tests
- End to End Tests
- Deploy - Push the Docker Image to Docker Hub

Think carefully about what steps will need to be involved, what will be required of each step and which steps may have a reliance on the completion of others.
