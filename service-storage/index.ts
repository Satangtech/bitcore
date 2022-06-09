import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import basicAuth from 'express-basic-auth';
import { folderUpload, GGStorage } from './storage';
import { getKeys, getValue, setValue } from './redis';

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
  const fileExists = await fs.promises
    .access(`${folderUpload}/${contractAddress}.json`, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  let jsonObj = {};

  if (fileExists) {
    jsonObj = JSON.parse(await fs.promises.readFile(`${folderUpload}/${contractAddress}.json`, 'utf8'));
    res.send(jsonObj);
    return;
  }

  const value = await getValue(contractAddress);
  if (value) {
    await fs.promises.writeFile(`${folderUpload}/${contractAddress}.json`, value, 'utf8');
    jsonObj = JSON.parse(value);
  } else {
    const ggStorage = new GGStorage();
    await ggStorage.downloadFile(contractAddress);
    jsonObj = JSON.parse(await fs.promises.readFile(`${folderUpload}/${contractAddress}.json`, 'utf8'));
    await setValue(contractAddress, JSON.stringify(jsonObj));
  }
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
  await setValue(contractAddress, JSON.stringify(jsonObj));
  res.sendStatus(201);
});

app.get('/key/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  const result = await getValue(key);
  res.send(result);
});

app.post('/key/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  await setValue(key, JSON.stringify(req.body));
  res.sendStatus(201);
});

app.get('/keys', async (req: Request, res: Response) => {
  const result = await getKeys();
  res.send(result);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
