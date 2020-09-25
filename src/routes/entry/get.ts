import { RequestHandler } from "express";
import compression from "compression";

import { Index } from "src/definition/elastic";
import { client } from "src/helper/elastic";
import { DEFAULT_CORS } from "src/helper/cors";

export const route: RequestHandler = async (req, res, next) => {
  try {
    const { body } = await client.search({
      index: Index.entry,
      body: {
        query: {
          match: { _id: req.params.id },
        },
      },
    });
    if (body.hits.hits.length === 0) {
      res.status(404).end();
    } else {
      res.json(body.hits.hits);
    }
  } catch (error) {
    next(error);
  }
};

export const handler = [DEFAULT_CORS, compression(), route];
