# Infrastructure as code

## Prior knowledge

- creating resources in AWS via web console and CLI
- general programming

## Prerequisites

- an AWS account and credentials to call the API
- the [Terraform](https://www.terraform.io/downloads.html) command line tool installed

## Leaning objectives

- write a template to create virtual infrastructure resources via the CloudFormation service in AWS
- use template parameters to aid reuse of CloudFormation templates
- write code for Terraform to create resources in AWS
- run `terraform plan` and `terraform apply` and demonstrate the declarative nature of the tool
- use parameters to make Terraform code reusable

## What infrastructure as code is

Creating infrastructure via the AWS console is very convenient and it is a great way to quickly get up and running with one or more services, guided by AWS and accepting the defaults they present you with. This is fine for learning about services or for small scale projects but when you start to reach a scale beyond running one EC2 or RDS instance then using the console leads to a lot of repetitive, manual steps. The problem with following these steps is that humans are bad at manual, repetitive work - as the number of steps grows the chances of making a mistake increase. The chances will be even higher if another person has to perform the same steps: do you tell them and have them remember, do you write it down and be sure to include enough detail that the chances of mistakes are minimised? Cloud infrastructure can be very complex so the less you have to do manually the better.

All of the major cloud providers expose an API through which the resources in your account can be managed and while you can write code yourself to use that API directly and create or update your resources there are a number of tools that can help you to do it without so much work.

A lot of cloud providers have their own services to manage the resources they provide: Google has the Cloud Deployment Manager, Azure has the Resource Manager and AWS has CloudFormation. There are also independent tools that can manage resources in multiple cloud providers. In this lesson you will learn about CloudFormation for AWS and Terraform, which can manage resources in many different providers.

Code that is used to drive infrastructure documents to anyone who can read the code exactly what resources were created and how they are configured. The code can (and should) be checked into version control so that a full history of changes is preserved.

## CloudFormation

CloudFormation is a service from AWS and is available in your AWS account. You interact with CloudFormation by giving it a template containing the resources you want to create, the configuration for each resource and any links between them. Templates can be written in either JSON or YAML syntax.

A CloudFormation template contains a list of AWS resources, such as EC2 instances or S3 buckets, that you want to be created for you. The code is _declarative_ which means that you express the state you want your infrastructure to be in and trust that CloudFormation knows the steps required to get there. A _declarative_ piece of information in another context would be a shopping list - you describe the items you want but not the steps to get them (go to a particular shop, go to aisle 4 etc).

### A simple CloudFormation template

For this example you will write a simple CloudFormation template, upload the template to CloudFormation and let it create the resources for you.

Start off by creating a new file in your workspace called `s3_bucket.yml`. This template will contain a single resource, an S3 bucket. CloudFormation templates have a number of top-level keys but only one is required - `Resources`. The `Resources` key then contains a mapping of identifiers of your choice to declarations of resources to be created. Each resource must have a `Type` key to indicate what AWS service should handle this and what resource it should create. The `Properties` key can be used to configure the resource but in this case you will accept the defaults for the S3 bucket resource - this keeps the template simple for the example.

The contents of `s3_bucket.yml` should be:

```yaml
Resources:
  ExampleBucket:
    Type: AWS::S3::Bucket
```

The top-level `Resources` key contains the key for one resource - an S3 bucket. The identifier has been chosen as `ExampleBucket`, but this could be anything that you choose, providing it conforms to the requirements of being alphanumeric and unique within the template. The only part of the resource specified here is the `Type` - this is mandatory for all resources and is all that is required by the S3 bucket resource.

### Creating a stack from the template

Your template can now be used to create a _stack_ within the CloudFormation service. A stack is a collection of resources managed by CloudFormation and specified in a template. The same template can be used to create multiple stacks, so the relationship of template to stack could be analogous to that of a class to an object in an object-oriented language or an image to a container when working with Docker.

Log into the AWS console and navigate to the CloudFormation section. You will see that you have no existing stacks in the account and there is a _Create stack_ button, which you will click. On the next page you are presented with options for using sample templates or creating one in a template designer - you should select _Template is ready_ as you have already prepared a template. In the section underneath, select _Upload a template file_ and then use the _Choose file_ button to upload the template from your local workspace.

After uploading your template you have the option to _View in Designer_ to see it in the AWS template designer. This is a tool that allows you to drag resources from a list of available ones onto a grid and then connect them up and configure them. It is a powerful tool and can be convenient but you won't use it in these examples. The tool adds extra pieces of information to the templates which will make them more complex when viewed outside the designer and you will gain a better understanding of how the templates work by writing them by hand. Once you have grasped that then you might like to explore the GUI designer.

Once you have uploaded your template click the _Next_ button and on the following page you will be asked to enter a name for the stack - use `example`. The console will tell you that there are no parameters so click the _Next_ button. The following page is all optional so skip to the bottom and click _Next_ to review and then click _Create stack_ at the bottom of the page.

You will be taken back to the list of stacks and will see your `example` stack with the status `CREATE_IN_PROGRESS`. Refresh the _Events_ for the stack and you will see the `ExampleBucket` creation being initiated and eventually it will complete and the stack will have the status `CREATE_COMPLETE`. Under _Resources_ you will see the S3 bucket with a link to it in the S3 part of the console. CloudFormation has named the bucket for you so it will have a random ID as part of its name.

### Adding a parameter

Your template can be used to create different stacks but it gives no control over the name of the bucket that gets created. As well as `Resources` CloudFormation templates can define `Parameters` which are inputs to the stack and the values of them can be used by the resources.

In this example you will modify your template to add a parameter and then you will update your stack with the altered template, passing a value for the parameter, and see the effect.

In your `s3_bucket.yml` file add another top-level key called `Parameters`. Like `Resources`, `Parameters` then contains a mapping of parameter identifiers to parameter definitions. The only required piece of configuration for a parameter is `Type` and in this case that will be `String`.

The lines to add to your template will look like this:

```yaml
Parameters:
  MyBucketName:
    Type: String
```

You will then need to reference that parameter in the S3 bucket resource. Parameters are referred to with the `Ref` function and the value of the parameter should be passed to the `BucketName` property of the bucket resource. The `Resources` section of the template will now look as follows:

```yaml
Resources:
  ExampleBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref MyBucketName
```

Save the changes to the file and in the AWS console click _Update_ on the page for your `example` stack. On the following page select _Replace current template_, upload the file again and then click _Next_. The following page lists the `BucketName` parameter from your template and gives you a box to enter the name into. The names of S3 buckets have to be globally unique, because they're used in DNS hostnames like `https://myawsbucket.s3.amazonaws.com`, so enter something here that will be unlikely to clash with anything that already exists. Again, click _Next_, skip to the bottom of the following page, click _Next_ to review and then click _Update stack_.

You will be directed back to the page for the `example` stack and the events will show that a new S3 bucket resource has to be created in order to change the name. Once that has been created then the old one will be deleted and then the stack will have the status `UPDATE_COMPLETE`. The _Resources_ tab will link to the newly created S3 bucket.

### Resource references

When declaring resources in code it is often necessary to create links between related resources. For example, if you create an EC2 instance and a security group then it might be necessary to assign that security group to the instance. Another very common use case is to create resources in the IAM service to grant access to resources that have been created.

In this example you will add an IAM group, with a policy granting access to the S3 bucket, to your template. An IAM group is a way to assign collective permissions to users and an IAM policy is a list of permissions that can be performed on different AWS services.

In the `s3_bucket.yml` file first add an IAM group under the S3 bucket resource:

```yaml
BucketAccessGroup:
  Type: AWS::IAM::Group
```

Below the IAM group add an IAM policy. This policy will refer to both the IAM group and the S3 bucket to which it grants access:

```yaml
BucketAccessPolicy:
  Type: AWS::IAM::Policy
  Properties:
    PolicyName: BucketAccessPolicy
    PolicyDocument:
      Version: 2012-10-17
      Statement:
        - Effect: Allow
          Action: 's3:*'
          Resource:
            - !GetAtt ExampleBucket.Arn
            - !Join ['/', [!GetAtt ExampleBucket.Arn, '*']]
    Groups:
      - !Ref BucketAccessGroup
```

The IAM policy has a list of `Groups` to which it is assigned and this uses the `Ref` function to get the name of the group that was created - note that you didn't give it a name so CloudFormation has created one for you.

In the `PolicyDocument` there is a single statement that `Allow`s all actions on the S3 service - `s3:*` - for the S3 bucket created in the document. The actions in S3 can refer to both the bucket and the objects within it so the list of `Resources` these actions are allowed on has to contain the identifier for the bucket itself - its ARN - and an identifier for the objects to which you want this to apply (all of them), which is the bucket ARN followed by a slash and then a star to mean 'all' - `/*`. To join the bucket ARN to the rest of this you have used the `Join` function which takes a delimiter - `/` - and then a list of items to join with that delimiter - the bucket ARN and the `*` character, giving `bucket-arn/*`.

Go through the steps to perform another stack update, uploading the template again from your machine. On the final page you will need to acknowledge that the stack will create IAM resources - tick the box reading _I acknowledge that AWS CloudFormation might create IAM resources._

Once the stack has updated there will be an IAM group created any users put into that group will have full access to the S3 bucket created by the stack. This is not that interesting at the moment but it illustrates how CloudFormation works. You will do something with these later that will feel more practical.

### Deleting the stack

Using CloudFormation makes it very simple to clean up all of the resources that you have created using it. When you used the web console to create resources in AWS there were a number of other resources created when, for example, you created an EC2 instance, like network security groups. It is very helpful of the console to do this for you but it means that these can easily be left behind when you delete the EC2 instance.

When you write a CloudFormation template you have to do more work yourself to specify all of the resources you want, how they are configured and how they are connected. The benefit is that every time you use that template it will do the same thing. Plus, when you delete it everything is removed.

Select the stack, click the _Delete_ button and confirm the action. You can follow the events as each of the resources in the stack is removed, then the stack itself is marked as `DELETE_COMPLETE`.

## Terraform

Terraform is an open source tool from a company called Hashicorp. It, like CloudFormation, is a declarative tool that allows you to specify the infrastructure you want as code. It differs from CloudFormation in that it is a command line tool rather than a service - all the API calls to create resources will come from where you run it. Terraform can create resources on AWS but it also supports other cloud infrastructure providers like Microsoft Azure, Google Cloud, Cloudflare, Fastly and GitHub - about 120 providers are officially supported. Terraform's code is declarative but it uses its own code format - Hashicorp Configuration Language, or HCL - rather than JSON or YAML. The syntax isn't vastly different from JSON and looks a bit like the config format for Nginx, if you have ever used that. The tool is very widely used although it hasn't yet reached a stable 1.0 version yet. At the time of writing, this lesson uses Terraform 0.12.16.

### A simple Terraform example

Terraform templates also contain the resources that you want to create and can optionally contain variables that can be passed in when you run the tool.

Resources are declared with a `resource` block and that is followed by an identifier, enclosed in quotes (`""`), for the type of resources you want to create then a name to refer to that resource within the Terraform code. The body of the resource is enclosed in braces - `{}` and that section contains any configuration parameters that the particular resources might require.

A variable is declared with a `variable` block and has an identifier enclosed in quotes. The body of the declaration, within braces, can have a `type`, a `default` and a `description`. All of these are optional and the `type` will default to `string`, but it can be `number`, `bool` or  one of the more complex types like `map` or `list`.

For this example you will recreate the same infrastructure from your CloudFormation template - an S3 bucket, IAM policy and IAM group - but using Terraform.

First, in a new directory open a file in your editor called `main.tf`. The `*.tf` extension is one that Terraform looks for. Into this file add the resource declaration for an S3 bucket:

```hcl
resource "aws_s3_bucket" "example" {}
```

This is now the minimal S3 bucket example that you had in your first CloudFormation template. You can run the `terraform` tool to create a bucket using this code.

In your terminal change to the directory containing the `main.tf` file and run the following command to get Terraform to set itself up:

```shell
terraform init
```

This will look at the resources in your code, work out what provider plugins are required and then download them and cache them locally. The provider plugins are the part of Terraform that know how to talk to the different cloud providers. There are too many to distribute all of the plugins with the core of Terraform so they are distributed separately and downloaded when they are required. Once the command has run you will see that you have a `.terraform/` directory alongside the `main.tf` file and that contains the AWS plugin. Now you can ask Terraform to create the infrastructure for you. To see what will happen run the `plan` command:

```shell
terraform plan
```

_Aside: if terraform prompts you for a `region` argument then you might not have one set in your config or environment variables - you can fix that quickly by running the following in your terminal: `export AWS_DEFAULT_REGION=eu-west-1`_

The `plan` command will first parse the code in your `main.tf` file and find all of the resources you have requested. It will see that it has no record of creating any resources before and it will tell you that it will create an S3 bucket. The plan output will list the resources that Terraform will affect, with symbols like `+`, `-` or `~` next to them, indicating whether they will be added. removed or altered, respectively.

To create the bucket for real, run the `apply` command - you will need to type `yes` when it prompts you to confirm:

```shell
terraform apply
```

The first part of the output is exactly as the `plan` was because Terraform has run its plan stage again - it is possible to skip this and you will see that later on. After you have confirmed you want to proceed you will see the list of resources being created and at some point in the output you will see the name of the bucket, listed as the `id` in a line like this:

```plain
aws_s3_bucket.example: Creation complete after 4s [id=terraform-20191214215606801400000001]
```

You can find the bucket in your AWS console or by running `aws s3 ls` in the terminal.

### Terraform state

When Terraform has successfully created the resources you requested in your code it will persist the details into a file called `terraform.tfstate` in the local directory. The next time you run `terraform` it will look again at your `main.tf` file and work out what you have requested, then it will consult its state file to see what it already knows about. The state file will contain the ID of the resource in AWS, so `terraform` will use the AWS API to check that the resource still exists and is in the desired state.

It is possible to configure Terraform to store its state in another location than the local directory. This is particularly useful if you are working with a team and all need to have access to the state. You won't configure Terraform to use remote state in this lesson but Terraform does support things like S3, Google Cloud Storage and a service from Hashicorp called Terraform Cloud for using Terraform collaboratively in a team.

When you run the `plan` command for a second time, `terraform` will do all of those steps and will report back to you that nothing needs to be done to put your infrastructure in the state you requested in your code.

### Variables

Instead of letting Terraform choose a bucket name for you, you will add a variable so that you can pass in the name of the bucket as a parameter when you run `terraform`.

In the `main.tf` file add a `variable` block to declare a variable called `bucket_name`:

```hcl
variable "bucket_name" {}
```

Now update the declaration of the bucket resource to use that variable:

```hcl
resource "aws_s3_bucket" "example" {
  bucket = var.bucket_name
}
```

Run the `plan` command again and `terraform` will prompt you to enter a value for `bucket_name` - enter a name for the bucket, remembering the globally unique constraint on bucket names. Terraform will parse your code and see that you want to end up with an S3 bucket with the name you just entered, it will consult its state and see that there is an existing bucket with a different name, then it will check AWS to see that that exists, then it will work out the steps it needs to take to get from what exists to what you have requested and will present that in the plan output - in this case it requires deleting one bucket and creating a new one.

Instead of typing in values when prompted you can also pass the value to `terraform` via the `-var` flag or put it in a file that you then passed to `terraform` with the `-var-file` flag. Create a JSON file called `variables.json` in the same directory and put your `bucket_name` variable into there:

```json
{
  "bucket_name": "my-lovely-bucket-name-that-wont-clash"
}
```

Now run the `plan` command again, but this time pass the file you just created as a `-var-file` but also pass the `-out` flag with a filename to save the plan to:

```shell
terraform plan -var-file variables.json -out s3_bucket.plan
```

The plan file is a binary file that `terraform` can read and contains the steps that have been determined need to be taken to reach the desired state. Apply the changes by running the following command:

```shell
terraform apply s3_bucket.plan
```

Terraform will show that it is destroying the old bucket and creating the new one - your AWS account will show you that the changes have been made.

### Terraform resource references

In the CloudFormation template you were able to create different resources and make references to them where they need to be linked together. Terraform has a similar mechanism so now add the IAM group and policy to your Terraform code.

First, add the IAM group that allows access to the S3 bucket - Terraform requires you to specify a name for this, whereas CloudFormation created one for you:

```hcl
resource "aws_iam_group" "s3_bucket_access" {
  name = "s3-bucket-access"
}
```

Next, add the IAM policy that you defined for the CloudFormation template - this refers the `arn` of the `aws_s3_bucket` resource:

```hcl
resource "aws_iam_policy" "policy" {
  name        = "BucketAccessPolicy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "${aws_s3_bucket.example.arn}",
        "${aws_s3_bucket.example.arn}/*"
      ]
    }
  ]
}
EOF
}
```

The Terraform syntax uses a different mechanism to refer to properties of resources and interpolate strings - the `${}` syntax, just like JavaScript. This is a little easier than using the `Join` function in CloudFormation.

The final piece here is to add the policy to the group. In CloudFormation it was simply a case of referring to the groups in the policy resource. Terraform does it differently, by defining another resource to join them both together - `aws_iam_group_policy_attachment`. Add this resource to your `main.tf` file:

```hcl
resource "aws_iam_group_policy_attachment" "s3_policy_attach" {
  group      = aws_iam_group.s3_bucket_access.name
  policy_arn = aws_iam_policy.policy.arn
}
```

This resource doesn't correspond to a real resource in AWS - it is simply a concept in Terraform to join the IAM policy and group together.

After adding these resources into your Terraform code run the `plan` command to see the changes that will be made:

```shell
terraform plan -var-file variables.json
```

You will see that the 3 resources you have just added to your `main.tf` file will be created by `terraform`. Now run `apply` to make the changes - because you haven't saved the plan using the `-out` flag you need to approve the plan that `terraform` will run again. To avoid having to type `yes` you can pass the `-auto-approve` flag:

```shell
terraform apply -auto-approve -var-file variables.json
```

### Removing/replacing resources

The example so far has created:

- an S3 bucket
- an IAM policy to access the bucket
- an IAM group with the policy attached to it

These have been useful to see how CloudFormation and Terraform work but the examples haven't used the resources themselves. In the next example you will remove some resources from your `main.tf` file and add some new ones. You will create an EC2 instance that has an IAM role attached to it allowing it to access the S3 bucket. The credentials to access the bucket are obtained automatically from the instance itself when you use the AWS SDKs. This means that you don't have to worry about manually managing credentials or rotating them as you never deal with them directly.

### Data sources

In this example you will use a [Terraform data source](https://www.terraform.io/docs/configuration/data-sources.html) to find the ID of the AMI to launch the instance from. This removes the need to look it up manually each time you run `terraform`. Data sources are another type of resource in Terraform but instead of creating something they just fetch some data that can be used elsewhere in the code.

Where a resource is declared with a `resource` block, a data source is declared with a `data` block. For example, this data source fetches the current AWS region you are using:

```hcls
data "aws_region" "current" {}
```

### Adding an EC2 instance with instance profile

Declare the resource for the EC2 instance and declare a data source to look up the Amazon Linux 2 AMI. The values used to filter the correct one are taken from the AWS documentation - the name of it is not the most obvious thing so remember where to find it in the documentation.

Declare the instance profile resource and a role and attach to the role the policy that you declared earlier, then pass the instance profile as one of the attributes on the EC2 instance resource. In IAM, users, groups and roles can have policies attached and roles are what can be _assumed_ by users and services. In this case the role is available to the EC2 instance.

You will need to get access to your EC2 instance so make sure you include your SSH key name in the attributes on the resource. Create a variable for it so that the code is general enough to be used by someone else.

To be able to access the instance via SSH the network security group must allow traffic on port 22. Add a security group resource with the correct rules and pass the name to the correct attribute on the instance resource, `security_groups`. The security group needs to be created in a VPC and you should use another data source to find the correct ID for the default VPC in your account.

_Note that the default VPC is treated differently to a VPC you might create yourself and the attribute `vpc_security_group_ids` is used instead in that case._

The additions to your `main.tf` file will look like this:

```hcl
variable "key_name" {}

data "aws_ami" "amazon_linux_2" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-2.0.????????.?-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["amazon"]
}

resource "aws_iam_instance_profile" "s3_access" {
  name = "s3_access"
  role = aws_iam_role.s3_access.name
}

resource "aws_iam_role" "s3_access" {
  name = "s3_access"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "s3_access_instance_role" {
  role       = aws_iam_role.s3_access.name
  policy_arn = aws_iam_policy.policy.arn
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = "0.0.0.0/0"
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "s3_access" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  key_name      = var.key_name

  security_groups = [aws_security_group.allow_ssh.name]

  iam_instance_profile = aws_iam_instance_profile.s3_access.name

  tags = {
    Name = "S3-access"
  }
}
```

If you run `plan` now you will see that the resources you have declared are due to be added - make sure you have added you `key_name` variable into `variables.json`:

```shell
terraform plan -var-file ./variables.json
```

### Removing the IAM group

You are granting the EC2 instance permission to access the S3 bucket so there is no need to keep the IAM group. Remove that and the `aws_iam_group_policy_attachment` resource from `main.tf`.

Now run `plan` and you will see that the new resources will be added and the ones you have removed from the code will be destroyed via the AWS API:

```shell
terraform plan -var-file ./variables.json
```

### Outputs

Terraform has the ability to return pieces of data which will be printed at the end of a successful `apply`. These are declared as `output` blocks and they are useful in this example for returning the public IP address of the EC2 instance so that you can connect to it.

Add the following to your `main.tf`:

```hcl
output "public_ip" {
  value = aws_instance.s3_access.public_ip
}
```

Now run the `apply` command, see the resources being created and get the public IP to connect to and test with the `aws` CLI that you can access the S3 bucket.

Connect to the instance:

```shell
ssh -i <path to pem file> ec2-user@<public IP address>
```

List the contents of the bucket (the `awscli` is already installed on the instance):

```shell
aws s3 ls s3://<name of your bucket>/
```

It is not possible to list _all_ of the buckets in your account because the instance only has permissions granted on this particular bucket, so this command will fail:

```shell
aws s3 ls
```

### Destroying resources

You have seen that Terraform can destroy resources when you remove their definitions from your code. When you want to destroy all of the infrastructure that Terraform has created then you can use the `destroy` command.

In the same way as `apply`, the `destroy` command runs a plan first and shows you what it will do then asks for confirmation. The code that `terraform` parses has to be valid so you need to pass the same variables that you did when you created the infrastructure:

```shell
terraform destroy -var-file ./variables.json
```

The `plan` command can also be used to a plan destruction of the resources:

```shell
terraform plan -destroy -var-file ./variables.json
```

And, in the same was as `apply`, `destroy` accepts the `-auto-approve` flag to skip confirmation. Run this command to clean up your infrastructure and avoid being charged:

```shell
terraform destroy -var-file ./variables.json -auto-approve
```
