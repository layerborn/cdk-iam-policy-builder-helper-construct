import { ManagedPolicies } from '../src';


test('Smoke Test Managed Policies', () => {
  console.log(ManagedPolicies.AmazonElastiCacheFullAccess.PolicyName);
  expect(ManagedPolicies.AmazonElastiCacheFullAccess.PolicyName).toBe('AmazonElastiCacheFullAccess');
});
