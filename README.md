## Fox - Cloud Server

Cloud Server.

## Run

### Develop

```bash
$ git clone -b cloud-server --single-branch git@github.com:soulteary/fox.git cloud-server
$ cd cloud-server
$ npm start
```

### Production

```
$ pm2 start npm --name "fox" -- run start
```

## Lint Code

```bash
$ git clone -b cloud-server --single-branch git@github.com:soulteary/fox.git cloud-server
$ cd cloud-server
$ npm install
$ npm run eslint
```

## LICENSE

MIT