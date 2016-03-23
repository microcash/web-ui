## Dev setup

* Install node and npm
* Setup [global npm without sudo]( https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md)

```sh
git clone git@github.com:microcash/web-ui.git
cd web-ui
npm install
gulp
# download microcash release
# unzip
# copy mc64 to ./
chmod +x mc64
# copy mimes.txt to web/
mkdir -p wallets network
docker-compose build
docker-compose stop
docker-compose up
```
