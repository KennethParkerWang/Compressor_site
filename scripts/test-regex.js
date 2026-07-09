const urlLine = '"url": "https://doi.org/10.1109/TIT.1956.1056818"';
const m = urlLine.match(/"url":\s*"([^"]+)"(\s*,)?/);
console.log('m:', m);
console.log('m[1]:', m[1]);
console.log('m[2]:', JSON.stringify(m[2]));
console.log('truthy:', !!m[2]);

const urlLine2 = '"url": "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"';
const m2 = urlLine2.match(/"url":\s*"([^"]+)"(\s*,)?/);
console.log('\nm2:', m2);