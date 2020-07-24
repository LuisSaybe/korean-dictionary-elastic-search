import express, { RequestHandler } from "express";
import { Client } from "@elastic/elasticsearch";

import { insertWordsToElasticSearch } from "src/helper/import";

const app = express();
const client = new Client({ node: "http://elastic:9200" });

const ENTRY = "entry";

const handler: RequestHandler = async (_, res) => {
  insertWordsToElasticSearch(client, ENTRY);
  res.sendStatus(200);
};

const getEntry: RequestHandler = async (req, res, next) => {
  try {
    const { body } = await client.search({
      index: ENTRY,
      body: {
        query: {
          match: { q: req.params.q },
        },
      },
    });
    res.json(body.hits);
  } catch (error) {
    next(error);
  }
};

app.post("/index", handler);
app.get("/index/:q(\\d+)", getEntry);

app.listen(80, () => console.log("server started on port 80"));
