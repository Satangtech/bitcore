import { Storage } from '@google-cloud/storage';

export const folderUpload = '/service-storage/contracts';

export class GGStorage {
  storage: Storage;
  bucketName: string;

  constructor() {
    this.bucketName = process.env.GOOGLE_BUCKET || '';
    this.storage = new Storage({ keyFilename: process.env.GOOGLE_KEY });
  }

  async downloadFile(contractAddress: string) {
    const fileName = `${contractAddress}.json`;
    const destination = `${folderUpload}/${contractAddress}.json`;
    const options = {
      destination,
    };
    try {
      await this.storage.bucket(this.bucketName).file(fileName).download(options);
    } catch (err: any) {
      if (err.code === 404) {
        return true;
      } else {
        console.error(err);
        throw err;
      }
    }
    console.log(`gs://${this.bucketName}/${fileName} downloaded to ${destination}.`);
  }

  async uploadFile(contractAddress: string) {
    const filePath = `${folderUpload}/${contractAddress}.json`;
    const destination = `${contractAddress}.json`;
    await this.storage.bucket(this.bucketName).upload(filePath, {
      destination,
    });
    console.log(`${filePath} uploaded to ${this.bucketName}`);
  }
}
