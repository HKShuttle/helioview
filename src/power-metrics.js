import { Point } from "@influxdata/influxdb-client";
import { Database } from './database.js';
import config from '../config.json' with { type: 'json' };

export async function getPowerMetrics() {
    try {
        let response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=SysInfo`);
        const sysInfo = await response.json();
        response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=CurCtDir`);
        const curCtDir = await response.json();
        response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=PcsOne&pcsNumber=0`);
        const pcsOne = await response.json();
        await write(sysInfo, curCtDir, pcsOne);
    } catch (e) {
        console.error(new Date() + " [ERROR] Failed to fetch data from PCS.");
    }
}

async function write(sysInfo, curCtDir, pcsOne) {
    const influxdb = Database.getInstance();
    const point_realtimedata = new Point('realtimedata')
        .floatField('Vu', sysInfo.mainSensorData.voltageU / 10)
        .floatField('Iu', sysInfo.mainSensorData.currentU / 10)
        .intField('Pu', sysInfo.mainSensorData.costValueU)
        .floatField('Vw', sysInfo.mainSensorData.voltageW / 10)
        .floatField('Iw', sysInfo.mainSensorData.currentW / 10)
        .intField('Pw', sysInfo.mainSensorData.costValueW)
        .intField('Ptrade', curCtDir.instantPower.tradedPower)
        .intField('Pconsume', curCtDir.instantPower.consumedPower)
        .intField('Pgen', pcsOne.onePcsInfoData.power)
        .floatField('Vdc', pcsOne.onePcsInfoData.directVoltageArray[0] / 10)
        .floatField('Idc', pcsOne.onePcsInfoData.directCurrentArray[0] / 10);

    influxdb.write(point_realtimedata);
    if (!config.suppressLog) {
        console.log(new Date() + " [INFO] Write succeeded.");
    }
}
