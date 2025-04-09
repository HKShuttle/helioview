# helioview

家庭の電力使用状況を収集・可視化するツールです。

オムロン製太陽光発電計測ユニット "KP-MU1P-M" にアクセスし、 JSON 形式で取得できる電圧・電流・電力のリアルタイムデータを収集します。

収集したデータは、 InfluxDB に蓄積し、 Grafana で可視化します。

# 動作環境

Docker Compose が動作し、 KP-MU1P-M と疎通が取れる Linux 環境(WSL も可)で動作します。

# 収集するデータ

本ツールでは以下のデータを収集します。

- 電圧(V)
    - Vdc: 太陽電池アレイの直流電圧
    - Vu: U相の主幹交流電圧
    - Vw: W相の主幹交流電圧
- 電流(I)
    - Idc: 太陽電池アレイの直流電流
    - Iu: U相の主幹交流電流
    - Iw: W相の主幹交流電流
- 電力(P)
    - Pconsume: 全消費電力
    - Pgen: パワーコンディショナーの発電電力
    - Ptrade: 電力会社からの買電(正)または売電(負)電力
    - Pu: Ptrade のうちU相に流れた電力
    - Pw: Ptrade のうちW相に流れた電力

# 起動準備

1. `.env` ディレクトリをリポジトリルート直下に作成し、 `influxdb2-admin-password`, `influxdb2-admin-token`, `influxdb2-admin-username` の３つのファイルを作成します。
これらのファイルには、ファイル名にしたがって中に適切な文字列を書き込みます。

2. `config-sample.json` ファイルをコピーして、 config-sample.json と同じ階層に `config.json` ファイルを作成します。
config.json ファイルの内容は、環境に合わせて書き換えます。
内容は次のようにします。

```json
{
    "influxdb": {
        "url": "InfluxDBのURL(Docker Composeで建てる場合は書き換え不要)",
        "token": "InfluxDBのアクセストークン",
        "org": "InfluxDBのOrganization名",
        "bucket": "InfluxDBのBucket"
    },
    "solarUrl": "KP-MU1P-MのURL",
    "fetchIntervalSeconds": "計測値の取得間隔（秒）",
    "suppressLog": "計測値の取得成功時のログ出力を抑制するか（falseにするとログが出る）"
}
```

3. ターミナルで `$ sudo docker compose up -d influxdb2` を実行し、 InfluxDB を立ち上げます。
ブラウザで InfluxDB にアクセスし、 config.json ファイルで指定した通りの Organization, Bucket を作成します。

#  起動

`$ sudo docker compose up -d` を実行すれば起動します。

ソースコードを書き換えたとき、および config.json を書き換えたときは `$ sudo docker compose build` を実行してコンテナをビルドし直してください。

# Grafanaの設定

Grafana のデータソースに InfluxDB を設定する際、 URL には `http://influxdb2:8086` を指定してください。
