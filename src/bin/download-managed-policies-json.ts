import * as fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IAMClient, paginateListPolicies, PolicyScopeType } from '@aws-sdk/client-iam';

const region = process.env.region || 'us-east-2';

interface CustomPolicy {
  PolicyName: string;
  Arn: string;
}

async function run() {
  const client = new IAMClient({ region: region });

  const params = { Scope: 'AWS' as PolicyScopeType };
  const paginator = paginateListPolicies({ client }, params);

  const policies: { [PolicyName: string]: CustomPolicy } = {};

  for await (const page of paginator) {
    if (page.Policies) {
      for (let policy of page.Policies) {
        if (policy.Arn && policy.PolicyName) {
          policies[policy.PolicyName] = {
            PolicyName: policy.PolicyName,
            Arn: policy.Arn,
          };
        }
      }
    }
  }

  fs.writeFileSync('src/construct/ManagedPolicies.json', JSON.stringify(policies, null, 2));
}

run().catch(console.error);
