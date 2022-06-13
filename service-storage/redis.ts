import { createClient } from 'redis';
import 'dotenv/config';

const client = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});
client.on('error', (err) => console.log('Redis Client Error', err));

export const getValue = async (key: string) => {
  await client.connect();
  const value = await client.get(key);
  await client.disconnect();
  return value;
};

export const setValue = async (key: string, value: string) => {
  await client.connect();
  await client.set(key, value, { EX: 60 * 60 * 24 }); // 24 hr expire
  await client.disconnect();
};

export const getKeys = async () => {
  await client.connect();
  const result = await client.keys('*');
  await client.disconnect();
  return result;
};
