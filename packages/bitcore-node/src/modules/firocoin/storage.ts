import { folderUpload } from './api/contract';
import { Storage } from '@google-cloud/storage';

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
    await this.storage.bucket(this.bucketName).file(fileName).download(options);
    console.log(`gs://${this.bucketName}/${fileName} downloaded to ${destination}.`);
  }

  async uploadFile(contractAddress: string) {
    const filePath = `${folderUpload}/${contractAddress}.json`;
    const destFileName = `${contractAddress}.json`;
    await this.storage.bucket(this.bucketName).upload(filePath, {
      destination: destFileName,
    });
    console.log(`${filePath} uploaded to ${this.bucketName}`);
  }
}
