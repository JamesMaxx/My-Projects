const A = require('appwrite');
console.log('keys:', Object.keys(A));
console.log('has default export:', !!A.default);
console.log('typeof Client:', typeof A.Client);
console.log('typeof default.Client:', A.default ? typeof A.default.Client : 'no default');
console.dir(A.Client, { depth: 2 });
console.dir(A.default ? A.default.Client : null, { depth: 2 });
