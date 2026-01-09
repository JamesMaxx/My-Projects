const pkg = require('appwrite');
const C = pkg.Appwrite || pkg.default || pkg;
console.log('Ctor type:', typeof C);
const c = new C();
console.log('Instance keys slice:', Object.keys(c).slice(0,40));
console.log('has account', !!c.account);
console.log('has database', !!c.database);
console.log('has databases property', !!c.databases);
console.log('account methods sample:', Object.keys(c.account || {}).slice(0,20));
