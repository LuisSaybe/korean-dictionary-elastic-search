import { RequestHandler } from "express";
import compression from "compression";
import LRU from "lru-cache";

import { Index } from "src/definition/elastic";
import { client } from "src/helper/elastic";
import { DEFAULT_CORS } from "src/helper/cors";

const cache = new LRU(5000);

export const route: RequestHandler = async (req, res, next) => {
  const cachedBody = cache.get(req.params.id);

  if (cachedBody) {
    res.setHeader("seoullatte-cache-hit", "true");
    res.json(cachedBody);
    return;
  }

  let body;

  try {
    const response = await client.search({
      index: Index.entry,
      body: {
        query: {
          match: { _id: req.params.id },
        },
      },
    });
    body = response.body;
  } catch (error) {
    next(error);
    return;
  }

  if (body.hits.hits.length === 0) {
    res.status(404).end();
  } else {
    cache.set(req.params.id, body.hits.hits);
    res.json(body.hits.hits);
  }
};

export const handler = [DEFAULT_CORS, compression(), route];
