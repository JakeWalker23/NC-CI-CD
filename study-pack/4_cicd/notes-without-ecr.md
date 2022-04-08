# Continuous Integration, Delivery and Deployment - CI/CD

## Prior knowledge

- Package a web application in a Docker image
- Awareness of AWS Elastic Container Registry

## Prerequisites

- An account on GitHub
- An account on AWS with a container (nc-news-test) in the container registry

## Learning objectives

- Understand the differences between continuous integration, continuous delivery and continuous deployment
- Run tests when changes are pushed to a remote Git repository
- Run code quality tools in parallel with tests
- Publish a build artefact (Docker image) after successful tests and code quality on the master branch
- Handle secrets securely on the build server
- Run integration tests on an application running in Docker Compose
- Deploy an application and verify it is running

## Continuous Integration, Delivery and Deployment

Continuous integration is the process of merging software changes into the main repository and verifying the correctness of the software through automated tests. Changes should be integrated as often as possible, ideally multiple times a day. The more quickly changes can be integrated, the lower the risk of introducing big problems due to large changes to the main codebase. Tests are usually run on a dedicated server so that the integration environment is common for every engineer working on the application.

Continuous delivery is a practice where the software application can be deployed easily at any time with no manual intervention from engineers. As soon as the tests have passed after integrating a change then it should be possible to deploy that change. The idea is that the faster the change can be in front of the end users of the software then the faster feedback can be gathered and acted upon - one of the central ideas of Agile.

Continuous delivery is often seen as a natural progression from continuous integration and continuous deployment is the next natural progression from continuous delivery. The idea behind continuous deployment is that every change in version control is automatically deployed all the way through to production without any intervention from the engineers.

Both continuous delivery and deployment are frequently referred to as pipelines with different stages. They rely heavily on automated testing - unit, integration, acceptance - at each stage to decide whether the change to the software can continue to the next stage in the pipeline. Running the unit tests would most likely be at the start of the pipeline, then the next stage might be packaging the software as an artefact that can be deployed to each environment - a Docker image, for example. There could be a number of different environments that the application is deployed to before it gets to production and in front of real users but the same artefact should be used each time. Tests are likely to be run after each deployment to check that it is working correctly - the idea of every set of checks in the pipeline is to gain confidence in the correctness of the code.

### The CI/CD environment

