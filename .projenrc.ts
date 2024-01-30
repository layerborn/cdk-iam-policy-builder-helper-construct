import { awscdk, github } from 'projen';
import { GithubCredentials } from 'projen/lib/github';
import { NpmAccess } from 'projen/lib/javascript';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Jayson Rawlins',
  authorAddress: 'jayson.rawlins@layerborn.io',
  description: 'A CDK construct that helps build IAM policies using the AWS IAM Policy Builder dump.  Normally it is better to use cdk-iam-floyd, but this construct is useful for when you need to build a policy that is not supported by cdk-iam-floyd.',
  cdkVersion: '2.30.0',
  defaultReleaseBranch: 'main',
  minNodeVersion: '18.0.0',
  jsiiVersion: '~5.0.0',
  name: '@layerborn/cdk-iam-policy-builder-helper',
  npmAccess: NpmAccess.PUBLIC,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/layerborn/cdk-iam-policy-builder-helper-construct.git',
  githubOptions: {
    mergify: true,
    pullRequestLint: true,
    projenCredentials: GithubCredentials.fromApp({
      permissions: {
        pullRequests: github.workflows.AppPermission.WRITE,
        contents: github.workflows.AppPermission.WRITE,
        workflows: github.workflows.AppPermission.WRITE,
      },
    }),
  },
  depsUpgrade: true,
  depsUpgradeOptions: {
    workflowOptions: {
      projenCredentials: GithubCredentials.fromApp({
        permissions: {
          pullRequests: github.workflows.AppPermission.WRITE,
          contents: github.workflows.AppPermission.WRITE,
          workflows: github.workflows.AppPermission.WRITE,
        },
      }),
    },
  },
  publishToPypi: {
    distName: 'layerborn.cdk-iam-policy-builder-helper',
    module: 'layerborn.cdk_iam_policy_builder_helper',
  },
  publishToGo: {
    moduleName: 'github.com/layerborn/cdk-iam-policy-builder-helper-construct',
  },
  bundledDeps: [
    '@aws-sdk/client-iam',
    'axios',
    'jsonc-parser',
  ],
  deps: [],
  devDeps: [
    '@types/axios',
    '@aws-sdk/types',
    '@types/node',
  ],
  gitignore: [
    'methods_list.txt',
  ],
});

project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.build.permissions.id-token', 'write');
project.github!.tryFindWorkflow('upgrade-main')!.file!.addOverride('jobs.upgrade.permissions.id-token', 'write');

project.synth();
