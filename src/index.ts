import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

const { initialize } = require("koalanlp/Util");

import { Index } from "src/definition/elastic";
import { initClient } from "src/helper/elastic";
import { handler as GET_ENTRY_ROUTE } from "src/routes/entry/get";
import { handler as SEARCH_ENTRY_ROUTE } from "src/routes/entry/search";
import { handler as TAG_TEXT_ROUTE } from "src/routes/tag";
import { writeDictionaryToElasticSearch } from "src/helper/write-dictionary-to-elastic";
import { client } from "src/helper/elastic";

const app = express();

app.get(`/${Index.entry}/:id(\\d+)`, GET_ENTRY_ROUTE);
app.get(`/${Index.entry}`, SEARCH_ENTRY_ROUTE);
// app.post(`/tag`, TAG_TEXT_ROUTE);

const startServer = () => {
  if (process.env.SSL_CERTS_FOLDER) {
    const privateKey = fs.readFileSync(
      path.resolve(process.env.SSL_CERTS_FOLDER, "privkey.pem"),
      "utf8",
    );
    const certificate = fs.readFileSync(
      path.resolve(process.env.SSL_CERTS_FOLDER, "fullchain.pem"),
      "utf8",
    );
    const httpsServer = https.createServer(
      { key: privateKey, cert: certificate },
      app,
    );
    httpsServer.listen(443);
  } else {
    app.listen(80, () => console.log("server started on port 80"));
  }
};

const initializeElasticSearch = async () => {
  for (;;) {
    console.log("waiting to connect to elastic");

    try {
      await initClient(client);
      break;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  writeDictionaryToElasticSearch();
};

initialize({
  packages: { KMR: "2.0.4", KKMA: "2.0.4" },
  verbose: true,
}).then(
  () => {
    startServer();
    initializeElasticSearch();
  },
  () => {
    console.error("Unable to initialize koalanlp");
  },
);
