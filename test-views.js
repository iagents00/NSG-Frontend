// Test script to check view routing
const testViews = [
  'calendar',
  'metrics', 
  'strategy',
  'wellness',
  'library',
  'journal',
  'portfolio',
  'reports',
  'patients',
  'clinical_radar',
  'deliverables',
  'settings',
  'nsg_ios',
  'nsg_news',
  'nsg_clarity',
  'nsg_horizon'
];

console.log('Testing view routes...');
testViews.forEach(view => {
  console.log(`Testing: /dashboard/${view}`);
});

// Test current role
console.log('Current role from store:', window.location.href);

export default function TestComponent() {
  return (
    <div>
      <h1>View Route Test</h1>
      <p>Check console for test results</p>
    </div>
  );
}
