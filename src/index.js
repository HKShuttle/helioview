import { getPowerMetrics } from "./power-metrics.js";
import { initDatabase } from "./init.js";
import config from '../config.json' with { type: 'json' };


async function main() {
    initDatabase();
    setInterval(getPowerMetrics, config.fetchIntervalSeconds * 1000);
}

main().catch(console.error);
