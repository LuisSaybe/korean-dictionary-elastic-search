import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

import { ENTRY_INDEX_NAME } from "src/helper/elastic";
import { handler as GET_ENTRY_ROUTE } from "src/routes/entry/get";
import { writeDictionaryToElasticSearch } from "src/helper/write-dictionary-to-elastic";

const app = express();

app.get(`/${ENTRY_INDEX_NAME}/:id(\\d+)`, GET_ENTRY_ROUTE);

if (process.env.SSL_CERTS_FOLDER) {
  const privateKey = fs.readFileSync(
    path.resolve(process.env.SSL_CERTS_FOLDER, "privkey.pem"),
    "utf8"
  );
  const certificate = fs.readFileSync(
    path.resolve(process.env.SSL_CERTS_FOLDER, "fullchain.pem"),
    "utf8"
  );
  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    app
  );
  httpsServer.listen(443);
} else {
  app.listen(80, () => console.log("server started on port 80"));
}

/*
  wait for elasticsearch to start then import
*/

setTimeout(() => {
  writeDictionaryToElasticSearch();
}, 10000);
