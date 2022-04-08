# Cloud Infrastructure - Networking, Database and Container Orchestration

## Prior knowledge

- Compute on AWS
- Basic application architecture

## Prerequisites

- access to an Amazon Web Services account
- the [AWS CLI tool](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html) installed (read the link or [`brew install awscli`](https://formulae.brew.sh/formula/awscli))

## Aims

- Create public and private subnets inside a VPC
- Create an RDS database instance for an application
- Run application inside containers on AWS Fargate
- Send traffic via a load balancer to multiple containers

## Virtual Private Cloud - VPC

When you created an EC2 instance in the previous lesson it was launched into a network within your AWS account and you were able to access that instance from outside the network. This was very convenient for getting started but it might not suit your needs in production. Your database, for example, should be accessible by your application but perhaps not from anywhere else. You used a network security group to control access to your EC2 instance, which you made accessible only from a certain IP address but you can go even further with network security.

The VPC service from AWS allows you to create your own networking space which you control. You can decide if traffic is allowed into or out of different parts of the network and you can run the parts of your application that you don't want to be directly accessible in private parts of the network that can't be reached from outside it.

There are a number of different resources that go into creating a usable VPC: the virtual private cloud itself, which is the whole network box; VPC subnets, which are smaller parts of the network generally placed in different AWS availability zones; route tables, which decide where traffic within a subnet can travel and are what makes subnets public or private; internet gateways; which allow subnets to send traffic to and receive traffic from the Internet. Network address translation (NAT) gateways can be used to allow private subnets to talk out to the Internet but you won't use them in these exercises.

Your AWS account already includes one default VPC into which your EC2 instances were launched. This is fine but it only includes subnets that are publicly accessible.

### Create a VPC

In this example you will:

- create a VPC network
- with a total of 6 subnets:
  - 3 public
  - 3 private

This gives 1 public and 1 private subnet in each availability zone of the EU West 1 AWS region. Services and resources can therefore be run in either a private or public network space in any availability zone. EC2 instances in the public subnets will be able to receive traffic from the Internet but EC2 instances running in the private subnets will only be able to receive traffic from within the VPC, either from the public or private subnets.

Log into your AWS account and navigate to the VPC dashboard part of the control panel. Click the button reading _Launch VPC Wizard_ and on the page that appears choose the _VPC with a Single Public Subnet_ option and click _Select_. On the next page give the VPC a name - `main` - and leave the other options as they are. Click the _Create VPC_ button and AWS will show a progress bar flashing up messages telling you all of the resources being created for you. Now you will see a page telling you that your VPC has been created.

The VPC created has one subnet which is publicly accessible. You will now create 2 more subnets that are publicly accessible, each in a different availability zone. Click on the _Subnets_ item in the left-hand menu and in the list you will see a subnet called `Public subnet`, which is part of your new VPC. Scroll along the table to find out which availability zone the subnet is in (one will have been selected at random by AWS) and edit it to reflect that e.g. if it is in `eu-west-1c` then rename the subnet `Public subnet c` - edit the name of the subnet by clicking on the pencil icon that shows when you put your cursor over the box with the name in.

Next, click the _Create subnet_ button at the top of the page. On the next page you will enter details for the subnet. Set the _Name tag_ to be `Public subnet <z>` where `<z>` corresponds to the letter of the availability zone you select - choose one which is not the random one chosen for your first subnet i.e. if your first subnet is in `eu-west-1c` then name this one `Public subnet a`. In the _VPC_ list choose your new VPC, `main`, and from the _Availability Zone_ list choose the one corresponding to the name you've chosen for the subnet e.g. `eu-west-1a`.

The name for your subnet doesn't have to correspond to whether or not it's public or private and it doesn't have to match the availability zone the subnet is in but naming things well can help you a lot further down the line so its a good idea to pay attention to it.

In the final box, _IPv4 CIDR block_, you need to enter a value for your subnet. Classless inter-domain routing, or _CIDR_, notation is a way to specify a range of IP addresses and it consists of a 4 part IP address (where each part is between 0 and 255), a slash and then a number from 0 to 32. The final number is the length of a _bit mask_ applied to the IP address number and higher that final number the smaller the range of IP addresses available.

Your entire VPC has the CIDR range `10.0.0.0/16` which gives 65536 possible IP addresses in the VPC - from `10.0.0.0` to `10.0.255.255`. The subnets you have inside your VPC have to be able to fit within that range and the first subnet created has the CIDR range `10.0.0.0/24` which gives 255 IP address - from `10.0.0.0` to `10.0.0.255`. Your next subnet needs to have a CIDR range that doesn't overlap with the first and it should probably be another `/24` range so that it is the same size. The next available range is `10.0.1.0/24`, giving addresses from `10.0.1.0` to `10.0.1.255`.

CIDR IP ranges are complicated so the main things to take away are:

- They specify a range of possible IP addresses
- The higher the final number the smaller the range
- Ranges for subnets within the VPC can't overlap - AWS will prevent you from doing that

Back to creating a subnet - in the _IPv4 CIDR block_ box enter the value `10.0.1.0/24` which is the next available IP range in the VPC. Click the _Create_ button in the bottom corner and your subnet will be created inside the VPC. Repeat this for the remaining availability zone in the `eu-west-1` region so that you have 3 subnets in your VPC: `Public subnet a`, `Public subnet b` and `Public subnet c`. They should have CIDR ranges of: `10.0.0.0/24`, `10.0.1.0/24` and `10.0.2.0/24`.

In the list of subnets in the AWS console select the first subnet that was created for your new VPC - the one created by the wizard rather than the first one you created. In the details pane at the bottom of the page click on the _Route Table_ tab and you will see the ID of a route table given - `rtb-0123456789abcdefg` - and a table with headings _Destination_ and _Target_.

A subnet is associated with a route table and a route table tells the network where IP packets for different destinations should be routed to. In the table for this subnet there are 2 entries. The first has _Destination_ of `10.0.0.0/16` and a _Target_ of `local`. This tells the network that any traffic being sent to IP addresses in the range `10.0.0.0/16` should be kept within the network. In other words, any traffic sent within the network will be sent to the right place. The second entry in the table has the _Destination_ `0.0.0.0/0` and the target is the address of an _Internet Gateway_ resource - `igw-0123456789abcdefg`. An _Internet Gateway_ handles sending and receiving traffic between the network and the Internet, and the IP range `0.0.0.0/0` means all possible IP addresses. So any traffic in this subnet that isn't sent to another address within the VPC is sent out of the network via the _Internet Gateway_.

Now if you click on the first subnet that you created and look at the same _Route Table_ tab in the lower part of the page you'll see that there is a different route table ID and no entry for the `0.0.0.0/0` _Destination_. Traffic within this subnet can't communicate with the Internet and can only stay within the network. As this was intended to be a public subnet you need to change the route table that it is associated with. Click the _Actions_ button at the top of the page and choose _Edit route table association_ - there will only be 2 choices so select the one not currently assigned and you'll see the table with _Destination_ and _Target_ change - click _Save_.

The route table that was initially assigned to the subnets you created was the default route table for the VPC and it only allows for routing traffic within the VPC. Now you need to create your 3 private subnets, so go through the same process you did for creating the public subnets - one in each availability zone - but name them `Private subnet <z>` and don't edit the route table association. You can use the following CIDR ranges for the private subnets: `10.0.3.0/24`, `10.0.4.0/24`, `10.0.5.0/24`.

Now you will have a VPC named `main` that contains 3 subnets named `Public subnet a`, `b` and `c` and 3 subnets named `Private subnet a`, `b` and `c`. Instances launched into the public subnets can talk to and receive traffic from the Internet and instances in the private subnets can only send and receive traffic within the network.

## Relational Database Service - RDS

Your newly created VPC has both public and private subnets and resources launched into the private subnets can not send traffic to or receive traffic from the Internet. If you're running a web application that talks to a database then this is a perfect place to run the database - your application should be able to talk to the database but you don't want anything else to be able to reach it.

AWS offer a managed database service called [RDS](https://aws.amazon.com/rds/) that will create virtual servers running databases for you - the only way you interact with those servers is via the standard database connection i.e. with a username and password and a hostname and port.

In this exercise you will create an RDS database in one of your private subnets and then launch an EC2 instance in one of the public subnets to be able to connect to it.

Navigate to the RDS page in the AWS control panel and select the _Subnet groups_ item from the menu on the left. Here you'll create a group of subnets for AWS to launch your database into and you'll choose the private ones. Click the _Create DB Subnet Group_ button in the top right and on the next page give it the _Name_ `main-private` - the `main` VPC and its `private` subnets - you can also enter a _Description_ to remind yourself, _The private subnets of the main VPC_.

Under _VPC_ choose `main` and under _Add subnets_ click the button _Add all the subnets related to this VPC_, simply because it's easier to do that and remove the ones you don't want. Now under _Subnets in this subnet group_ you will see the 6 subnets in your VPC. Unhelpfully the table does not list the names of the subnets so you will have to recall that the ones with _CIDR blocks_ `10.0.0.0/24`, `10.0.1.0/24` and `10.0.2.0/24` are the public subnets so you should click the _Remove_ button next to each of those. Finally click the _Create_ button at the bottom of the page.

With the subnet group created successfully, select the _Databases_ menu item and click the button reading _Create database_. You'll be presented with 2 options: _Standard Create_ and _Easy Create_; because you want to use your own VPC and not the default one in the AWS account choose _Standard Create_ which gives you more flexibility.

Under _Engine options_ choose the _PostgreSQL_ _Engine type_ and choose the most recent version available, `12.2-R1` at the time of writing. From the _Templates_ choose _Free tier_ which will give you a small and, most importantly, cheap server. You can leave _DB instance identifier_ as `database-1` and under _Credentials Settings_ leave _Master username_ as `postgres` then check the box to _Auto generate a password_. The _DB instance size_ should be `db.t2.micro` which is the one available on the free tier, similar to the small EC2 instances which are available.

The _Storage_ can be left with the default settings and the settings under _Availability & durability_ are, somewhat ironically, not available. These can be used outside the free tier usage and allow for _Multi-AZ deployment_ where more than one database instance is created in the different availability zones within an AWS region. When you write data into your database it is copied across to the other instances so that if for any reason your main database instance becomes unavailable then AWS will automatically switch your database connections over to one of the instances in the other availability zones. This isn't instantaneous but generally happens within a few seconds or minutes which is much more desirable than the database becoming completely unavailable. Multi-AZ database deployments are highly recommended for production use.

Under _Connectivity_ is where you choose your new VPC to launch the instance into. For _Virtual Private Cloud (VPC)_ choose your new `main` VPC. For _Subnet group_ you can choose `main-private` and for _Publicly accessible_ choose _No_. You can use the existing `default` VPC security group and we will look more later at what that allows. _Availability zone_ can be left as _No preference_ and _Database port_ as `5432` - the standard PostgreSQL port. _Database authentication_ can be left as _Password authentication_ and you don't need to specify anything under _Additional configuration_.

With that whole page filled in you can click the _Create database_ button at the bottom. It will take a few minutes to create the database but when the status is _Available_ then you can click the _View credential details_ button to get the endpoint to connect to, plus the username and password to use. Copy these and save them on your machine because **the password will not be available to view again**.

### Accessing the database instance

Now that RDS has created the virtual server running PostgreSQL for you you can access the database itself. To do that you will need to use the database hostname but the IP address that it points to is not accessible from outside your VPC.

To access the database you will need to launch an EC2 instance in one of your VPC's public subnets and use that as a gateway to your database. This technique is very common for accessing resources in private networks. The EC2 instance in the public subnets is accessible from outside the VPC network and as it is within the VPC it can send traffic to the private subnets, so you use it like a stepping-stone to get to your database.

Navigate back to the EC2 part of the AWS control panel and click _Launch Instance_ button. Go through the same steps as you did in lesson 3 but after choosing the instance type click _Next: Configure Instance Details_ to select the network it gets launched into. On the next page, under _Network_ select your `main` VPC and under _Subnet_ choose `Public subnet a`. For _Auto-assign Public IP_ choose _Enable_ and then at the bottom of the page click _Review and Launch_. In the pop-up you are presented with you should be able to use the option _Choose an existing key pair_ and use the one from the previous lesson (if you don't have access to it then create a new one and follow the same steps as previously). Then click _Launch Instances_.

Once the instance is launched click on its ID, then click the _Actions_ button at the top of the page. Under _Networking_ select _Change Security Groups_. You need to add the `default` VPC security group to it which is what the database has assigned too. In the pop-up that appears tick the box next to the security group named `default` and click the button _Assign Security Groups_.

### Default security group

The `default` security group is one created with the VPC and, like the group that is created when you launch your EC2 instance, it allows network traffic from a destination. The protocol and port of the traffic are left open so they can be anything but the source is set to the ID of the security group itself.

It is possible with AWS VPC security groups to specify the ID of another security group as the source of network traffic, rather than an IP address or range of addresses. This means that any AWS resource - EC2 instance or RDS instance for example - that has that security group assigned is allowed to send traffic to the destination.

In the case of the `default` security group the destination is itself so any resources in the VPC which have the `default` security group assigned can send traffic to each other.

### Connect to the RDS instance via EC2

In this example you will:

- connect to the EC2 instance you launched
- install tools to talk to PostgreSQL
- connect to your database

Get the _IPv4 Public IP_ address from the EC2 instance details and use the `ssh` command in your terminal to connect to it, in the same way that you did in lesson 3.

You can install the `psql` command line client to connect to the database. The `postgresql` package is an extra on the Amazon Linux 2 operating system so it needs to be enabled:

```shell
sudo amazon-linux-extras enable postgresql10
```

Then it can be installed:

```shell
sudo yum install postgresql
```

Once that installation completes the `psql` tool can be used to connect to the RDS database instance - enter the password you copied from the AWS console earlier:

```shell
psql -U postgres -h <database hostname>
```

## Container orchestration

Packaging software inside Docker containers is very convenient for distributing and running on other machines. When you run containers in production you will very likely be running them across a number of servers and alongside other applications running inside their own containers. One of the benefits of containerisation is the isolation it provides so that services can be run together on the same machine without interfering with each other. When you want to manage lots of containers like this you will need something beyond the `docker` command line tool to do that.

There are quite a few options for managing running containers across one or more servers: Kubernetes, Docker Swarm, Nomad. AWS offer a service called [Elastic Container Service - ECS](https://aws.amazon.com/ecs/) - which is managed for you by AWS and lets you run containerised applications in production at a large scale. There are options to either create EC2 instances yourself and create a cluster or to let AWS manage everything and just specify how you want your application to be run - this ECS feature is called [Fargate](https://aws.amazon.com/fargate/).

### ECS resources

In ECS your application will be represented by a _service_ and that service will run a _task_. The task is the part that actually runs the Docker container and the details of what it runs are specified in the _task definition_, which is effectively a template for the task that is run by the service - you can think of this as analogous to the way a Docker container is based on a Docker image, or a class is based on an object in an object-oriented programming language. Services on run on a _cluster_ which means a group of EC2 instances, however, for Fargate you don't need to create those EC2 instances yourself you just give your cluster a name and AWS takes care of the rest.

![Objects involved in ECS](ecs-objects.png)

### Cluster

To get started go to the _ECS_ section of the control panel and click on _Clusters_ in the left-hand menu - you won't use the _Getting started_ button here because that will result in creating a VPC for you and that is not necessary given your previous hard work in creating one.

Click on the _Create Cluster_ button and on the next page select the box marked _Networking only_ and then click _Next step_. On the following page you will need to enter a name for your cluster - use the name `default`. Leave the box labelled _Create VPC_ unticked and then click _Create_. That operation should complete quickly and then you can choose to view the cluster. You'll see that the cluster is _ACTIVE_ and that there are no services on it.

### Task definition

Before you can create a service you will need a _task definition_ for the service to base its tasks on. In the menu on the left click on _Task Definitions_ and then choose _Create new Task Definition_. On the next page you should choose _FARGATE_ for the type and then click _Next step_. Next you'll need to give your task definition a name - choose `my-nginx`. The next section of this page you need to fill in is _Task size_ - you can choose the smallest available values for both _Task memory_ and _Task CPU_. Underneath that section is where you define the _Container Definitions_ for the task - these are the details of any Docker images used to run containers for the task. It is possible to run multiple containers in a task but for this you will just specify one - multiple containers in one task definition can be used to run dependencies alongside your application, like log or metrics collectors that you application might communicate with.

Click the _Add container_ button and set the _Container name_ to `my-nginx`. The _Image_ should be the reference to your image on ECR Hub i.e. `<docker hub>/my-nginx`. Under _Port mappings_ enter `80` for the _Container port_ - this is the one that the Nginx web server is listening on inside the container run from your `my-nginx` image. All of the _Advanced container configuration_ can be disregarded and you can click the _Add_ button. Back on the task definition page click _Create_.

Now that you have a task definition you can create a service which will run tasks based on it, in the same way that a Docker container is based on a Docker image.

### Service

From the _Clusters_ menu item click on the _default_ cluster and under the _Services_ tab click the _Create_ button. On the following page you'll configure your service and as you have chosen not to manage your own EC2 instances you can select _FARGATE_ for the _Launch type_. Under _Task Definition_ the _Family_ is the name of the task definition you created - `my-nginx` - and the _Revision_ will be `1 (latest)`. Set _Service name_ to `my-nginx`, the same as the name of the Docker image and the task definition - there is only one Docker container to be run in the tasks for this service so it makes sense to use the same name in all places. _Number of tasks_ can be set to `1` - this is the number of copies of your application which are run. If you were running an application in production then you would almost certainly want to run more than one copy of your application in case one crashes for any reason; in this case you can happily run one task. The _Deployment type_ you can leave as _Rolling update_ - this tells ECS how you want the containers in your tasks to be replaced when you deploy a new version. The _Rolling update_ will add new container and take down the old ones in parallel - other, more complex options are available through _AWS CodeDeploy_ but they are out of the scope of this lesson. Click on _Next step_ to go to the next page.

At the top of the next page, entitled _Configure network_, you need to select a VPC. From the drop-down list select your `main` VPC that you created earlier. For the _Subnets_ select one of the public subnets - you don't really care which one and you can select more than one if you like - letting AWS run your services in any of the available subnets is definitely something that you would do in production just in case one availability zone was unavailable. A security group will be created for you so you can leave that as it is. For _Load balancer type_ select _None_ and then further down the page untick _Enable service discovery integration_, then click _Next step_. You will skip autoscaling for now so click _Next step_ again and then on the following page you can check the details before clicking _Create Service_. The page following that will show a number of resources being created and will give you a button to _View Service_.

When you view your new service, under the _Tasks_ tab you will see one task listed and it's likely that the _Last status_ will be `PROVISIONING` - this means that the Docker image is being pulled from Docker Hub before the task can be run. Once that status is _RUNNING_ click on the unique ID in the _Task_ column to see the details for that particular task. You'll see that the task has a _Public IP_ - copy that, enter it into your browser and you will see content served up by your `my-nginx` Docker image.

You have told ECS that you always want to have one task for this service running so if you task stops then ECS will start a new one for you. On the detail page for your service's task there is a button in the top right marked _Stop_. Click that button and then confirm that you would like to stop that task. On the page for your service you will see that there are no tasks listed as running. Refresh this list and quite quickly you will see that ECS has begun to start a new task for you - it may go through a `PROVISIONING` or `PENDING` status before it starts but within a minute or so a new task will be running. This will have a new IP address so you will need to go and find that before you can access your running container again.

### Load balancing

If a task is stopped for any reason then you don't want to have to go find the new IP address to send your users to. Likewise, if you are running more than one task then you want one place for your users to go and have that direct them to any of the available running copies of your application. For this you can use a [load balancer](<https://en.wikipedia.org/wiki/Load_balancing_(computing)#Server-side_load_balancers>) which sits in front of your application. Users' requests are sent to the load balancer and that decides where to forward the request on to. If any of the IP addresses of the applications behind the load balancer change then the users don't need to know, as long as the load balancer does. AWS offer load balancing as a one of their services, called [_Elastic Load Balancing_](https://docs.aws.amazon.com/elasticloadbalancing/) it lets you create a load balancer resource and point it to your service on ECS (it can be used with other AWS services too). ECS will tell the load balancer about all the IP addresses of the tasks it is running and the load balancer can direct traffic to them. If any IP addresses change, or if the container crashes, then ECS tells the load balancer about the new IP addresses and those will be used.

In this exercise you will create:

- a service running on ECS with multiple tasks
- an Application Load Balancer directing traffic to the service

AWS doesn't allow you to add load balancing to an existing service so start off this exercise by deleting your `my-nginx` service. From the `default` cluster in the ECS part of the AWS control panel, click on the `my-nginx` service and in the top right corner you will see a button marked _Delete_. Click this button and confirm the prompt to delete the service. This has only deleted the service but your task definition - the template the service used to run tasks - remains and you can use that for the new service.

Before we create the load balancer, we are going to think about the security groups which will exist in our architecture. We will have the load balancer and the ECS service communicating with each other, so it would make sense to take advantage of the default security group to do this. However, this only allows traffic to pass around between the services, and we will need to accommodate the incoming HTTP traffic trying to reach our service. Instead of extending the default security group, which would then allow HTTP traffic to reach _any_ of our services (as long as they are in a public subnet), we can create a new one specifically for the load balancer to listen within. The LB is then equally happy receiving traffic from the internet as it is communicating within the security group.

From EC2 -> Security Groups, create a new security group, and permit HTTP traffic from any source. Describe it so it is easy to identify later!

Now you need to create an Application Load Balancer for your service to use. Go to the EC2 part of the AWS console and from the menu on the left find and click on _Load Balancers_, then click the _Create Load Balancer_ button at the top. The options you are then presented with are: _Application Load Balancer_, _Network Load Balancer_ and _Classic Load Balancer_. _Classic_ are the previous generation so you can ignore that. _Network_ are for working with protocols that are more low-level than HTTP, such as TPC or UDP - you don't want that here. _Application_ type load balancers - ALBs - deal with HTTP(S) requests and understand everything at that level so are perfect for web applications. Select _Create_ under _Application Load Balancer_.

Give your ALB a name - `my-nginx` - and ensure it is _internet-facing_ so that external traffic can reach it. It should have a listener with _Load Balancer Protocol_ set to `HTTP` and _Load Balancer Port_ set to `80`. The listener is the part of the ALB that receives traffic from users. Under _Availability Zones_ select at least two (running in production you would select all three) and choose the public subnet for that zone. Now click the button to go to the next page. The page will tell you that you are not using a secure listener, which is true - you are using an HTTP rather than HTTPS listener. This is acceptable for this example and avoids having to create any encryption certificates. Click to go to the next page.

Now you will be prompted to select a security group for your ALB and you should add it to both the default security group (to communicate with ECS) and the one you just created (to listen to incoming HTTP traffic). You can now click _Next: Configure Routing_ at the bottom of the page.

ALBs use something called a _target group_ to send traffic to the destinations you choose. A target group will be associated with your ECS service and will contain the addresses of all of the running tasks for your service. All ALBs must have at least one target group to direct traffic to so set the _Name_ of the target group to `default`. Change the target type to _ip_. Leave the other settings as they are and click to go to the next page. The following page is where you can select targets to be added to the target group - there aren't any yet so click _Next: Review_, then click _Create_ to start to create the ALB. You should quite quickly see a message to say it has been successful, although it can take a while for load balancers to become fully available for use.

Now you can create your ECS service. Perform the same steps as previously and begin creating a new service on the `default` cluster. Make sure you select the `FARGATE` launch type and you can give it the same name the you used the first time too. On the second page, _Configure network_, you will do things slightly differently to the first time. Select you `main` VPC again and choose one (or more if you wish) of your public subnets for the service to run in. The tasks will have traffic directed to them by the load balancer so they themselves don't need to be accessible from the Internet, however they do need to be able to communicate out to the Internet to pull the Docker image down.

If this service was running in production then you should run the tasks in the private subnets to give extra security. The reason you are not doing that in this example is because the Docker image used in the task definition is coming from Dockerhub, which we are currently accessing via the Internet, and the private subnets don't have any way to communicate outside your VPC. It is possible to connect to a private ECR registry instead of Dockerhub without having to leave the private subnet, but is complicated and involves resources not on the free tier so we will bypass that option. More info about ([AWS PrivateLink](https://aws.amazon.com/blogs/compute/setting-up-aws-privatelink-for-amazon-ecs-and-amazon-ecr/))!

Further down the page, under _Load balancer type_ select _Application Load Balancer_ and then for _Load balancer name_ choose `my-nginx`. The page will now have a new section, _Container to load balance_. If you task contained multiple container definitions then you would have to choose which one was to be added to the load balancer. In this case there is just one and you can click _Add to load balancer_.

The _Production Listener Port_ should match the listener on the load balancer, which was _80: HTTP_ to receive incoming HTTP traffic. You can also select the _Target group name_ that you created earlier. If these options aren't available to you, you might have neglected to set the target type to 'ip' when you earlier created the target group.

Make sure that _Enable service discovery integration_ is unticked and click _Next step_, skip the auto scaling step and then click the button to create the service.

To access your service via the ALB find the details of the ALB in the _Load Balancers_ section of the EC2 part of the AWS control panel. Under the _Description_ tab for the load balancer copy the _DNS name_ and enter that into your browser. You will see the content served up by your container. Now go back to your ECS service, click the _Update_ button and change _Number of tasks_ to `3` - then click _Skip to review` and then \_Update Service_. Under the _Tasks_ tab you will see new tasks begin to be launched. If you go back to your browser you will continue to see the same content available via your ALB. You'll see that same content even if you stop 2 out of the 3 tasks you have running.

## What cloud native architecture is

Cloud native services are ones that are designed to be run in a cloud environment, on cloud infrastructure. You know that cloud infrastructure refers to virtual infrastructure, often run by a third-party and offered as a service. Services that run well in environments like this are aware that the infrastructure that they are running on can change, move or disappear with little or no notice. Services running in environments like this should have certain properties that allow them to continue to operate if the virtual machine they are running on suddenly shuts down, perhaps because the underlying physical machine needs an upgrade or some maintenance or simply because it has crashed or caught fire. This is not actually different to how software running on physical machines in data centre should be architected because physical machines fail too: disks crash, power supplies break down and high CPU usage on the server can just make it stop responding. All infrastructure can fail so to be reliable services should aim to be scalable and resilient and in this lesson you will learn some techniques to achieve those things.

## Scalability and resilience

The two ideas of scalable and resilient services are closely linked but roughly speaking services that are scalable can increase their capacity easily and without further engineering to accommodate more traffic. Services that are resilient can tolerate failures, either in themselves or in the infrastructure on which they're running, and leave their users as unaffected as possible. These things are linked because they will both involve running more than one copy of the service and making sure that other running copies of the service don't cause problems for each other.

By running three instances of our service, we have built some resilience into our service: should one drop out, the ALB can direct traffic to the other two and the user does not lose out. Now we'll look at building scalability - what happens if our service is really popular and three instances doesn't cut it?

#### Metrics

Scalability requires a trigger of some sort - feedback from our architecture. Several times we've used logs as feedback, but logs are usually unstructured lines of information that are designed for humans to read to get information about what is happening when an application runs. Metrics are a way to record information about what is happening inside a running application in a way that can be interpreted in a more mathematical way. For example, when the application generates an error the text from the error would appear in the logs but the application could also increment a counter metric to record the number of errors generated. If this number reaches a certain threshold within a period of time then you might want to be prompted to investigate the errors. For example, if an error occurs once per day in a busy web app then it is unlikely to be a big problem. However, if 100 errors occur in a minute for the same application then that might indicate a problem that needs to be fixed.

There are different tools to help you record metrics: [statsd](https://github.com/statsd/statsd) from Etsy, [collectd](https://collectd.org/) and [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/). They all follow a similar pattern of running a local program that your application sends data to, then having a central place where metrics are collected and can be analysed - graphs are great for looking a metrics. The requirement for metrics to be aggregated across all running instances of an application makes them scalable by design, although the scalability of a specific tool will be down to its own implementation and deployment.

Many of the services you run in AWS generate metrics and send them to the CloudWatch service. Any ECS services you run will automatically generate CPU and memory usage metrics which appear in CloudWatch. You can draw graphs using these, performing mathematical operations like summation, minimum, maximum and average values.

### Automatic scaling

If your application has these characteristics of scalability and there are metrics available indicating how it is operating then those metrics can be used to make decisions about scaling the number of instances of the application. For example, if your application's CPU increases as the amount of traffic it serves goes up then you could decide to start more copies of your application to avoid CPU usage becoming so high that the application stops responding. If the average CPU per minute crosses a certain threshold for a period of time then you could make the choice to start a new copy of your service. For example, if the application is using more than 80% of its available CPU for 5 minutes then you could start another service process to take some of the load. If the CPU usage drops back down again then you can reduce the number of copies of your service you have running. Generally speaking you want to scale your service up very quickly and scale it down much more slowly - up like a rocket and down like a feather. It's much better for your end users to have a lot of servers to handle their requests and gradually reduce this to maintain the service than to either take too long to add more capacity to remove capacity prematurely.

Running in a virtual environment and controlling your infrastructure via an API means that you can use automatic processes to inspect your metrics and change the capacity of your serivce. AWS have functionality to help you do this using the metrics for your application that are available in CloudWatch. The CloudWatch service has a resource called an _alarm_ and you can specify an action to take when that alarm is triggered. The alarm is configured to watch a metric and when the metric breaches a certain threshold then the alarm is triggered and the action is fired.

### Auto scaling example

In this example you will set up automatic scaling for our ECS service running behind a load balancer.

Find your ECS service in the AWS console and click to _Update_ the service. Click _Next step_ until you get to the page reading _Service Auto Scaling (optional)_ and choose the option _Configure Service Auto Scaling to adjust your service’s desired count_. You will then see fields for entering the minimum, maximum and desired number of tasks. Set the minimum and desired tasks to `1` and the maximum to `10`. The _IAM role for Service Auto Scaling_ should either be set to _Create new role_, or `ecsAutoscaleRole` if this has already been done. Now you need to create the policy for how your service will scale - click on _Add scaling policy_ and an _Add policy_ panel will appear. For the _Scaling policy type_ choose _Target tracking_.

The _Target tracking_ option is a newer one than the other choice, _Step scaling_. _Step scaling_ will simply add or remove capacity as a metric crosses a threshold. _Target tracking_ tries to keep a metric at a target value by changing the capacity of a service. For example, if you specified that you wanted CPU utilisation to be at 50% then the auto scaling service would add more capacity if usage was higher than that and it would remove capacity if usage was below that. Target tracking scaling will adjust the number of resources proportionally to the difference in the desired metric value and its actual reading, so small differences will result in small scaling increments and large differences in bigger steps.

With the _Scaling policy type_ set, enter a _Policy name_, such as `cloud-native-example-service-scaling`. You are given a number of options for the _ECS service metric_ and as this service has a load balancer you can choose `ALBRequestCountPerTarget` - the number of requests that each container is serving per minute. Choose that metric and set the _Target value_ to `10` - a very low number that has been chosen for this example so that scaling can easily be provoked. Set the _Scale-out_ and _Scale-in cooldown period_ values to `60` seconds. These values tell the auto scaling service not to add or remove capacity for this length of time after it has made a change to the service. This is to give the service time to handle the work and for that to be reflected in the metrics. Leave _Disable scale-in_ unchecked - that option means that the service will only ever scale up and must be manually scaled down. Click _Save_ then click through to update the service and you will see a number of resources being created.

In your service you will still see one task running and that won't change until the service starts serving some requests. Go to the CloudWatch service part of the AWS console and click on _Alarms_ in the left menu. You will see 2 new alarms, prefixed `TargetTracking-service/default/...`. These alarms and their actions have been created for you by the auto scaling service and will examine the number of requests that each of your containers is serving. The actions for these alarms will either start new containers or stop running ones, depending on how many requests are being served. One of the alarms will be in the `OK` state indicating that the service does not need to be scaled up. The other will be in the `ALARM` state because the number of requests per container is less than `10` so it is indicating that the service can be scaled down. However, only one task is running so the action won't do anything.

Now you can generate some requests and get your service to scale up. To do this you can either use the Apache Bench tool - `ab` in your terminal - which will be installed if you are using a Mac and can be installed on Linux with the `httpd` or `apache2` package, depending on what distribution you are using, or with the `artillery` package that can be installed via `npm`. Both have similar options.

To run 10,000 requests, 10 at once, against your service with `ab` run this in your terminal:

```shell
ab -n 10000 -c 10 http://<endpoint>/
```

To do the same using `artillery` run this:

```shell
artillery quick -n 1000 -c 10 http://endpoint/
```

Run one of these commands a few times to generate some requests to your service. The scale-up alarm looks for the metric to be above the threshold for 3 minutes before it triggers scaling - the scale-down period is much longer, at 15 minutes. This is of course because you would prefer your service to be scaling up quickly and down slowly. After a few minutes of generating requests you will see that the scale up alarm has been triggered and the number of tasks your service is running has increased. If you stop generating requests then gradually you will see the number of tasks fall again.




DHbgLMsCCZPkgbmoEZ72