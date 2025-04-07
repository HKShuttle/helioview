# helioview

家庭の電力使用状況を収集・可視化するツールです。

オムロン製太陽光発電計測ユニット "KU-MU1P-M" にアクセスし、JSON形式でデータを収集します。

収集したデータは、InfluxDBに蓄積し、Grafanaで可視化します。

# 動作環境

Docker Composeが動作し、太陽光発電の計測システムと疎通が取れるLinux環境(WSLも可)で動作します。

# 起動準備

起動前に、 `.env` ディレクトリをリポジトリルート直下に作成し、 `influxdb2-admin-password`, `influxdb2-admin-token`, `influxdb2-admin-username` の３つのファイルを作成します。
これらのファイルには、ファイル名にしたがって中に適切な文字列を書き込みます。

さらに、 `config.json.sample` ファイルをコピーして、config.json.sampleと同じ階層に `config.json` ファイルを作成します。
config.jsonファイルの内容は、環境に合わせて書き換えます。

#  起動

`$ sudo docker compose up -d --build` すれば起動します。

ソースコードを書き換えたときはビルドし直してください。

# WebUIへのアクセス

* InfluxDB: http://localhost:8086/
* Grafana: http://localhost:3000/
