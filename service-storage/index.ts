import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import basicAuth from 'express-basic-auth';
import { folderUpload } from './storage';

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(
  basicAuth({
    users: { admin: 'Admin123!' },
  })
);

app.get('/', (req: Request, res: Response) => {
  res.send('Service Storage!');
});

app.get('/contracts/:contractAddress', async (req: Request, res: Response) => {
  const { contractAddress } = req.params;
  res.send(`Get Contract: ${contractAddress}`);
});

app.post('/contracts/:contractAddress', async (req: Request, res: Response) => {
  const { version, optimized, code } = req.body;
  const { contractAddress } = req.params;
  console.log('version', version);
  console.log('optimized', optimized);
  console.log('code', code);
  const jsonObj = {
    version,
    optimized,
    code,
  };
  await fs.promises.writeFile(`${folderUpload}/${contractAddress}.json`, JSON.stringify(jsonObj), 'utf8');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
