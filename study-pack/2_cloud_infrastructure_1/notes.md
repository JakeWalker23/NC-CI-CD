# Cloud Infrastructure - IAM, Compute and Storage

## Prior knowledge

- Javascript

## Prerequisites

- access to an Amazon Web Services account
- the [AWS CLI tool](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html) installed (read the link or [`brew install awscli`](https://formulae.brew.sh/formula/awscli))

## Learning objectives

- Create a virtual server
- Limit access to the server via network security group
- Access the server over SSH and install a package
- Access the server over HTTP
- Create an S3 bucket
- Upload files to the S3 bucket
- Create a Lambda function
- Trigger the Lambda function by uploading a file to S3

## Virtual vs real infrastructure

Cloud computing is a term given to virtual computing infrastructure, often offered as a service by a third-party vendor. Virtual infrastructure is a technique where a software program creates something which behaves like a computer with its own operating system. The program has to run on a real, physical computer, usually running many virtual machines, and they are very often connected to a network of other computers to make it easy to manage isolated virtual machines for services to run on.

The first company to publicly offer a virtual cloud computing service was Amazon Web Services, a subsiduary of the Amazon company, which launched in its current form in 2006 (there were services available from 2002 but the company was relaunched after that). AWS continues to be the largest of the public cloud providers but Google Cloud and Microsoft Azure have seen huge growth in recent years. All of the providers offer different services but there are many fundamentals that they all offer - things like compute, storage and database services.

This lesson will use AWS as an example but the ideas are applicable to other cloud providers too. AWS offers a substantial [free tier](https://aws.amazon.com/free/) for a lot of its services so you can experiment with it without incurring any cost in most cases.

## Identity and Access-control Management (IAM)

[AWS IAM](https://docs.aws.amazon.com/iam/index.html) enables you to securely control individual and group access to your AWS resources. Whenever one AWS service talks to another there is a consultation with the IAM service to check that the actions on those resources are allowed. Using IAM, you can manage AWS users, groups, and user permissions for your AWS services. IAM provides fine-grain control options and supports federated users (users outside of AWS) by integrating with third-party identity providers, such as Facebook or Google, and having authenticated users _assume_ IAM roles.

### IAM Authorisation

After a user has been authenticated, they have to be _authorised_ to access AWS services. By default, AWS users can't access anything in your account. You need to grant permissions to a user by creating a _policy_.

IAM policies are documents in JSON format that explicitly list permissions. Each policy lists the EFFECT, ACTION(s), RESOURCE(s) and OPTIONAL CONDITION(s) for what API calls an _entity_ can invoke.

```json
{
  "Sid": "Stmt1234", // Who/what is authorised
  // (could be a user / group / another resource within AWS)
  "Effect": "Allow",
  "Action": [
    // Which tasks are allowed to be performed
    // (can be string format too for a single action)
    "s3:DeleteObject",
    "s3:GetObject"
  ],
  "Resource": [
    // Resources to which authorised tasks can be performed
    // (can be string format too for a single resource)
    // Each resource is represented as an Amazon Resource Name (ARN)
    "arn:aws:s3:::billing-marketing",
    "arn:aws:s3:::billing-sales"
  ],
  "Condition": {
    // condition(s) for this authorisation request to be successful
    "IpAddress": {
      // only calls from the IP address listed here will have the designated permissions
      "aws:SourceIP": "10.14.8.0/24"
    }
  }
}
```

Any actions or resources that are not explicitly allowed are denied by default.

#### AWS Policy Resources

- [Overview of JSON Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html#access_policies-json)
- [Amazon Resource Names](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html)

```
arn:partition:service:region:account-id:resource-id
arn:partition:service:region:account-id:resource-type/resource-id
arn:partition:service:region:account-id:resource-type:resource-id
```

- [Global Condition Context Keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### Practical

Every AWS account has root level credentials with full access to everything in that account. It is recommended that you **do not use the root level credentials** for anything other than an initial set up of the account and the creation of an IAM user account with administrative permissions attached via policy.

#### Secure your account

Head over to [your AWS IAM console](https://console.aws.amazon.com/iam/home). There, you should see a summary of your security status:

![aws account security status](./aws_security_status.png)

The first step to securing your account is of course to use a [good password](https://imgs.xkcd.com/comics/password_strength.png) that is not used on any of your other accounts. Alternatively, use a password manager (for example [LastPass](https://www.lastpass.com/)).

Next, set up [multi-factor authentication](https://aws.amazon.com/iam/features/mfa). There are a few different "Virtual MFA Applications" to choose from. Google Authenticator works and is available on [the App Store](https://apps.apple.com/us/app/google-authenticator/id388497605) and [Google Play](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2).

#### Create an IAM user with admin privileges

Using the AWS management console, [add a new user](https://console.aws.amazon.com/iam/home#/users). We are going to create a new admin user so that we don't have to use the credentials of the root level account.

Account names must unique in the account that they are created, so it is a good idea to think of a standardised naming convention if creating users for an organisation.

### IAM Roles

IAM policies may also be assigned to an IAM Role. An IAM role is similar to a user in that it is an AWS identity with permissions that determine what the identity can and cannot do in AWS.

A role does not have any long term defined credentials, passwords or access keys associated with it at all.Instead if a user is assigned to a role, access keys are created dynamically and provided to the user temporarily. IAM roles can be used to delegate access to users, applications or services that do not ordinarily have access to your AWS resources. A user who _assumes_ a role temporarily gives up their own permissions and instead takes on the permissions of the role. (Like wearing many hats in order to perform different tasks.)

How can an IAM role be used in a real world scenario? Imagine you have a custom application that is hosted on an AWS EC2 instance.This app needs to interact with objects in an S3 bucket. One way would be to embed your AWS credentials in the application code but doing so may compromise your credentials. Also, updating the credentials would require an update each time. The alternative (and more secure option) is to use an IAM role to pass temporary security credentials as part of an instance profile. The application would use the identity _assumed_ by the instance to access the Amazon S3 bucket.

Another use case for IAM roles is provide users, groups or resources with permissions that they wouldn't usually have assigned to them. Imagine that you have an IAM user is assigned an IAM policy with restricted access to an S3 bucket. This user does not normally need administrative privileges to the bucket. However, the user may sometimes have to perform tasks that require administrative privileges. For this purpose, a new IAM admin policy is created. Then, a new role is created and the admin policy is attached to the role. When required, the user can be allowed to _assume_ the IAM admin role and gain administrative access to the designated resource.When the user no longer needs to use the role, the user permissions are restored. Leveraging IAM roles removes the need to modify a user's policy each time a change is required.

## Compute - EC2

Compute is the basic building block of software infrastructure because everything needs to run on a computer: web service, database, message queue etc. AWS offers Elastic Compute Cloud, or EC2, which lets you run virtual servers in different configurations to suit your needs. EC2 instances are launched from an Amazon Machine Image (AMI) that contains the operating system and potentially other software installed on it. When you launch a new EC2 instance you choose and AMI to start from, an instance type which determines how much memory and CPU the virtual machine has available to it, and other things like network configuration and hard disk size. Once you've selected your configuration you click to launch the machine and AWS creates it for you.

In this example you're going to create an EC2 instance via the AWS console. You should have console access to an AWS account and be in the `eu-west-1` region - it should say "Ireland" in the top right corner of the console screen but if it doesn't then click the location drop-down menu and select "EU (Ireland)" from there. It should be possible to do the same actions in any of the other regions but the examples in this lesson will all be tested in `eu-west-1`.

### AWS Regions and Availability Zones

Within your AWS account you can choose to operate in a number of different regions around the world. You may decide to choose a region which is closest to your main user base so that requests to your web services don't have to travel too far. Services operating globally will very often run in a multiple regions around the world and route traffic to the one nearest to the request origin.

Within a region there are 2 or more (typically 3) availability zones. These are geographically separate locations within a region, less than 100km from each other, connected by durable, high-speed networks. This allows you to run your application in one region but in multiple locations and be tolerant of power outages, floods, tornadoes and other disasters.

### Launch an EC2 instance

In this example you will launch a new EC2 instance and connect to it over SSH. First, log into the management console of your AWS account and navigate to the EC2 dashboard. From there click on "Launch Instance".

The first step the AWS presents you when launching an EC2 instance is to choose an AMI - this determines the operating system installed on the machine when it starts and it will often be Linux, although other Unix systems such as FreeBSD are available, plus Windows instances. For this example choose _Amazon Linux 2 AMI (HVM), SSD Volume Type_. AWS offer their own Linux distribution, based on [Red Hat Linux](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux), which has lots of different software packages available for install and integrates well with other AWS services. The reference to _HVM_ is the underlying virtualization and is not something that you need to worry about right now (or possibly ever) and the _SSD Volume Type_ refers to the primary hard disk which will be a solid state drive - faster than the older, magnetic spinning disks. Make sure the _64-bit (x86)_ option is ticked and click the _Select_ button.

On the next page you'll be prompted to select the instance type. There are many [EC2 instance types](https://aws.amazon.com/ec2/instance-types/) available and they all offer different combinations of CPU, memory, storage and networking performance. For this example you will use the `t2.micro` instance type - this is a small, general purpose type which is eligible for the free tier allowance. At the bottom of the page you'll see that you have options to continue to _Configure Instance Details_ or to _Review and Launch_ - click _Review and Launch_.

The next page you see will have all of the details that you have chosen so far - the AMI and the instance type - plus other things like _Security Groups_ and _Storage_ that you haven't learnt about yet and you can ignore for now. Click _Launch_ and a modal pop-up will appear that prompts you for an [SSH](https://www.ssh.com/ssh/) key pair so that you can access the instance once it has been launched. There is an options list where you can select _Create a new key pair_ - give it a name and download the `*.pem` [file](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail). Put the `*.pem` file under the `~/.ssh/` directory on your computer (assuming that you are using OSX or similar Unix system) and give it the correct permissions so that only your user can read or modify the file:

```shell
chmod 600 ~/.ssh/<filename>.pem
```

With that in place, tick the box that acknowledges you can't access the instance without that key and click the _Launch Instances_ button. You'll be taken to a page that confirms the instance is launching and gives you an ID with a link to see the instance details - the ID will be in the form `i-1234567890abcdef0`. Click on the link and take a look at the instance you've launched.

You'll be taken to the EC2 instances page, filtered by the ID of the newly created instance. You will see a number of columns including a blank `Name` column - if you hover over the blank space you'll see a pencil icon suggesting that you can edit that space and give the instance a name. Before you do that click on the _Tags_ tab in the bottom half of the screen - you will see that it is empty. Tags are pieces of metadata that can be attached to your EC2 instances, and other AWS resources, to help you to identify them. Now hover over the empty _Name_ field for your instance, click to edit it and enter `MyFirstInstance` then press `Enter` or click the tick. You'll see that your instance now has a tag with the key `Name` and value `MyFirstInstance`. Names are not unique for EC2 instances (IDs are) so you can use the same one for multiple instances but they'll be displayed in the EC2 control panel so can be a useful thing to set to identify your instances.

Click on the _Description_ tab in the bottom half of the screen and you'll see lots of information about the instance, some of which is also reflected in the columns in the table above. The _Instance State_ is in the table above and was initially `pending` but will settle on `running` once the instance has been launched successfully. You'll also see that there is an _Availability Zone_ which will have a value of either `eu-west-1a`, `eu-west-1b` or `eu-west-1c` - it is possible to choose this yourself when you launch the instance but it was skipped for this example. Also under the _Description_ tab is the _Security groups_ list which will have one entry: `launch-wizard-1`. Click on _view inbound rules_ and you will see a table that contains a port number, a protocol and a source: `22`, `tcp` and `0.0.0.0/0` respectively. Port `22` is used by the `ssh` protocol (which runs on top of the `tcp` network protocol, hence its inclusion) and the source `0.0.0.0/0` means all IP addresses. This security group tells AWS to allow traffic on port `22` from anywhere to be routed to the instance.

Also under the _Description_ tab you will see values for _Public DNS_ and _IPv4 Public IP_ - you can use either the IP or the DNS hostname to connect to the instance. Select the IP address and copy it to your clipboard then open a terminal and use the `ssh` command to connect to the instance. You will pass the `-i` (which stands for _identity file_) flag and give that the path to the `*.pem` file you downloaded earlier. The final argument to `ssh` is the username and address you want to connect to. In this case the user on the Amazon Linux system is `ec2-user` and the address is the IP address you just copied:

```shell
ssh -i ~/.ssh/<filename>.pem ec2-user@<ip-address>
```

The `*.pem` file you downloaded is the private half of an SSH key pair. The public half is stored on the EC2 instance and that is how you identify yourself as the `ec2-user` on that system. You will be prompted to type `yes` to confirm that you want to connect to the address you've given because `ssh` doesn't recognise it. Once you've done that you will see a message reading `Amazon Linux 2 AMI` with the URL <https://aws.amazon.com/amazon-linux-2/> and a terminal prompt which looks like:

```shell
[ec2-user@ip-172-31-xx-xxx ~]$
```

You are now connected to your EC2 instance via SSH. Next you will make the connection more secure.

### Securing the connection

Type `exit` or press `Ctrl-d` to disconnect from the instance and then go back to the AWS console in your browser. In the _Description_ tab for your EC2 instance find the name of the security group assigned to it - `launch-wizard-1` - and click on it. You'll be taken to a similar looking table, filtered by the ID of the group you just clicked on, with the details of the group in the bottom part of the page. Click on the tab _Inbound_ and you will see the rules for this security group - the _Type_ is `SSH`, _Protocol_ is `TCP`, port is `22` and the source is `0.0.0.0/0`.

Although you have to have the private part of the SSH key pair to be able to access the instance, having `0.0.0.0/0` as the source for connections is regarded as quite insecure. In this example, and very often in real scenarios, you are the only person who will connect to the instance so you can limit the source to your current IP address.

First click the _Edit_ button in the _Inbound_ tab of the security group - a modal pop-up will appear with the title _Edit inbound rules_. Click the `X` in a cirle on the right side, next to the existing SSH rule and click _Save_. The table will now say that: _This security group has no rules_. Go back to your terminal and run the `ssh` command again - you will see it doing nothing but sit there until it times out, then you will see a message like: `ssh: connect to host <ip-address> port 22: Operation timed out`. The security group no longer allows any traffic to reach the instance.

Click the _Edit_ button again and in the _Type_ column select `SSH` - the _Protocol_ and _Port_ will automatically be populated with `TCP` and `22`, respectively. Under _Source_ select `My IP` and the following field will automatically be populated with your IP address - AWS has determined what it is for you. (If you ever need to look it up yourself then you can type _what is my ip address?_ into most popular Internet search engines). Click _Save_ and then go back to your terminal and run your `ssh` command again to connect to the instance. Time time you will see that you connect successfully.

### Serving content from EC2

Now you have an EC2 instance running and you can do anything you like with it. Packages on Red Hat based Linux systems are managed via the `yum` command so you can install a web server and serve some content from your virtual server. Yum is a package manager for Linux in the same way that `brew` can manage packages on OSX or `npm` can manage packages for a Javascript application. In the following example you will install the [Nginx](https://nginx.org) web server and via some HTML in your browser, served from your EC2 instance.

Firstly enable the Nginx Yum repository on the machine - Yum pulls down all of its packages from remote locations but it needs to know about them first; Amazon Linux has a number of [extra repositories](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-ami-basics.html#extras-library) available but they are not all enabled by default. Run the following command to enable the Nginx repo - the command writes content into a protected part of the filesystem so you need to use the `sudo` command to assume the permissions of the `root` user to be able to do that:

```shell
sudo amazon-linux-extras enable nginx1.12
```

Now you can install the `nginx` package using the `yum` tool:

```shell
sudo yum install nginx
```

You will see lots of output from `yum` as it finds the `nginx` package and then works out what dependent packages also need to be installed. It will then present you with a list of what will be installed and you will need to type `y` and press `Enter` - to avoid being prompted by `yum` you can pass it the `-y` flag when you run it.

The `nginx` package is now installed but the web server itself is not running. Processes on Linux which run in the background are referred to as _daemons_ and on Amazon Linux they are managed by a tool called [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/). Use the `systemctl` tool to manage the `nginx` process - start it by running the following command:

```shell
sudo systemctl start nginx
```

You can check the status of the service with the `status` command to `systemctl`:

```shell
sudo systemctl status nginx
```

The `nginx` process is now running and listening on port `80`, the standard HTTP port. Test it by using the `curl` command to access the web server locally on the instance - the following command will show the HTML from the Nginx welcome page in your terminal:

```shell
curl localhost
```

Now try taking the IP address of your EC2 instance and putting it into the address bar of your browser. Like the `ssh` command earlier your browser will eventually time out trying to connect to the IP address. This is because the security group for the instance only allows traffic on port `22` and HTTP uses port `80`. You need to add another rule to the security group.

Go back to the AWS console and to the page with the `launch-wizard-1` security group on it. Under the _Inbound_ tab click the _Edit_ button and in the modal pop-up click the _Add Rule_ button. This time select `HTTP` for the type and again _Protocol_ and _Port_ will be filled in for you - `TCP` and `80`. You will also notice that the _Source_ has been filled in too, with `0.0.0.0/0` listed; it's not unreasonable to assume that HTTP content should be available to everyone. Click _Save_ and then go back to your browser and try to access the IP address of the instance again. You will see a welcome page with the message, _Welcome to nginx on Amazon Linux!_

To serve your own content you can put it under the path `/usr/share/nginx/html/` on the instance. Create a simple HTML file on your local machine, for example by running this command in your terminal:

```shell
echo '<h1>Hello!</h1>' > hello.html
```

Now use the `scp` command to copy that file from your local machine up to the EC2 instance. The `scp` command securely copies files to and from remote servers and it will use the same `*.pem` file that you passed to the `ssh` command. You will also pass a source - `hello.html` - and a destination - the same username and address that you used for the `ssh` command:

```shell
scp -i ~/.ssh/<filename>.pem hello.html ec2-user@<ip-address>:
```

The final `:` on the address tells `scp` to copy the file to the home directory of the user making the connection - `ec2-user` in this case. You can't copy the file directly to `/usr/share/nginx/html/` because that path is owned by the `root` user and `ec2-user` only has permission to read from it, not write to it. Once you have copied the file via `scp`, connect to the instance again using the same `ssh` command, then use `sudo` to assume the `root` user's permissions to copy the file to the right place:

```shell
sudo cp hello.html /usr/share/nginx/html/
```

Now when you go to the IP address of the instance in your browser and append `/hello.html` to the URL you will see the content you copied to the server.

### Shut down the instance

Finally, now that you have finished with the instance you should terminate it so that it doesn't incur any charges in your AWS account. Select the instance from the list in the EC2 dashboard and then click the _Actions_ button. From _Instance State_ click _Terminate_ and confirm the action when you are prompted. You will see the instance status change to indicate that it is shutting down before it is finally terminated.

## Storage - S3

S3, or Simple Storage Service as it is never referred to, is one of the earliest AWS services and offers object storage. In S3 you can store your data under a key and retrieve it again. The details of how it works under the hood are not public but it is highly durable and highly available and your data is distributed across a number of different places to make it safe and always available.

S3 stores data in storage containers it calls _buckets_. Objects are stored in buckets under keys. The hierarchy of keys in S3 buckets is flat - all key are at the same level - but keys often contain `/` characters so a hierarchy a bit like a filesystem can be inferred.

For example, in the `secret-data` bucket there could be the keys `dave/salary.txt`, `dave/pension.txt` and `dave/debts.txt`. There is no folder `dave/` in the bucket but it is common to organise keys in that way and indeed the AWS console displays 'folders' in the S3 UI.

S3 is a very useful general storage service. It is widely used for: storing uploaded files from users, collecting log files from servers, storing media files before and after processing, serving static assets like Javascript, CSS and images for web pages. S3 can even be used to host static web sites.

### Creating a bucket via the console

In this example you will create an S3 bucket via the AWS console.

While logged into the AWS console, navigate to the S3 dashboard. You will see a button labelled _Create bucket_ - click it. You'll be presented with a pop-up titled _Create bucket_ and the first thing to enter is the name of the bucket.

S3 bucket names must be DNS-compliant. That is, it must be possible to use them in a DNS host name e.g. `my-bucket.amazonaws.com`. The name must be at least 3 characters long, not more than 63 and it must be globally unique - no two buckets in S3 can have the same name. Enter a name for your bucket but try to choose something which is not likely to exist already.

The next choice to make is the region the bucket is to be created in. S3 is one area of the AWS console which isn't region specific - you can see all buckets globally, across all regions. In the EC2 console you can only see instances in the region you've chosen in the top right of the console screen. Choose _EU (Ireland)_ here - it's not possible to change the region after the bucket has been created. You should generally choose to create buckets in a region that is as close to your users as possible to reduce the time it takes to transfer data to and from it.

Now you can click _Create_ in the bottom left corner of the pop-up. You will see your bucket appear in the list.

Click on the name of the bucket in the list and information about it will appear on the right of the page. There are different properties, permissions and there is a section for management actions. Click on where it says _Permissions and you'll be taken to a page to manage access to the bucket. By default public access to the bucket is blocked so clients must be authenticated with AWS to be able to access data in the bucket - you will see where it says \_Block all public access - On_. This is a good default - there have been multiple stories in the news of S3 buckets being left publicly open with sensitive data available.

Accessing data in S3 buckets is quite fast but creating and deleting buckets can be very slow. S3 bucket names are generally not available to be reused for quite a long time after they've been deleted - up to several hours - don't rely on specific bucket names or naming conventions.

### Uploading a file via the CLI

It is possible to upload files via the S3 console or by using the API via the AWS CLI tool or one of the [SDKs](https://aws.amazon.com/tools/#SDKs). In this example you are going to retrieve some API keys from the console and then use the AWS CLI to upload some data to S3.

In the top right of the web console, where you see your login information, click to see the sub-menu and then choose _My Security Credentials_. This takes you to your user details in the _Identity and Access Management_ (_IAM_) service - access to all resources is controlled via _IAM_ and it is central to security on AWS.

Find the title that reads _Access keys for CLI, SDK, & API access_ and click the _Create access key_ button. This is the only opportunity you have to download the secret key so store it carefully. You can pass the credentials to the AWS CLI as environment variable or in a config file, which is what this example will use. Put the values into the file `~/.aws/credentials` with this content:

```config
[default]
aws_access_key_id=<Access key ID>
aws_secret_access_key=<Secret access key>
```

You can create a maximum of 2 sets of API keys for your user. Before you delete and old one you can make it inactive to verify that it is not in use. If it is then it is trivial to reactivate it - you can't recover a deleted key.

With the credentials in the right place you can now use the AWS CLI to list the buckets in your account. Run the following command and you will see the bucket that you created through the console:

```shell
aws s3 ls
```

Now you will upload a file to the S3 bucket. This command will generate a file of random text:

```shell
LANG=C tr -dc [:alnum:] < /dev/urandom | fold -w 64 | head -500 > random.txt
```

The following command copies the file, `random.txt`, from your local path to the S3 bucket - the bucket needs to be addressed as an S3 URI i.e. starting with `s3://`, to work with the CLI tool. The final `/` on the destination means that the CLI will upload the file to a matching name in the bucket, `random.txt` in this case.

```shell
aws s3 cp random.txt s3://<name of your bucket>/
```

You can add more parts to the destination key and as long as they end with a `/` then the filename will be appended:

```shell
$ aws s3 cp random.txt s3://<name of your bucket>/foo/bar/hello/world/
upload: ./random.txt to s3://<name of your bucket>/foo/bar/hello/world/random.txt
```

Using a key without a final `/` will result in the filename not being matched:

```shell
$ aws s3 cp random.txt s3://<name of your bucket>/not-random-at-all.txt
upload: ./random.txt to s3://<name of your bucket>/not-random-at-all.txt
```

When you list the contents of the bucket you will see the files you have uploaded:

```shell
$ aws s3 ls s3://<name of your bucket>/
                           PRE foo/
2019-09-18 00:40:59      32500 not-random-at-all.txt
2019-09-18 00:36:56      32500 random.txt
```

The `PRE` label indicates that this is part of a key and not a full key pointing to a stored object. To list all objects and ignore the inferred hierarchy you can pass the `--recursive` flag:

```shell
$ aws s3 ls --recursive s3://<name of your bucket>/
2019-09-18 00:38:28      32500 foo/bar/hello/world/random.txt
2019-09-18 00:40:59      32500 not-random-at-all.txt
2019-09-18 00:36:56      32500 random.txt
```

S3 supports copying objects to different keys in different buckets. The source and destination for the `cp` command can both be in S3 and can be different buckets. You can create a new bucket with the `mb` command and test it out:

```shell
aws s3 mb s3://<name of another bucket of yours>/
aws s3 cp s3://<name of your bucket>/random.txt s3://<name of another bucket of yours>/copied.txt
```

The destination for `cp` can also be local to allow you to download files from a bucket - using a directory for the destination means the filename is used:

```shell
$ aws s3 cp s3://<name of another bucket of yours>/copied.txt .
download: s3://<name of another bucket of yours>/copied.txt to ./copied.txt
```

The destination can be standard out, represented by a `-`:

```shell
aws s3 cp s3://<name of another bucket of yours>/copied.txt -
```

## Compute - Lambda

AWS Lambda is a service that lets you run short pieces of code, called _functions_, in response to different triggers: events from other AWS services such as file uploads to the S3 storage service or scheduled events at specific times from the CloudWatch service. You can also use Lambda functions to power Alexa Skills. Lambda is sometimes referred to as _Functions as a Service_ because the code is small and does one specific task, much like a function would do in one of your code bases.

In this example you will create a simple Lambda function and trigger it manually through the AWS console.

In your AWS console navigate to the Lambda dashboard and click the button reading _Create function_. The next page will present you with options to either: _Author from scratch_, _Use a blueprint_ or _Browse serverless app repository_. AWS provides a number of blueprints that you can search through, choose and adapt to your use case. Similarly, there is a repository of published Lambda functions which you can choose to deploy to your account. For this example choose _Author from scratch_, enter _superDuperFun_ for the _Function name_, choose _Node.js 12.x_ for the _Runtime_ and then click _Create function_.

You'll be taken to a page with information about your newly created function. The top part of the screen contains a panel titled _Designer_ and has a box for _superDuperFun_ with a line to _Amazon CloudWatch Logs_. CloudWatch Logs is a log aggregation service and these two connected boxes show that this Lambda function will send its logs to the CloudWatch Logs service so that they can be searched. When AWS created your Lambda function it created an IAM _role_ with permitted actions that the Lambda can perform. The Lambda has permissions to send its logs to a log group called `/aws/lambda/superDuperFun`.

In the _Designer_ panel click the box _superDuperFun_ and further down the page you'll see a panel titled _Function code_. This allows you to change the code that Lambda will run for your function - at the moment it contains a very simple Javascript function. The _Code entry type_ list lets you select: _Edit code inline_, where you edit the code in the box where you can see it; _Upload a .zip file_, where you can select from your local machine a `*.zip` file containing code; _Upload a file from Amazon S3_, where you supply a link to a `*.zip` file in an S3 bucket.

Further down there are other settings for the Lambda function such as environment variables that can be set in the console and accessed from the code at run time, allowing you to configure the code. There is a panel titled _Execution role_ which has a link to the IAM area of the console and to the role created by AWS for your Lambda function. There are also _Basic settings_ for the Lambda which include the amount of memory it is allowed to use and how long it can run for before it is terminated for taking too long to complete.

After creation the Lambda function is ready to run and that can be done via the _Test_ button at the top of the page. Click the _Test_ button and you'll be presented with a pop-up titled _Configure test event_. In the list under _Event template_ there are lots of template events to choose from which show you how wide the range of triggers available for Lambda function is. Select the _Hello World_ template, name the event _superDuperTest_ and click _Create_ to accept the template text already there. Now click the _Test_ button again and your Lambda function will be run.

You will see a green box at the top of the screen with the message _Execution result: succeeded_ and a link to the logs, in CloudWatch Logs. You can click to expand the _Details_ and that will show you what was returned from the function plus how long it ran for and how much memory it used. Click on the _logs_ link and you'll be taken to the [log group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) in CloudWatch Logs and it will contain a [log stream](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html). Click on the log stream and you'll see the output from that Lambda execution. There's nothing from the code itself but the Lambda service gives you a `START`, `END` and `REPORT` message. Each exection of a Lambda function has a unique ID and that is present in each message so that you can see which message refers to which execution if there are a lot of them happening in parallel.

### Responding to events

In the _Function code_ panel edit the `index.js` file and inside the function, under the line `// TODO implement`, log the `event` parameter that is passed into the function. Call `JSON.stringify` on it to make sure that you can definitely read it (not strictly necessary here):

```javascript
console.log(JSON.stringify(event));
```

Now click _Save_ in the top right corner of the page and then _Test_ again and take a look at the logs. You will see that the line after `START` now has the contents from the _superDuperTest_ event that you created.

You know now how to run your Lambda code so next take a look at an event that is more like something you would actually receive from an AWS service.

Next to the _Test_ button click the `superDuperTest` event name and select _Configure test events_ from the drop-down menu which appears. You will get the same pop-up - _Configure test event_ - and, with _Create new test event_ selected, click _Event template_ and choose _Amazon S3 Put_. You will see that the event you get has a lot more information that the first one you created. The top level key is called `"Records"` and the value of that is an array. The array has one element - an object - and that has a number of pieces of information about the event: source, name, time etc. There is a key called `"s3"` with information about the object that has been uploaded and the bucket it has been uploaded to. Press `Esc` to cancel creating this event.

In this example you will modify your Lambda function to be triggered each time a file is uploaded to your S3 bucket. Your code will log the S3 bucket name and the key of the object uploaded. It will use the S3 API to find the content type of the uploaded object.

In the _Function code_ panel, edit the `index.js` file and import the [AWS SDK](https://aws.amazon.com/sdk-for-node-js/) (available in the Lambda environment) and instantiate the [S3 client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html):

```javascript
const aws = require("aws-sdk");

const s3 = new aws.S3({ apiVersion: "2006-03-01" });
```

In your function, underneath where you log the event, extract the bucket and key from the event - any spaces in the key name will have been replaced by `+` characters, so put them back, and it will have been encoded to handle any non-ascii characters, so decode it:

```javascript
const bucket = event.Records[0].s3.bucket.name;
const key = decodeURIComponent(
  event.Records[0].s3.object.key.replace(/\+/g, " ")
);
```

To get the content type from the object in the bucket you can use the [`HEAD` action on the key](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectHEAD.html) which returns the metadata about the object but not the object itself. The JS SDK has an equivalent method - [`headObject`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property). Call that and extract the `ContentType` key from the response:

```javascript
let params = {
  Bucket: bucket,
  Key: key,
};

let { ContentType } = await s3.headObject(params).promise();
```

Finally, log a message to show what you found:

```javascript
console.info("ContentType: %s for %s/%s", ContentType, bucket, key);
```

Delete the lines creating and returning the `response` variable - you don't need those any more. Click the _Save_ button.

Next you need to add a trigger to the Lambda so that it is run whenever a file is uploaded to an S3 bucket. Click the button _+ Add trigger_ in the _Designer_ panel and select _S3_. You'll then be prompted to select an S3 bucket so choose the one you created for the earlier example. Leave the _Event type_ as _All object create events_ and don't filter by prefix or suffix - click _Add_. You'll now see another box - _S3_ - in the _Designer_ panel with a line linking it to `superDuperFun`.

### Update IAM for function

In this example you need to grant your Lambda function permission to perform an action via the S3 API on the objects in the S3 bucket. This is done by adding a _statement_ to an IAM _policy_. A policy is a list of rules that can be attached to a user, group or role. In this case the Lambda function has an IAM role associated with it and it is the policy on that role that you will edit.

Finally you need to update the IAM role for the Lambda function to grant it permission to get the objects in the S3 bucket. In the _Execution role_ panel click the link to _View the superDuperFun-role-xxxxxxxx role on the IAM console._ You will be taken to the page for the IAM role and under the _Permissions_ tab you'll see that it has an existing policy - _Permissions policies (1 policy applied)_. Click _Edit policy_ and click to view the JSON rather than use the _Visual editor_.

The existing policy document will look something like this and this grants permissions to create resources in CloudWatch Logs and to send data to them:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "logs:CreateLogGroup",
      "Resource": "arn:aws:logs:eu-west-1:111111111111:*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": [
        "arn:aws:logs:eu-west-1:111111111111:log-group:/aws/lambda/superDuperFun:*"
      ]
    }
  ]
}
```

In the `"Statement"` of the policy, which is an array, you can see two elements: one says to `"Allow"` the action `CreateLogGroup` on a resource (the AWS account) and the other allows the actions `"CreateLogStream"` and `"PutLogEvents"` on the specific log group for this Lambda function.

To allow access to the objects in the S3 bucket you need to add a third element to the `"Statement"` - it needs to allow the `GetObject` action for S3 on the specific bucket - the bucket is specified with its Amazon Resource Name, or ARN, and that can be [inferred from the bucket name and the keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/s3-arn-format.html) you want to access (`*`):

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::<name of your bucket>/*"
}
```

Click the _Review policy_ button at the bottom of the page after adding that to the `"Statement"` and then click _Save changes_.

It is possible to grant avoid using the S3 ARN and just put `"*"` for the `"Resource"` in the policy. Likewise you can just grant all S3 actions with `s3:*` as the `"Action"` but this gives the Lambda much more power than it needs to have. It is very good practice to grant the least amount of permission that you can in case the code is ever compromised or a bug in your logic destroys data without meaning to - if you don't give it permission to delete anything then it can't happen in error.

Now upload a file to the S3 bucket and view the logs for your Lambda function - you will see that the content type of the uploaded file has been fetched.