You need to be able to run your checks whenever a change is pushed to your repository. There are many products for this and they exist in a fairly complicated and interactive ecosystem. These include the extremely feature-rich and mature [Jenkins](https://www.jenkins.io/), and the newer kid on the block, [CircleCI](https://circleci.com/); there is also AWS's [Code Pipeline](https://aws.amazon.com/codepipeline/) and all of these can be integrated with Github. Gitlab provides its own CI/CD tools internally, alongside its repository management. To keep things familiar, we are using [Github Actions](https://github.com/features/actions) - tools that were previously used to manage workflows around Github, like issues and project boards, but which have fairly recently been repurposed by Github to facilitate CI/CD.

All of these different services have slightly different features, syntaxes and implementations. But there are many considerations that will exist no matter which you choose, and we may not always do things the optimal 'Github Action way' so you are exposed to some of these considerations that aren't so neatly abstracted in other pipelines.

## Github Actions

To get Github to trigger actions on your repository, you need a directory named `.github` at the top level of your repository, and inside that, a `workflows` directory. _Workflow_ is the name given to what might be called a _pipeline_ with other providers. There may be multiple pipelines for a project. Your repo may be responsible for multiple applications deployed separately, for example, or you could separate the CI and CD parts of your pipeline. Each workflow needs a [YAML](https://yaml.org/) file to configure it - our steps will be relatively simple so we can combine them in one. Let's name it `cicd.yaml`, and write in it the following `name` property.


```yaml
name: CICD
```

You can outline the circumstances in which the pipeline is triggered based on various event in the Github architecture. Most commonly for CICD pipelines, you would use `push` and `pull_request` events.

There are some checks that you may wish to run every time your code is pushed to the main repository, whether that is the `master` branch, or some feature branch. This is part of the _continuous integration_ of your code into the repository. These may include unit tests, or using tools for _static code analysis_ - code that looks at your code without running it - things like linting, assessing vulnerabilities, and other code quality checks.

Other processes we may only run once we're happy that our code has passed these check, plus any other manual code reviews that we'd undertake anyway - this might involve a _staging area_ so checks for things like UX and accessibility can be signed off, or it might mean straight into production, as we will do - that's `continuous deployment`!

As we'll be handling all CI/CD in this workflow, we'll specify the actions and branches that we care about like so:

```yaml
on: 
  pull_request:
    branches:
      - master
  push:
    branches:
      - master
```

You can see other events that can trigger actions in the [documentation](https://help.github.com/en/actions/reference/events-that-trigger-workflows).

### Jobs

Github Actions allows you to define separate tasks, or _jobs_ that you might want to undertake in your pipeline. With this structure you can segregate the processes from each other, and provide different contexts or environments for them to be undertaken in.

The first job we will specify is _linting_, as we want to ensure a consistent code style and quality in the master branch. Under a `jobs` key, we will define a mapping with `<job_id>` keys to reference each job. First:

```yaml
jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
```

On this `lint` job property we have defined a human-readable name, used by the Github UI to inform us about the pipeline's progress. We've also provided the OS for the job to be run on. We should generally by emulating the environment of our deployment, though it doesn't matter so much for linting. But on Github Actions, Linux machines are the cheapest, so `ubuntu-latest` will do fine.

We've also given a condition as to whether the check will run. We don't need to run this again when the code is pushed to `master`, just when we make the request to get an automated check. We'll be adding the same condition to all the CI steps.

Jobs can be further broken down into _steps_ that need to be undertaken sequentially. The first step for our code is fairly specific to Github Actions - we need to _checkout_ the code that we are working with. This may seem redundant, but remember Actions are also for managing projects, issues and other parts of the Github system that don't require code to work on.

Luckily, the code for doing this has already been abstracted into a pre-existing Action, and this is one great feature of Github Actions - common tasks are likely to have been written, tested and evaluated by the community already, meaning that you can piece together your own workflow from other people's efforts. We'll avoid that in some places today but we will use this Action across our pipeline so the abstraction is very useful.

```yml
lint:
  name: Lint
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
```

The syntax for the Action referred to under `uses` is `<owner>/<repo>@<branch>` - anything with an `owner` of `actions` is an official Github action.

The next step is to set up a node environment. Again, there is another common Github-made Action we can use here. We can provide information to the action using the `with` key - here we'll use the latest node version (at the time of writing!) Always check the documentation for pre-built actions, so you know what information needs to be provided, and how.

```yaml
steps:
  - name: Checkout Repo
    uses: actions/checkout@v2
  - name: Use Node.js
    uses: actions/setup-node@v1
    with:
      node-version: 14
```

(It's worth noting that there is a very powerful syntax for defining different runtimes for your code, something that could be particularly useful if you wanted to check a native application on various device OSs, for example. To do this requires defining a _matrix_ of different OSs and runtimes, and Github Actions will test on all of these concurrently. You can read more about this [in the docs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategy).)

There are two more steps for the pipeline: install dependencies and run the lint script. Make sure you have **eslint** installed, and a script in your `package.json`. You may as well run it too!

```json
// package.json
  "scripts" : {
    "lint": "eslint .",
  },
  //...
  "devDependencies": {
    "eslint": "^7.0.0"
  }
```

In the yaml, we now have a complete job:

```yml
lint:
  name: Lint
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 14
    - name: Install deps
      run: npm install
    - name: Run linting
      run: npm run lint
```

### Testing

As we've already discussed, one of the great advantages of Docker is having a consistent environment for our development. We can use docker-compose in our pipeline to ensure that all of our integration tests are run with the same versions of Node and Postgres - the versions we intend to use in production - and not worry about what people have installed in their computers.

Note that Github Actions has some prebuilt facilities for testing with docker-compose, but we will write it in a way that's more representative of a typical pipeline.

However, for testing, we don't need any volume to persist the data, which could be useful in development. It's a small change here - but it is reflective of much bigger changes in what may be required from docker in different environments in other projects. So to achieve this, we require two docker-compose configurations. It seems that there is as yet no definitive best approach for co-ordinating this, so you may see many other solutions in the wild.

In `docker-compose.test.yml`, we'll define just the application and the Postgres service needed to test it:

```yml
version: '3.7'
services:
  test:
    build: .
    command: ["npm", "test"]
    environment:
      DATABASE_URL: postgres://db_user:pass@db:5432/nc_news
    ports:
      - 9090:9090
    depends_on:
      - db
  db:
    image: postgres:12-alpine
    environment:
      POSTGRES_DB: nc_news
      POSTGRES_USER: db_user
      POSTGRES_PASSWORD: pass
```

We will need to write a script to run this, and we will need to provide a tag to point it at a non-default file. It's not a long script, but it wouldn't hurt to abstract it into its own shell script:

```bash
docker-compose -f docker-compose.test.yml up --build --exit-code-from test
```

Note the `--exit-code-from test` tag - docker-compose will keep running by default, and so our step will never finish, but providing this tag will take exit code from the `test` service we defined in the yml, and Github Actions can use this to define whether the Action passes or fails.

Here's the code for the action:

```yml
test:
  name: Test
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
    - name: Run Tests in Container
      run: ./docker.test.sh
```

### Action sequencing

In a pipeline, each step should be giving us confidence that the code is of sufficient quality to apply the next check. There's no hard and fast order that things should happen, but it makes sense that inexpensive (both in time and money, as the free Github Action minutes will not last forever) tasks should complete before moving onto tasks that take longer. As you have now experienced, assembling the `docker-compose` network is much more time-consuming than running the lint checks, so having these running concurrently, as will happen by default, is quite wasteful if the lint error were to fail.

To make the `test` job only happen on successful feedback from `lint`, add a `needs` property:

```yml
test:
  name: Test
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  needs: lint
  steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
    - name: Run Tests in Container
      run: ./docker.test.sh
```

But some tasks definitely _can_ happen concurrently; static code analysis is a good example here. We've linted our JS files, but we could apply code quality check to our `.sh` files too, using a community Github action built on top of [`ShellCheck`](https://www.shellcheck.net/).

```yml
shellcheck:
  name: Shellcheck
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
    - name: Run the sh-checker
      uses: luizm/action-sh-checker@v0.1.4
```

Then extend the `needs` property on the `test` job to include `shellcheck`:

```yml
test:
  name: Test
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  needs: [lint, shellcheck]
  steps:
    # etc
```

## Deployment

Once our continuous integration checks and our manual code review is complete, and we're safe to merge our code into the `master` branch, we can trigger a deployment action. These could be as varied as there are applications under the sun, but we will go through several steps that outline some of the key considerations you might face whatever your application.

To handle the deployment for our API, we will have to manage the following steps:

- log in to Dockerhub, where out image lives
- build, tag and push the image to the registry.
- get ECS to use the new image 

We will also want to check that everything went well, so our software engineers are told of any unexpected problems (and perhaps urgently roll back to a previous version of the application!)

### Setting up deployment

We could handle the steps above by creating a script that interacted with AWS via the SDK, but that would be extremely time-consuming. AWS have created a range of Github Actions to handle some of these steps for us, and we will use these where we can. As always, you can turn to the documentation to read more about how you can configure these; these notes will explore the steps in a more decontextualised way.

As we will be asking AWS to perform some additional tasks, it's good practice to create an AWS _user_ with the specific permissions for this. In the _Users_ section of the IAM service on the Console, press "Add User". We can name our user something sensible - `github_actions`. And we only need to enable "Programmatic access" as this user won't be an actual human, just something that can log into the service using and access key and secret.

We'll make a new policy for this user, so select "Attach existing policies directly" and click the "Create policy" button. This will open a new window, where you can add the following under the JSON tab, with your individual configurations as appropriate.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        // allow a new task definition to be created
        {
            "Sid": "RegisterTaskDefinition",
            "Effect": "Allow",
            "Action": [
                "ecs:RegisterTaskDefinition"
            ],
            "Resource": "*"
        },
        // allow IAM to add the task execution role we've already made to the new task definition. This role is responsible for allowing ECS to communicate with ECR to pull the image, as well as passing logs to CloudWatch
        {
            "Sid": "PassRolesInTaskDefinition",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::<your account id>:role/ecsTaskExecutionRole"
            ]
        },
        // allow reading and changing the service we've already created 
        {
            "Sid": "DeployService",
            "Effect": "Allow",
            "Action": [
                "ecs:UpdateService",
                "ecs:DescribeServices"
            ],
            "Resource": [
                "<your service ARN>"
            ]
        }
    ]
}
```

Then keep going through the rest of the User setup steps, until it is created.

### Secrets and environment variables

Our user will come with security credentials that we can see under the tab with the same name when we've selected our new user in the AWS console. We'll want to create an access key for this user, and receive the secret at the same time. Keep a note of this somewhere safe, because you won't be able to view it again once you've created it! This is what we'll use in the Action to connect with the AWS services.

**But beware!!!** We absolutely do not want these keys to be committed to our code or otherwise viewable, such as through the logs we've seen so far that Github provides when running its Actions. The solution is to declare them in _Secrets_, which you can get to from the sidebar under the settings tab for your repo. Create secrets for both your `AWS_ACCESS_KEY_ID` and your `AWS_SECRET_ACCESS_KEY`, and your `DOCKERHUB_PASSWORD`. It's also sensible to create one for your `AWS_REGION` where your services live - not so much because it's sensitive information, but because it can be useful being able to configure this from outside your codebase.

We're now in a good place to write up the first step for our Action to deploy - connecting to Dockerhub: This involves logging in via docker to the registry. As noted, we're using an existing action to manage this, and passing the secret environment variables it needs using the syntax below under the `env` key:

```yml
deploy:
  name: Push image to Dockerhub & update service
  if: github.event_name == 'push'
  runs-on: ubuntu-latest
  steps:
    - name: Log in to Docker
      run: docker login -u northcodersdev -p ${{ secrets.DOCKERHUB_PASSWORD }}
    - name: Checkout Repo
      uses: actions/checkout@v2
```

Note the change in `event_name` to push - it will only happen on `master` because of the configuration at the top of the file.

An aside on environment variables - you should be aware that environment variables are available to all the running in your application, including third-party dependencies and any subprocesses which are started. This might be problematic anywhere they are provided, whether that's pipelines, or in production. For particularly sensitive variables, you might to use another solution like AWS Secrets Manager, which handles them via encryption and only gives permission for them to be detected by prescribed services.

### Building, tagging and pushing

Packaging your application for deployment is a feature of continuous delivery. The application should be packaged once and that same package deployed into the different environments you choose. Those deployments before it gets to the end users should, like the tests you run as part of the continuous integration process, be used to give you confidence that the software is working correctly. The number of any environments before production will depend on the application, the team developing it and the organisation the team is a part of - the number should be small enough to avoid any unnecessary delay in getting features to where they're useful but not so small that problems are introduced where testing could have caught them - two environments is typical.

In this next step, we will prepare our image from our checked-out code using the command line instructions we're already aware of. For front-end applications, this might be a good spot to use something like [Cypress](https://www.cypress.io/) to run acceptance tests on our application as it should run in a copy of the production environment; for back-end you might hit it with http requests. We won't run anything equivalent in this pipeline.

Notice that we are just using `:latest` as a tag - it may be sensible to version this somehow, or perhaps use the Github hash as a unique identifier.

```yml
  - name: Build, tag and push image to Dockerhub
    env:
      DOCKER_IMAGE_TAG: northcodersdev/nc-news-api:latest
    run: |
      docker image build --tag $DOCKER_IMAGE_TAG .
      docker push $DOCKER_IMAGE_TAG
```

Note that we didn't need to provide the `DOCKER_IMAGE_TAG` environment variable, as we could have written it directly into the `run` script. But by defining them under `env:`, we can more avoid a risk of a typo in the two times we use them within the script.

### Updating the service

The rest of the code is fairly specific to AWS and its deployment mechanism, as well as our use of containers to host our deployed application. Let's look at the next two steps and figure out what is going on.

```yml
- name: Force service update
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: ${{ secrets.AWS_REGION }}
  run: aws ecs update-service --service nc-news-api --force-new-deployment
```

The updating of the task definition is the purpose of the first of these steps. We can see how we are configuring AWS's action for this with a couple of things - first, the task definition which we saying is saved in the root directory of the checked-out code in a file called `task-definition.json`. Not only is this specification is pretty dense and unwieldy, but we need to ensure that our new one is almost identical to the one already used by our service, so the documentation for the Action gives you some steps to retrieve it from AWS directly. The only thing that needs updating is the `image` in the `container_definitions`, and that is handled by the Action by providing it with the output we specified in the previous step.

This outputs the updated task definition that is used by the next action to update the service, and we just need to provide the names for the cluster and the service to finalise deploying.

### Smoke testing & tidying up

The app is now live to the world! In our case, we can check via the DNS of our load balancer, which won't have changed. But not immediately - given our ECS deployment strategy, we will have to wait for the tasks to finish provisioning and have the desired 'RUNNING' status. And ideally, this would be part of our pipeline too - if there was some sort of failure we may wish to trigger rolling back to a previous version without requiring manual intervention. This basic check after deployment is called a _smoke test_ and could be as simple as ensuring you get a 200 response from an HTTP request to its address.

There's one final step sensible here - as we logged into Docker when we connected to ECR earlier, it would be prudent to log out again. And we'd want to do that whether intermediary steps had succeeded or not, but the point of the pipeline is that steps will only happen if previous ones succeed. So we provide the `if` property here to ensure this `always` happens:

```yml
- name: Logout of Amazon ECR
  if: always()
  run: docker logout ${{ steps.login-ecr.outputs.registry }}
```