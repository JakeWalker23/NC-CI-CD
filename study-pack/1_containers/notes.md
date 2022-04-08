# Containers

## Prior knowledge

- Understand how web applications are built and run

## Learning objectives

- run processes inside containers using Docker
- build images to be able to run containers
- map network ports from inside the container out to the host
- share volumes between the container and the host
- create Docker networks for containers to be able to communicate between themselves
- manage Docker networks, volumes and multiple containers using docker-compose

## What Docker is

Docker is a tool for Linux which allows users to run software processes in a way which heavily isolates them from the rest of the system. Docker uses features of the Linux kernel such as namespaces (which provide separate spaces for networking, process IDs etc.), cgroups (which allow the resources like CPU and memory available to a process to be limited) and a union filesystem (changes are stored as layers, each layer being the difference since the last change). Docker is not the only technology for working with containers (rkt and podman are other examples) but it is the most popular and so that's what this lesson will focus on.

Docker runs containers from images that it defines - an image serves as a template for a container. You can think of an image as being like a _class_ in an object-oriented programming language and a container is like an _object_, an instance of a _class_. Software packaged inside an image is easy to distribute and run on another system, reducing the 'it works on my machine' problem.

## Reasons to use Docker

Running processes in isolation in production gives a greater degree of security - a compromised web application can't see anything else on the system that it is running on so exploits are limited. CPU and memory can be constrained so that one process can't starve another of resources, either accidentally or through a denial of service (DoS) attack.

With physical infrastructure - i.e. real servers that are like a much bigger version of your laptop - your options for isolation are to run applications on another machine. If you use virtualised infrastructure, such as that provided by Amazon Web Services, Google Cloud, Microsoft Azure and others, then you can create separate virtual servers for each application. Containers provide a further level of isolation and they mean that you can run many different applications on one physical or virtual server.

Docker is a Linux technology yet the Docker site allows you to download Docker for Mac and Docker for Windows. These applications use a virtualisation layer which runs a Linux virtual machine and sends the commands you run into that and gives you back the output.

## Running a container

### Hello world

This uses the `container` subcommand of the `docker` tool to run a container from the `hello-world` image which is available in the public Docker registry.

