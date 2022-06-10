import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import basicAuth from 'express-basic-auth';
import { folderUpload, GGStorage } from './storage';
import 'dotenv/config';

const storageUsername = process.env.STORAGE_USERNAME || 'admin';
const storagePassword = process.env.STORAGE_PASSWORD || 'Admin123!';
const app: Express = express();
const port = Number(process.env.PORT) || 5555;
const bind = process.env.BIND || '0.0.0.0';

app.use(express.json());
app.use(
  basicAuth({
    users: { [storageUsername]: storagePassword },
  })
);

app.get('/', (req: Request, res: Response) => {
  res.send('Service Storage!');
});

app.get('/contracts/:contractAddress', async (req: Request, res: Response) => {
  const { contractAddress } = req.params;
  const ggStorage = new GGStorage();
  await ggStorage.downloadFile(contractAddress);
  const jsonObj = JSON.parse(await fs.promises.readFile(`${folderUpload}/${contractAddress}.json`, 'utf8'));
  await fs.promises.unlink(`${folderUpload}/${contractAddress}.json`);
  res.send(jsonObj);
});

app.post('/contracts/:contractAddress', async (req: Request, res: Response) => {
  const { name, version, optimized, code } = req.body;
  const { contractAddress } = req.params;
  const jsonObj = {
    name,
    version,
    optimized,
    code,
  };
  await fs.promises.writeFile(`${folderUpload}/${contractAddress}.json`, JSON.stringify(jsonObj), 'utf8');
  const ggStorage = new GGStorage();
  await ggStorage.uploadFile(contractAddress);
  await fs.promises.unlink(`${folderUpload}/${contractAddress}.json`);
  res.sendStatus(201);
});

app.listen(port, bind, () => {
  console.log(`[server]: Server is running at ${bind}:${port}`);
});
