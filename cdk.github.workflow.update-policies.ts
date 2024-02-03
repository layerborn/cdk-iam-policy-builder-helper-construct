// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsCdkConstructLibrary, AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GithubWorkflow } from 'projen/lib/github';
// eslint-disable-next-line import/no-extraneous-dependencies
import { JobPermission, JobStep, Triggers } from 'projen/lib/github/workflows-model';


export const OIDCPerms = {
  idToken: JobPermission.WRITE,
  contents: JobPermission.READ,
};

export const setupNode18: JobStep = {
  name: 'Setup Node.js 18',
  uses: 'actions/setup-node@v3',
};

export const installYarn: JobStep = {
  name: 'Install Yarn',
  run: 'npm install -g yarn',
};

export const installDeps: JobStep = {
  name: 'Install dependencies',
  run: 'yarn install --check-files',
};

export const checkoutTypical: JobStep = {
  name: 'Checkout',
  uses: 'actions/checkout@v2',
};

export const uploadArtifact: JobStep = {
  name: 'Upload artifact',
  uses: 'actions/upload-artifact@v3',
  with: {
    name: 'build-artifact',
    path: 'cdk.out',
  },
};

export const downloadArtifacts: JobStep = {
  name: 'Download build artifacts',
  uses: 'actions/download-artifact@v3',
  with: {
    name: 'build-artifact',
    path: 'cdk.out',
  },
};

export const installTask: JobStep = {
  name: 'Install Task',
  uses: 'arduino/setup-task@v1',
};

export function configureAwsCredentials(
  roleArn: string,
  region: string,
  roleSessionName?: string,
  roleDurationSeconds?: number): JobStep {
  return {
    name: 'Set AWS Credentials',
    uses: 'aws-actions/configure-aws-credentials@v3',
    with: {
      'role-to-assume': roleArn,
      'role-duration-seconds': roleDurationSeconds ?? 3600,
      'aws-region': region,
      'role-skip-session-tagging': true,
      'role-session-name': roleSessionName ?? 'GitHubActions',
    },
  };
}

export const createPatchStep: JobStep = {
  name: 'Find mutations',
  id: 'create_patch',
  run: `git add .
git diff --staged --patch --exit-code > .repo.patch || echo "patch_created=true" >> $GITHUB_OUTPUT`,
};

export interface BranchWorkflowOptions {
  workflowName?: string;
  triggers?: Triggers;
  jobs?: JobDefinitionOptions[];
}

export class GithubWorkflowDefinition extends GithubWorkflow {
  constructor(project: AwsCdkTypeScriptApp | AwsCdkConstructLibrary, options: BranchWorkflowOptions) {
    super(project.github!, options.workflowName ?? 'CustomGithubWorkflow');
    if (options.triggers) this.on(options.triggers);
    const jobs = options.jobs ?? [];
    for (const job of jobs) {
      this.addJobs({
        [job.jobName]: new JobDefinition(job),
      });
    }
  }
}

export interface JobDefinitionOptions {
  jobName: string;
  runsOn: string[];
  permissions: { [key: string]: JobPermission };
  steps: JobStep[];
  if?: string;
}

export class JobDefinition {
  jobName: string;
  runsOn: string[];
  permissions: { [key: string]: JobPermission };
  steps: JobStep[];
  if: string | undefined;

  constructor(props: JobDefinitionOptions) {
    this.jobName = props.jobName;
    this.runsOn = props.runsOn;
    this.permissions = props.permissions;
    this.steps = props.steps;
    this.if = props.if;
  }
}


export function createPatchJob(outputId: string): JobDefinition {
  return new JobDefinition({
    jobName: 'create-patch',
    runsOn: ['ubuntu-latest'],
    permissions: {
      idToken: JobPermission.WRITE,
      contents: JobPermission.READ,
    },
    if: `\${{ needs.${outputId}.outputs.patch_created }}`,
    steps: [
      {
        name: 'Generate token',
        id: 'generate_token',
        uses: 'uses: tibdex/github-app-token@021a2405c7f990db57f5eae5397423dcc554159c',
        with: {
          app_id: '${{ secrets.GITHUB_APP_ID }}',
          private_key: '${{ secrets.GITHUB_APP_PRIVATE_KEY }}',
          permissions: '{"pull_requests":"write","contents":"write","workflows":"write"}',
        },
      },
      {
        name: 'Checkout',
        uses: 'actions/checkout@v3',
        with: {
          ref: 'main',
        },
      },
      {
        name: 'Download patch',
        uses: 'actions/download-artifact@v3',
        with: {
          name: 'patch',
          path: '${{ runner.temp }}',
        },
      },
      {
        name: 'Apply patch',
        run: '[ -s ${{ runner.temp }}/.repo.patch ] && git apply ${{ runner.temp }}/.repo.patch || echo "Empty patch. Skipping."',
      },
      {
        name: 'Set git identity',
        run: 'git config user.name "github-actions"\ngit config user.email "github-actions@github.com"',
      },
      {
        name: 'Create Pull Request',
        id: 'create-pr',
        uses: 'peter-evans/create-pull-request@v4',
        with: {
          'token': '${{ steps.generate_token.outputs.token }}',
          'commit-message': 'chore(deps): upgrade dependencies\n\nUpgrades project dependencies. See details in [workflow run].\n\n[Workflow Run]: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\n\n------\n\n*Automatically created by projen via the "upgrade-main" workflow*',
          'branch': 'github-actions/upgrade-main',
          'title': 'chore(deps): upgrade dependencies',
          'body': 'Upgrades project dependencies. See details in [workflow run].\n\n[Workflow Run]: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\n\n------\n\n*Automatically created by projen via the "upgrade-main" workflow*',
          'author': 'github-actions <github-actions@github.com>',
          'committer': 'github-actions <github-actions@github.com>',
          'signoff': true,
        },
      },
    ],
  },
  );
};
