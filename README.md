# cdk-iam-policy-builder-helper-construct

The AWS CDK allows you to define your cloud infrastructure using familiar programming languages, and this project
leverages that! Here are some examples of how to use our Actions and Managed Policies helper properties through
TypeScript, Python, and Golang.

### TypeScript

The following is the TypeScript version:

```typescript
import { App, Stack, Effect } from 'aws-cdk-lib';
import { ManagedPolicy, Role, ServicePrincipal, PolicyDocument, PolicyStatement, } from 'aws-cdk-lib/aws-iam';
import { Actions, ManagedPolicies } from '../src';

const app = new App();
const stack = new Stack(app, 'MyStack');

// Create an IAM role using helper classes
new Role(stack, 'MyRole', {
    assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    managedPolicies: [
        ManagedPolicy.fromManagedPolicyArn(stack, 'ElastiCacheFullAccess', ManagedPolicies.AmazonElastiCacheFullAccess.Arn),
        ManagedPolicy.fromManagedPolicyArn(stack, 'FSxConsoleFullAccess', ManagedPolicies.AmazonFSxConsoleFullAccess.Arn),
    ],
    inlinePolicies: {
        ec2DescribeInstances: new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        Actions.ec2.DescribeInstances,
                        Actions.ec2.CopyImage,
                        Actions.ec2.RunInstances,
                        Actions.ec2.CreateTags,
                        Actions.ec2.CreateCustomerGateway,
                    ],
                    resources: ['*'],
                }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [Actions.s3.GetObject, Actions.s3.PutObject, Actions.s3.DeleteObject],
                    resources: ['*'],
                }),
            ],
        }),
    },
});
```

### Python

The following is the Python version:

```python
from aws_cdk import (core, aws_iam as iam, Effect)
from src import Actions, ManagedPolicies

app = core.App()
stack = core.Stack(app, 'MyStack')

# Create an IAM role
iam.Role(stack, 'MyRole', 
  assumed_by=iam.ServicePrincipal('ec2.amazonaws.com'),
  managed_policies=[
    iam.ManagedPolicy.from_managed_policy_arn(stack, 'ElastiCacheFullAccess', ManagedPolicies.AmazonElastiCacheFullAccess.Arn),
    iam.ManagedPolicy.from_managed_policy_arn(stack, 'FSxConsoleFullAccess', ManagedPolicies.AmazonFSxConsoleFullAccess.Arn)
  ],
  inline_policies=[
    iam.PolicyDocument(
      statements=[
        iam.PolicyStatement(
          effect=iam.Effect.ALLOW,
          actions=[
            Actions.ec2.DescribeInstances,
            Actions.ec2.CopyImage,
            Actions.ec2.RunInstances,
            Actions.ec2.CreateTags,
            Actions.ec2.CreateCustomerGateway,
          ],
          resources=["*"]
        ),
        iam.PolicyStatement(
          effect=iam.Effect.ALLOW,
          actions=[
            Actions.s3.GetObject,
            Actions.s3.PutObject,
            Actions.s3.DeleteObject,
          ],
          resources=["*"]
        ),
      ]
    ),
  ]
)
```

### Golang

The following is the Golang version:

```golang
package main

import (
	awscdk "path/to/aws-cdk-lib"
	iam "path/to/aws-iam"
	helper "github.com/aws-cdk-lib/pkg/src"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("MyStack"), &awscdk.StackProps{})
  
	iam.NewRole(stack, "MyRole", &iam.RoleProps{
		AssumedBy:     iam.NewServicePrincipal(jsii.String("ec2.amazonaws.com"), &iam.ServicePrincipalOpts{}),
		ManagedPolicy: []*iam.IManagedPolicy{
			iam.IManagedPolicy_FromManagedPolicyArn(stack, jsii.String('ElastiCacheFullAccess'), helper.ManagedPolicies.AmazonElastiCacheFullAccess.Arn),
			iam.IManagedPolicy_FromManagedPolicyArn(stack, jsii.String('FSxConsoleFullAccess'), helper.ManagedPolicies.AmazonFSxConsoleFullAccess.Arn),
		},
		InlinePolicies: map[string]iam.IPolicyDocument {
			"ec2DescribeInstances": iam.NewPolicyDocument(&iam.PolicyDocumentProps {
				Statements: []iam.PolicyStatement {
					iam.NewPolicyStatement(&iam.PolicyStatementProps {
						Sid: jsii.String("ec2Permissions"),
						Effect: iam.Effect_ALLOW,
						Actions: jsii.Strings(helper.Actions.Ec2.DescribeInstances, helper.Actions.Ec2.CopyImage, helper.Actions.Ec2.RunInstances, helper.Actions.Ec2.CreateTags, helper.Actions.Ec2.CreateCustomerGateway),
						Resources: jsii.Strings("*"),
					}),
					iam.NewPolicyStatement(&iam.PolicyStatementProps {
						Sid: jsii.String("s3Permissions"),
						Effect: iam.Effect_ALLOW,
						Actions: jsii.Strings(helper.Actions.S3.GetObject, helper.Actions.S3.PutObject, helper.Actions.S3.DeleteObject),
						Resources: jsii.Strings("*"),
					}),
				},
			}),
		},
	})
}
```
