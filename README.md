# helioview

家庭の電力使用状況を収集・可視化するツールです。

オムロン製太陽光発電計測ユニット "KU-MU1P-M" にアクセスし、 JSON 形式で取得できるデータを収集します。

収集したデータは、 InfluxDB に蓄積し、 Grafana で可視化します。

# 動作環境

Docker Compose が動作し、 KU-MU1P-M と疎通が取れる Linux 環境(WSL も可)で動作します。

# 起動準備

1. `.env` ディレクトリをリポジトリルート直下に作成し、 `influxdb2-admin-password`, `influxdb2-admin-token`, `influxdb2-admin-username` の３つのファイルを作成します。
これらのファイルには、ファイル名にしたがって中に適切な文字列を書き込みます。

2. `config.json.sample` ファイルをコピーして、 config.json.sample と同じ階層に `config.json` ファイルを作成します。
config.json ファイルの内容は、環境に合わせて書き換えます。内容は次のようにします。

```json
{
    "influxdb" : {
        "url" : "InfluxDBのURL(Docker Composeで建てる場合は書き換え不要)",
        "token": "InfluxDBのアクセストークン",
        "org": "InfluxDBのOrganization名",
        "bucket": "InfluxDBのBucket"
    },
    "solarUrl": "KU-MU1P-MのURL",
    "fetchIntervalSeconds" : "計測値の取得間隔（秒）",
    "suppressLog": "計測値の取得成功時のログ出力を抑制するか（falseにするとログが出る）"
}
```

3. ブラウザで InfluxDB にアクセスし、 config.json ファイルで指定した通りの Organization, Bucket を作成します。

#  起動

`$ sudo docker compose up -d --build` すれば起動します。

ソースコードを書き換えたときはビルドし直してください。

# WebUI へのアクセス

* InfluxDB: http://localhost:8086/
* Grafana: http://localhost:3000/
