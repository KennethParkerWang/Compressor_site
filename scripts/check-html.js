const http = require('http');
const dec = new TextDecoder('utf-8', {fatal: false});
http.get('http://localhost:3003/', (res) => {
  let data = [];
  res.on('data', c => data.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(data);
    const s = buf.toString('utf-8');
    const m = s.match(/<title>([^<]*)<\/title>/);
    if (m) {
      console.log('title:', JSON.stringify(m[1]));
      // 找 title 在原始 buffer 中的位置
      const titleBuf = Buffer.from('<title>', 'utf-8');
      const i = buf.indexOf(titleBuf);
      const end = buf.indexOf(Buffer.from('</title>', 'utf-8'), i);
      const titleRaw = buf.slice(i + 7, end);
      console.log('raw bytes:', titleRaw.toString('hex'));
    } else {
      console.log('no title');
    }
  });
});