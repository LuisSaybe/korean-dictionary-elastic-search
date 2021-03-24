## korean-dictionary-elastic-search

A Korean dictionary backed by elastic search

Dictionary content provided by [National Institute of Korean Language Open API](https://krdict.korean.go.kr/openApi/openApiInfo)

### Downloading the dictionary

1. Log into your account at https://krdict.korean.go.kr
2. Navigate to the tab 사전 내려받기 and download all dictionary entries

### Watch files

```bash
yarn watch
```

### Run project in dev mode with docker-compose

```yaml
version: "3.8"

services:
  install:
    image: luissaybe/korean-dictionary-elastic-search
    command: ["yarn"]
    volumes:
      - ./:/root/project
  watch:
    image: luissaybe/korean-dictionary-elastic-search
    command: ["yarn", "watch"]
    volumes:
      - ./:/root/project
    depends_on:
      - install
  api:
    command: ["node", "dist/main"]
    image: luissaybe/korean-dictionary-elastic-search
    volumes:
      - ./:/root/project
    ports:
      - 9000:80
    depends_on:
      - elastic
      - watch
  elastic:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.8.0
    environment:
      - discovery.type=single-node
```

### Wildcard certs

Create a ~/.credentials.ini with the following data

```sh
dns_digitalocean_token = YOUR_DIGITALOCEAN_API_TOKEN
```

```sh
apt update -y
add-apt-repository -y ppa:certbot/certbot
apt install -y certbot python3-certbot-dns-digitalocean
certbot certonly --dns-digitalocean --dns-digitalocean-credentials ~/credentials.ini  -d seoullatte.com -d *.seoullatte.com
```
