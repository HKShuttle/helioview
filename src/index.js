import { InfluxDB, Point } from "@influxdata/influxdb-client";
import config from '../config.json' with { type: 'json' };

async function main() {
    setInterval(fetchData, config.fetchIntervalSeconds * 1000);
}

async function fetchData() {
    try {
        let response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=SysInfo`);
        const sysInfo = await response.json();
        response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=CurCtDir`);
        const curCtDir = await response.json();
        response = await fetch(`${config.solarUrl}/asyncquery.cgi?type=PcsOne&pcsNumber=0`);
        const pcsOne = await response.json();

        await write(sysInfo, curCtDir, pcsOne);
    } catch (error) {
        console.error(new Date() + ": " + error);
    }    
}

async function write(sysInfo, curCtDir, pcsOne) {
    const influxdb = new InfluxDB({ url: config.influxdb.url, token: config.influxdb.token });
    const writeApi = influxdb.getWriteApi(config.influxdb.org, config.influxdb.bucket);
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

    writeApi.writePoint(point_realtimedata);
    if(!config.suppressLog){
        console.log(new Date() + ": Write OK");
    }
}

main().catch(console.error);
