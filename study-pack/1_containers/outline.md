# Containers: Today's Learning

In this session, we'll look at **containers**, a way of creating environments for our applications to run in: more on what they are, why we use them, and how we make them. We'll use the most popular technology for creating containers, Docker. We'll spend most of our time on the command line exploring the key concepts that way - running and stopping containers made from **images** both by third parties and that we've made ourselves, as well as how communicate with them from the outside. We'll also spend a bit of time on **networks** - getting containers to talk to each other - and how we can configure these as code using **docker-compose**.

## Pre Session

Some questions to kick us off in the morning:

- How are containers used in your workplace (if they are)?
- Why have they been adopted?

Take a look at [Docker's intro page on containers](https://www.docker.com/resources/what-container). From this information, can you think of any use cases for containers where you work? You might consider team development, or deployment.

We'll also mention a couple of technologies that will help us understand some of Docker's capabilities, but we won't cover much about how they work, and understanding them isn't really important. But you could take a look at these articles for a basic introduction to them to help clarify what you should actually be concentrating on in the session. They are:

- [Nginx](https://kinsta.com/knowledgebase/what-is-nginx/)
- [Redis](https://dev.to/divyanshutomar/introduction-to-redis-3m2a)

## Post Session

### Self-assessment questions

Use these to help you identify gaps in your knowledge - then ask!

1. What are the benefits of using containers to develop an application?
2. What advantages do containers have over virtual machines?
3. Describe the difference between an image and a container.
4. How do you decide the order in which to put the directives in a `Dockerfile`?
5. How do you differentiate between different versions of an image?
6. What benefits could one version of a base image have over another, for example `node:alpine`, rather than `node:latest`?
7. What benefits does Docker's system of caching layers have?
8. In a `Dockerfile`, what is the difference between the `CMD` and `RUN` directives?
9. How might you persist data from a container?
10. What ways can your host machine interact with a container?
11. What are some options available for uploading and sharing docker images?
12. How can you get two containers to interact with one another?
13. When would you use a `Dockerfile` and when would you use `docker-compose`?
14. How can you ensure one container is ready before you connect to it from another described in a `docker-compose`?
15. How can you remove all containers produced by running `docker-compose up`?
16. How can you remove any volumes produced by running `docker-compose up`?

### Skills checklist

These are things to tick off over the longer term. Test yourself by doing! The notes should be able to help you with different steps.

- I can run processes inside containers using Docker
- I can build images to be able to run containers
- I can map network ports from inside the container out to the host
- I can share volumes between the container and the host
- I can create Docker networks for containers to be able to communicate between themselves
- I can manage Docker networks, volumes and multiple containers using docker-compose

### Further activities

Try creating your own image out of an application - you can design your own, or for a bit more structure work from this [node/redis application](https://github.com/northcoders/grad-devops-containers-redis-quest) - then provision both the application and the redis service with docker-compose.

You can also have a look at this [node/postgres application](https://github.com/northcoders/grad-devops-nc-news-be) - many of you will be familiar with it! Have a go at getting it up and running, database included, with docker-compose.

If you want any more fun, here's a [video](https://www.youtube.com/watch?v=Utf-A4rODH8) on making your own containers _without_ Docker!
