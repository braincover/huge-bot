import { json, urlencoded } from 'body-parser';
import express from 'express';
import { bottender } from 'bottender';

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 3000;

// the request handler of the bottender app
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };
  server.use(json({ verify }));
  server.use(urlencoded({ extended: false, verify }));

  // route for webhook request
  server.all('*', (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`server is running on ${port}...`);
  });
});
