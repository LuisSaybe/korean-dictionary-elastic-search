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

### Run project

```bash
node dist/main
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
