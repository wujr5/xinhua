const fs = require('fs');

aWords = JSON.parse(fs.readFileSync('word.json', { encoding: 'utf-8' }));

console.log(aWords[100]);
