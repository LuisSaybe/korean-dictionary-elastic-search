import { RequestHandler } from "express";
import cors from "cors";
import compression from "compression";

import { client, ENTRY_INDEX_NAME } from "src/helper/elastic";

export const route: RequestHandler = async (req, res, next) => {
  try {
    const { body } = await client.search({
      index: ENTRY_INDEX_NAME,
      body: {
        query: {
          match: { _id: req.params.id },
        },
      },
    });
    res.json(body.hits.hits);
  } catch (error) {
    next(error);
  }
};

export const handler = [
  cors({
    origin: ["https://seoullatte.com", "http://seoullatte.local"],
  }),
  compression(),
  route,
];
