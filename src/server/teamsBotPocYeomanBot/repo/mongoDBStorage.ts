import { MongoClient } from 'mongodb';
import { Storage, StoreItems } from 'botbuilder';
import debug from 'debug';
const log = debug('msteams');

export class MongoDBStorage implements Storage {
  protected etag: number;

  url: string;
  dbName: string;
  collectionName: string;

  constructor(connectionUrl: string, db: string, collection: string) {
    this.url = connectionUrl;
    this.dbName = db;
    this.collectionName = collection;
  }

  public async read(keys: string[]): Promise<StoreItems> {
    return new Promise<StoreItems>((resolve: any, reject: any): void => {
      if (!keys) {
        throw new ReferenceError(`Keys are required when reading.`);
      }
      const data: StoreItems = {};
      this.getClient().then((client) => {
        try {
          const col = this.getCollection(client);
          for (const key of keys) {
            col.findOne({ _id: key }).then((doc) => {
              data[key] = doc ? doc.document : null;
            });
          }
          resolve(data);
        } finally {
          client.close();
        }
      });
    });
  }

  public async write(changes: StoreItems): Promise<void> {
    log(`write input: ${JSON.stringify(changes)}`);
    const client = await this.getClient();
    try {
      const col = this.getCollection(client);

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        Object.keys(changes).map(async (key) => {
          const changesCopy = { ...changes[key] };
          const documentChange = {
            _id: key,
            document: changesCopy
          };
          log(documentChange);
          const eTag = changes[key].eTag;

          if (!eTag || eTag === '*') {
            await col.updateOne({ _id: key }, { $set: { ...documentChange } }, { upsert: true });
            log('updateOne for db storage');
          } else if (eTag.length > 0) {
            await col.replaceOne({ _id: eTag }, documentChange);
            log('replaceOne for db storage');
          } else {
            throw new Error('eTag empty');
          }
        })
      );
    } finally {
      client.close();
    }
  }

  public async delete(keys: string[]): Promise<void> {
    const client = await this.getClient();
    try {
      const col = await this.getCollection(client);

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        Object.keys(keys).map(async (key) => {
          await col.deleteOne({ _id: key });
          log('Removed one from teams storage');
        })
      );
    } finally {
      client.close();
    }
  }

  async getClient(): Promise<MongoClient> {
    const client = await MongoClient.connect(this.url).catch((err) => {
      throw err;
    });

    if (!client) throw new Error('Unable to create MongoDB client');

    return client;
  }

  getCollection(client: MongoClient) {
    return client.db(this.dbName).collection(this.collectionName);
  }
}
