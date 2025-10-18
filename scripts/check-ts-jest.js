try {
  console.log('cwd', process.cwd());
  const p = require.resolve('ts-jest');
  console.log('require.resolve ts-jest ->', p);
  const mod = require('ts-jest');
  console.log('required ts-jest type:', typeof mod);
} catch (e) {
  console.error('require failed:', e && e.stack ? e.stack : e);
  process.exit(1);
}