Assuming you have a fresh install of Docker, the first thing you'll see is a message telling you that Docker can't find the image `hello-world` and that it's 'pulling' it - it's pulling from the [`hello-world` repo on Docker Hub](https://hub.docker.com/_/hello-world). Once the image has been pulled down it's used to run a container which outputs a message to the screen and then exits.

Run the `hello-world` container with the following command:

```shell
docker container run hello-world
```

It is possible to pull the image down onto your system but not run a container. The command for that is:

```shell
docker image pull hello-world
```

### Docker Hub

Docker Hub is a registry where Docker images can be published. It's like npm is for Javascript packages. When you use the `docker` tool it knows about the address of Docker Hub so when you request to run a container or pull an image then it'll try there first. There are a number of official image distributions, such as [Node](https://hub.docker.com/_/node), and anyone can publish public images to Docker Hub, like this [local DynamoDB image from Amazon](https://hub.docker.com/r/amazon/dynamodb-local).

### Inside an Ubuntu container

Ubuntu is a version, or distribution, of the Linux operating system. With Docker it is possible to run a container which is based on a particular version of Linux - all the files inside the container will look very much like you were running the operating system itself. In this case you will run a container based on Ubuntu but instead of letting the process exit you will open an interactive session and be able to then run commands inside the container process.

The command to start the container will be the same as before, but you will use an image with the name `ubuntu` instead of `hello-world`. You will also need to pass two flags to the command: `--interactive` and `--tty` - these can be shortened to `-i` and `-t` and you will commonly see them used together like: `-it`. The `-i` flag keeps the stdin channel open so that the container can receive input from you when you type and the `-t` flag creates a pseudo [`tty`](https://www.linusakesson.net/programming/tty/) device so that you can interact with the container like the shell in your local terminal.

Once inside the container you can run commands as you would in another terminal but you'll be inside an instance of Ubuntu, so you can use `apt-get` to install packages.

For example, this command will start a container, based on the [`ubuntu` image from Docker Hub](https://hub.docker.com/_/ubuntu), and leave you inside a bash shell session:

```shell
docker container run -it ubuntu
```

Inside the container you can run commands e.g. to see which directory you are in - `pwd` - or to list the files in the directory - `ls`:

```shell
root@dbda094129e4:/# pwd
/
root@dbda094129e4:/# ls -lAh
total 64K
-rwxr-xr-x   1 root root    0 Aug 10 20:10 .dockerenv
drwxr-xr-x   2 root root 4.0K Jul 18 21:21 bin
drwxr-xr-x   2 root root 4.0K Apr 24  2018 boot
drwxr-xr-x   5 root root  360 Aug 10 20:10 dev
drwxr-xr-x   1 root root 4.0K Aug 10 20:10 etc
drwxr-xr-x   2 root root 4.0K Apr 24  2018 home
drwxr-xr-x   8 root root 4.0K May 23  2017 lib
drwxr-xr-x   2 root root 4.0K Jul 18 21:19 lib64
drwxr-xr-x   2 root root 4.0K Jul 18 21:18 media
drwxr-xr-x   2 root root 4.0K Jul 18 21:18 mnt
drwxr-xr-x   2 root root 4.0K Jul 18 21:18 opt
dr-xr-xr-x 119 root root    0 Aug 10 20:10 proc
drwx------   2 root root 4.0K Jul 18 21:21 root
drwxr-xr-x   1 root root 4.0K Jul 23 15:21 run
drwxr-xr-x   1 root root 4.0K Jul 23 15:21 sbin
drwxr-xr-x   2 root root 4.0K Jul 18 21:18 srv
dr-xr-xr-x  13 root root    0 Jul 24 18:01 sys
drwxrwxrwt   2 root root 4.0K Jul 18 21:21 tmp
drwxr-xr-x   1 root root 4.0K Jul 18 21:18 usr
drwxr-xr-x   1 root root 4.0K Jul 18 21:21 var
```

Ubuntu maintains an index of packages which needs to be updated by running `apt-get update`. Once that has run, packages can be installed with `apt-get install` - the `-y` flag automatically answers the "do you want to install this?" question:

```shell
apt-get update
apt-get install -y curl
curl example.com
```

To get out of this container you can either:

- type `exit` and press 'Enter' or
- press `Ctrl-d` (signifies the end of input)

You can list docker containers with `docker container ls` (or `ps`). There will be a container running from the `nginx` image, assigned a random name - you can give your containers a name with the `--name <name>` flag but if you don't then they get a random, and sometimes amusing, name.

To access content on your local machine, when served from the container, you need to map the network ports between the two, using `publish` as demonstrated here:

```shell
docker container run --publish 8080:80 nginx
```

The format of the argument to the `--publish` flag (can be shortened to `-p`) is `<host-port>:<container-port>`. In this example `8080` was our choice - you could choose any available port - and `80` is the port the the `nginx` process is listening on inside the container. Containers have their own isolated network space, so port `80` inside one container is not the same as port `80` on the host system or as port `80` inside another container.

## Removing containers

Stopping a container doesn't actually remove it. Containers can be removed by using the `docker container rm` command and passing either their name or their ID. If you name your containers yourself then you might want to remove old ones because the name could clash - the `--name` flag must be unique amongst all existing containers.

When you run a container you can ask Docker to remove it when it finishes by passing the `--rm` flag. If you run the following command twice then it will succeed both times, as each time it is removed when the container closes.

```shell
docker container run --rm --name hello-success hello-world
```

## Building an image

All the containers mentioned so far are based on images from public repositories on Docker Hub. To build your own container, you require a `Dockerfile`.

### Dockerfile

All containers need to start from somewhere, and this is denoted by the `FROM` command at the top of a Dockerfile. You can start from a blank 'base' image, but this is unlikely to be useful. In this example, we're starting with the `nginx` image:

```Dockerfile
FROM nginx
```

This is enough to build and image with the following command:

```shell
docker image build .
```

To build content into the image when it is built, we can copy code over to the image. The documentation will often make it clear where code you have written should be placed inside the iamge. In this case, nginx is configured to serve files from the `/usr/share/nginx/html/` directory so that is where any content you want served should be copied to inside the image. 

```Dockerfile
COPY hello.html /usr/share/nginx/html/
```

When building an image, it is a good idea to tag it at the same time so that it's easy to work with:

```shell
docker image build --tag my-nginx .
```

This command tells Docker to build an image and give it the tag `my-nginx`. It will look for a file called `Dockerfile` in the current directory - `.`. The `--tag` flag can be shortened to `-t`. `hello-world` and `nginx` are image tags we have referred to so far. Images have IDs too but it's easier to use my useful names so give them tags when you build them.

### Listing images

To see all images on your computer, run

```shell
docker image ls
```

This shows images have: a repository name e.g. `nginx`, a tag e.g. the default `latest` and an ID. To run a container from an image which has the tag `something:latest` then you can omit the `:latest` part and just use the repository.

When it builds images Docker uses the union filesystem and, starting from the base image, it makes the changes you've requested. Each change is stored as a new layer so that the previous one is left unchanged. There is a unique ID assigned to each layer, which has effectively formed a new image. The final layer gets the tag that you have assigned in the `--tag` flag.

A common pattern when creating images is to tag them with the newest version e.g. `node:12.8.0` _and_ give that the `latest` tag too - `node:latest`. When new version is available then that is tagged as you would expect - `node:12.8.1` - plus the `latest` tag, which overwrites the previous one.

### Image layers

Another commonly used command in Dockerfiles is `RUN`, which is used for running arbitrary shell commands. Each of these commands will result in a new layer being created in the union filesystem and, as long as that command doesn't change, the next time you run `docker image build ...` the layer - the result of running that command last time - will be used from Docker's local cache. When running build processes multiple times, you will often see, next to the layer hash, the print `---> Using cache`, which will be the case for any layers that have not changed from a previous build still on the computer.

If you change anything about a command - even a whitespace change - then Docker will rebuild that layer of the image as it assumes that it has to. Changing the order of lines in the file will result in the same thing, as each command is predicated on the commands above it.

## Publishing an image

To reuse Docker images you have created you can publish them to Docker Hub. Your free account only lets you publish one private repo of images so if you choose to make the image publicly available be very sure that what you have put in it is not sensitive. 

To publish an image, create a repository on Docker Hub. Any images you wish to publish should be tagged in the format `<your username>/<image name>`:

You can push an image to the repository (you will need to `docker login` if you haven't already):

```shell
docker image push <your username>/<image name>
```

This image will be available on other machines to be pulled down now.

## Docker volumes

Anything that changes inside a running container is lost when that container is removed which if you've run it with the `--rm` flag will be when it stops. You don't always want that to happen - think of a database for example - so you can mount a volume into the container and that will persist beyond the lifetime of the container.

### Mounting a local directory

It is possible to mount a local path from your host system into a container when it runs. The path is then shared into the container so that changes made are reflected in the files inside the container.

This command uses the `--mount` flag which replaces the `--volume` or `-v` flag from earlier versions of Docker. It is more verbose but also more clear.

```shell
docker container run --rm --mount type=bind,source="$(pwd)",destination=/usr/share/nginx/html/ -p 8080:80 nginx
```

The `type` in the `--mount` flag is `bind` which tells Docker that you are binding to a local path on your host machine; the `source` captures the output from the `pwd` command to simply give the current path; the `destination` is that path to mount your local path to inside the container - this is the same path as before, which Nginx is configured to serve content from.

### Creating standalone volumes

Suppose you are running a database locally, in Docker, and you want to preserve the data if the container is removed. It doesn't make sense to persist that to a local path because the database will only run in Docker.

You can create volumes which are managed by Docker and they can be attached to containers with the `--mount` flag. Data in them will persist after the container is removed.

To create a volume resource, use the `create` command under `volume`:

```shell
docker volume create super-data
```

This command would leave you in an interactive shell inside the `ubuntu` container. Any data created in `/mnt/super-data` will persist in the `super-data` volume, and be available in any other container which mounted it too:

```shell
docker container run --rm -it --name first-container --mount type=volume,source=super-data,destination=/mnt/super-data ubuntu
```

It is actually possible to mount volumes to multiple containers simultaneously, so if you ran the commands in separate terminals you could modify the data in one and see the change in the other.

## Docker networks

Often, you will want to work with multiple containers, and allow them to communicate with each other - like an application and a database, for example.

All of the containers you have run so far have been connected to the default [bridge network](https://docs.docker.com/network/bridge/), already created by the `docker` tool. (There are a number of other network types but you don't need to know about them right now, and maybe not ever). All of the containers _can_ talk to each other on this network but it is not a simple process. To make it simpler to talk to other containers, and to ensure that only the ones you want to connect to each other can, you can create your own bridge network and connect your containers to that.

When you run containers connected to a network you have created then you don't need to specify any ports to be exposed - containers on that network can talk to any port on any other container connected to the same network. By default no ports are exposed to the host system so you would need to map those as before if you wanted to access a container from your browser, for example.

The first container you will run will be your Redis server - this is what you will connect to from the next container. You will give it a name, via the `--name` flag, and that name be used as a hostname to access it - the bridge network handles DNS resolution for you. From the second container you will use the [`redis-cli` tool](https://redis.io/topics/rediscli) to connect to the server and run some commands.

To create a network:

```shell
docker network create myspace
```

To run a container and connect it to that network (in this case a redis server):

```shell
docker container run --rm -it --name redis-server --network myspace redis:alpine --loglevel verbose
```

To run a second container and connect it to the same network (in this case a redis CLI tool):

```shell
docker container run --rm -it --name redis-client --network myspace redis:alpine redis-cli -h redis-server
```

Any actions you take in the CLI are registered in the server container. This is one container talking to another on the same network, using the name you have it as a DNS hostname.

The `redis:alpine` image has a default command of `redis-server` but it also has an entrypoint set to be a script which handles options passed to it and either allows other commands to be run, such as `redis-cli`, or it checks for arguments starting with `-`, like `--loglevel`, and passes these to the `redis-server` command ([this is the script which handles that](https://github.com/docker-library/redis/blob/dc6dc73/5.0/alpine/docker-entrypoint.sh)).

(Note: the `:alpine` tag on the `redis` image tells us that it is using [Alpine Linux](https://alpinelinux.org/) as the base. Alpine is a very popular base for container images because it is very small and focuses on security - its size means that it doesn't include a lot of features so the surface area for attacks is smaller. The `redis:alpine` image is roughly half the size of the `redis:latest` image.)

### Building a Docker Image for a Node Application

When you are developing your application you may change your Javascript code a lot - adding new features, fixing bugs etc. - but your `package.json` file is likely to change much less often. As you know, when Docker sees that something in a command has changed then it will rebuild that layer - this includes any files that are copied into the image. If you copy all of the files in the directory into the image and then run `npm install` whenever there is a change to any file, even a CSS change, then all of the dependencies will be downloaded again. To avoid that happening every time the image is built you can put the copying of the `package.json` file and `npm install` in steps before you copy the rest of the application in.

With node apps, it's good practice copy in the `package.json` and `package-lock.json` to whatever the current directory inside the image is - `.`. When copying multiple files Docker requires a `/` at the end of the directory name. Inside the image you don't need any test dependencies so include the `--production` flag. The final step copies the current directory - `.` - to the same path inside the Docker image.

```Dockerfile
FROM node:12

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .
```

When you run the container you want the Node server to start so the command that is run should be [`npm start`](https://docs.npmjs.com/cli/start.html) - the convention for running a web server with Node. In a Docker image this is specified in the `CMD` directive at the end of the file. The preferred way to give the command is in an array-like format with the name of the program to run and its parameters as separate items:

```Dockerfile
CMD ["npm", "start"]
```

In this case `npm` is the program to run and `start` is the parameter and they are given as strings.

## Docker Compose

Docker Compose is a tool from Docker that helps you to manage multiple containers, networks and volumes. The system you want to build is specified in a YAML file read by the `docker-compose` tool and that can manage the full lifecycle - pulling, building, running, stopping and removing - of the containers and other resources you specify.

### The docker-compose.yml file

The `docker-compose` tool reads a file defining the system and by default that is called `docker-compose.yml`. As suggested by its extension this is written in [YAML](https://yaml.org) format.

There are a number of different versions of the `docker-compose.yml` file specification The first line in the file specifies the version you are using. The next top-level key most docker-compose files will use is `services` and under that will be each container you intend to create (a Node web app and a Postgres database, for example).

The entries under `services` support either building an image from a local directory and running that or running a container from an existing image. If you've created a Dockerfile, you will likely be building an image from the code in the same directory. This example will do this under a service called `web`:

```yaml
version: "3.7"
services:
  web:
    build: .
```

### Connecting another service

Any services you add to a `docker-compose` file will be created within a network without you having to specify that, allowing the services to talk to each other through whichever ports they wish. If your networking structure is more complicated, you can define the networks and their name for which you wish each service to have access to.

The easiest way to pass configuration data to an image is through environment variables, as this allows your application to read them in other situations too. Environment variables for each service in the compose file can be given under the `environment` key. In node applications, these are accessed via the `process`, e.g. `process.env.DATABASE_HOST`.

To make a service accessible through your web browser, map the port that it runs on to your host (akin to the `publish` tag when running through the CLI).

If a service is reliant on another service existing before the container is initialised (such as a database), then we need a way to ensure it is ready before the web app starts. The `depends_on` key allows you to give a list of other services that this one needs to be running before it starts.

A definition for a `web` service that used a database might look like this:

```yaml
web:
  build: .
  environment:
    DATABASE_HOST: db
    # etc.
  ports:
    - 3000:3000
  depends_on:
    - db
```

Any environment variables will be available to the process running inside the container. The network port `3000` from inside the container will be mapped to the same port on the host and this container will wait until one you've called `db` is running before `docker-compose` starts it.

When running services derived from pre-existing images you are well advised to look into the documentation, as the definitions for environment variables and other capabilities vary according to the service.

If you wish to persist the data beyond to lifetime of the docker network, then you can bind a volume to do that. Add the appropriate definitions to a service you wish to persist (like a database or cache), taking account of where you are storing your data (the `source`) and where the documentations says it will live on the image (the `target`). This might be found under a Postgres image defintion:

```yml
  volumes:
    - type: bind
      source: ./migrations
      target: /docker-entrypoint-initdb.d
```

### Running the service

With your `.yml` config defined, you can now use `docker-compose` to start the service for you. That is done by running `docker-compose up`. To ensure a service is built beforehand, use `docker-compose build`, or else use `up` with the `--build` flag. Without that flag Docker Compose won't build the image for you, so if you make changes to your code and forget to pass that flag, you won't see them.

Docker Compose prefixes the resources it creates with the name of the project which by default is the current directory name. When you first run it, Compose will see that there is no Docker image for your services with the correct name and will use the `Dockerfile` in the current directory to build an image and tag it `<dirname>:latest`, and it will also pull down any additional images and start them (first, if they are listed under `depends_on` on another service).

The command is running in the foreground of your terminal so you can stop it using `Ctrl-c`. This stops the container but doesn't remove them or the network that Docker Compose created for them to run in. To remove everything that `docker-compose` created for you run:

```shell
docker-compose down
```

The next time you run `docker-compose up` it will see that your images already exist so won't rebuild the image, even if there are changes that would cause a normal `docker image build` to build a new image. To force Docker Compose to build a new image when it runs you can pass the `--build` flag:

```shell
docker-compose up --build
```