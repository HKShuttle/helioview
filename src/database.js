import { InfluxDB } from '@influxdata/influxdb-client';
import config from '../config.json' with { type: 'json' };

export class Database {
  static #instance = null;

  #client;

  constructor() {
    if (Database.#instance) {
      throw new Error('Use Database.getInstance() instead of new.');
    }

    this.#client = new InfluxDB({
      url: config.influxdb.url,
      token: config.influxdb.token,
    });
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  getClient() {
    return this.#client;
  }

  async write(point) {
    this.#client.getWriteApi(config.influxdb.org, config.influxdb.bucket)
    .writePoint(point);
  }

  // async createBucket(bucketName, orgId) { ... }
  // async createOrganization(name) { ... }
}
