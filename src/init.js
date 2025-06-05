import { Database } from "./database.js";
import config from '../config.json' with { type: 'json' };

export async function initDatabase() {
    const db = Database.getInstance();

    // Create org if not exists
    if (!await db.checkOrgs(config.influxdb.org)) {
        console.log(new Date() + ` [WARN] Organization not found: "${config.influxdb.org}" - proceeding to auto-create.`);
        console.log(new Date() + ` [INFO] Creating a new organization "${config.influxdb.org}".`);
        db.createOrg(config.influxdb.org);
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        console.log(new Date() + ` [INFO] Organization exists: "${config.influxdb.org}"`);
    }

    // Create bucket if not exists
    if (!await db.checkBucket(config.influxdb.bucket)) {
        console.log(new Date() + ` [WARN] Bucket not found: "${config.influxdb.bucket}" - proceeding to auto-create.`);
        console.log(new Date() + ` [INFO] Creating a new bucket "${config.influxdb.bucket}".`);
        db.createBucket(config.influxdb.bucket, await db.getOrgId(config.influxdb.org));
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        console.log(new Date() + ` [INFO] Bucket exixts: "${config.influxdb.bucket}"`);
    }
}
