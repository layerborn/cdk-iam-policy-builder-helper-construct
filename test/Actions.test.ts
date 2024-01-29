import { Actions, ManagedPolicies } from '../src';


test('Smoke Test Action Policies', () => {
  console.log(ManagedPolicies.AmazonElastiCacheFullAccess.PolicyName);
  console.log(Actions.ec2.AllocateHosts);
  expect(Actions.ec2.DescribeInstances).toBe('ec2:DescribeInstances');
});
