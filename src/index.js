import { InfluxDB, Point } from "@influxdata/influxdb-client";

import config from '../config.json' with { type: 'json' };

const influxdb = new InfluxDB({url:config.url, token:config.token});
const writeApi = influxdb.getWriteApi(config.org, config.bucket);

async function main() {
    setInterval(fetchData, 1000);
}

async function fetchData() {
    let response = await fetch(`${config.solar_url}/asyncquery.cgi?type=SysInfo`);
    let sysInfo = await response.json();
    response = await fetch(`${config.solar_url}/asyncquery.cgi?type=CurCtDir`);
    let curCtDir = await response.json();
    response = await fetch(`${config.solar_url}/asyncquery.cgi?type=PcsInfoAll`);
    let pcsInfoAll = await response.json();
    response = await fetch(`${config.solar_url}/asyncquery.cgi?type=PcsOne&pcsNumber=0`);
    let pcsOne = await response.json();
    // console.log(sysInfo);
    // console.log(curCtDir);
    // console.log(pcsInfoAll);

    const costValueU = sysInfo.mainSensorData.costValueU;
    const voltageU = sysInfo.mainSensorData.voltageU / 10;
    const currentU = sysInfo.mainSensorData.currentU / 10;
    const costValueW = sysInfo.mainSensorData.costValueW;
    const voltageW = sysInfo.mainSensorData.voltageW / 10;
    const currentW = sysInfo.mainSensorData.currentW / 10;

    // let currentN;
    // if(costValueU < 0 && costValueW >= 0 || costValueW < 0 && costValueU >= 0){
    //     currentN = currentU + currentW;
    // } else {
    //     currentN = Math.max(currentU, currentW) - Math.min(currentU, currentW);
    // }


    const costSum = costValueU + costValueW;

    const consumedPower = curCtDir.instantPower.consumedPower;

    const pcsGeneratedPower = pcsOne.onePcsInfoData.power;
    const dcVoltage = pcsOne.onePcsInfoData.directVoltageArray[0] / 10;
    const dcCurrent = pcsOne.onePcsInfoData.directCurrentArray[0] / 10;

    console.log("Phase U: " + voltageU + "V " + currentU + "A " + costValueU + "W");
    console.log("Phase W: " + voltageW + "V " + currentW + "A " + costValueW + "W");
    console.log("Summary: " + costSum + "W");
    // console.log("Neutral: " + currentN + "A");
    console.log("Power Consumption: " + consumedPower + "W");
    console.log("Generated Power: " + pcsGeneratedPower + "W");
    console.log("DC Bus: " + dcVoltage + "V " + dcCurrent + "A\n");

    let point_realtimedata = new Point('realtimedata')
        .floatField('Vu', voltageU)
        .floatField('Iu', currentU)
        .intField('Pu', costValueU)
        .floatField('Vw', voltageW)
        .floatField('Iw', currentW)
        .intField('Pw', costValueW)
        .intField('Ptrade', costSum)
        .intField('Pconsume', consumedPower)
        .intField('Pgen', pcsGeneratedPower)
        .floatField('Vdc', dcVoltage)
        .floatField('Idc', dcCurrent);

    writeApi.writePoint(point_realtimedata);

    // console.log('${point_realtimedata.toLineProtocol(writeApi)}');

    // try {
    //     await writeApi.close()
    //     console.log('FINISHED ... now try ./query.ts')
    // } catch (e) {
    //     console.error(e)
    //     console.log('\nFinished ERROR')
    // }
}

main().catch(console.error);
