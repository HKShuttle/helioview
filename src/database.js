import { InfluxDB } from '@influxdata/influxdb-client';
import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis';
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

  async checkOrgs(orgName) {
    const response = await new OrgsAPI(this.#client).getOrgs({ request: { org: orgName } });
    const orgs = response.orgs ?? [];
    const matched = orgs.find(o => o.name === orgName);
    if (matched) {
      return true;
    }
    return false;
  }

  async getOrgId(orgName) {
    const response = await new OrgsAPI(this.#client).getOrgs({ request: { org: orgName } });
    const orgs = response.orgs ?? [];
    const matched = orgs.find(o => o.name === orgName);
    if (matched) {
      return matched.id;
    }
    return null;
  }

  async checkBucket(bucketName) {
    const response = await new BucketsAPI(this.#client).getBuckets();
    const buckets = response.buckets ?? [];
    const matched = buckets.find(b => b.name === bucketName);
    if (matched) {
      return true;
    }
    return false;
  }

  async createOrg(orgName) {
    try {
      await new OrgsAPI(this.#client).postOrgs({ body: { name: orgName } });
      return true;
    } catch (e) {
      console.error(new Date() + " [ERROR} " + e);
      return false;
    }
  }

  async createBucket(bucketName, orgID) {
    try {
      await new BucketsAPI(this.#client).postBuckets({
        body: {
          name: bucketName,
          orgID: orgID,
          retentionRules: [{
            type: "expire",
            everySeconds: 0,
            shardGroupDurationSeconds: 604800
          }]
        }
      });
      return true;
    } catch (e) {
      console.error(new Date() + " [ERROR} " + e);
      return false;
    }
  }
}
