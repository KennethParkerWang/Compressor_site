const url = 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf';
console.log('lowercase:', url.toLowerCase().endsWith('.pdf'));
try { console.log('host:', new URL(url).hostname.toLowerCase()); } catch (e) { console.log('err:', e.message); }