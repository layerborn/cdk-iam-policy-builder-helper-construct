import { awscdk, github } from 'projen';
import { GithubCredentials } from 'projen/lib/github';
import { JobStep } from 'projen/lib/github/workflows-model';
import { NpmAccess } from 'projen/lib/javascript';
import {
  checkoutTypical,
  configureAwsCredentials,
  createPatchJob,
  createPatchStep,
  GithubWorkflowDefinition,
  installDeps,
  installYarn,
  JobDefinition,
  setupNode18,
} from './cdk.github.workflow.update-policies';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Jayson Rawlins',
  authorAddress: 'jayson.rawlins@layerborn.io',
  description: 'A CDK construct that helps build IAM policies using the AWS IAM Policy Builder dump.  Normally it is better to use cdk-iam-floyd, but this construct is useful for when you need to build a policy that is not supported by cdk-iam-floyd.',
  keywords: [
    'aws',
    'cdk',
    'iam-policy',
    'iam-actions',
  ],
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
  testdir: 'test',
  rootdir: '.',
  srcdir: 'src',
  tsconfigDev: {
    compilerOptions: {
      lib: ['es2019'],
    },
    include: [
      'cdk.github.workflow.*.ts',
    ],
  },
  eslint: true,

});

project.github!.tryFindWorkflow('build')!.file!.addOverride('jobs.build.permissions.id-token', 'write');
project.github!.tryFindWorkflow('upgrade-main')!.file!.addOverride('jobs.upgrade.permissions.id-token', 'write');

project.addTask('download-policies', {
  exec: `ts-node ./src/bin/download-actions-json.ts
ts-node ./src/bin/download-managed-policies-json.ts
ts-node ./src/bin/create-actions-json.ts`,
  description: 'Download the latest IAM policies from AWS',
});

const downloadLatestPolicies: JobStep = {
  name: 'build',
  run: `ts-node ./src/bin/download-actions-json.ts
ts-node ./src/bin/download-managed-policies-json.ts
ts-node ./src/bin/create-actions-json.ts`,
};

const configureAwsCreds = configureAwsCredentials(
  'arn:aws:iam::${{ secrets.AWS_PROJEN_BUILD_ACCOUNT_ID }}:role/GitHubActions',
  '${{ secrets.AWS_PROJEN_BUILD_REGION }}',
  'GitHubActions');

const downloadLatestPolicy = new JobDefinition({
  jobName: 'download-latest-policies',
  runsOn: ['ubuntu-latest'],
  permissions: {
    contents: github.workflows.JobPermission.WRITE,
    idToken: github.workflows.JobPermission.WRITE,
  },
  steps: [
    checkoutTypical,
    configureAwsCreds,
    setupNode18,
    installYarn,
    installDeps,
    downloadLatestPolicies,
    createPatchStep,
  ],
});

new GithubWorkflowDefinition(project, {
  workflowName: 'download-latest-policies',
  jobs: [
    downloadLatestPolicy,
    createPatchJob(downloadLatestPolicy.jobName),
  ],
  triggers: {
    schedule: [{
      cron: '0 0 * * FRI',
    }],
  },
});

project.postCompileTask.exec('rm tsconfig.json');
project.synth();
