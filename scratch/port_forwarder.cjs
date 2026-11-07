const http = require('http');

const PORT = 5173;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${TARGET_PORT}`,
    },
  };

  const proxy = http.request(options, (targetRes) => {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Gateway Error: dev server is starting on port ' + TARGET_PORT);
  });

  req.pipe(proxy, { end: true });
});

server.on('upgrade', (req, socket, head) => {
  const proxy = http.request({
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxy.on('upgrade', (targetRes, targetSocket, targetHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(targetRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    targetSocket.pipe(socket);
    socket.pipe(targetSocket);
  });

  proxy.on('error', () => {
    socket.destroy();
  });

  proxy.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Port proxy active: http://localhost:${PORT} -> http://localhost:${TARGET_PORT}`);
});

