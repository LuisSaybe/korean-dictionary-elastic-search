import { RequestHandler } from "express";
import compression from "compression";

import { Index, EntryField } from "src/definition/elastic";
import { client } from "src/helper/elastic";
import { DEFAULT_CORS } from "src/helper/cors";

export const route: RequestHandler = async (req, res, next) => {
  if (!req.query.query || Array.isArray(req.query.query)) {
    res.status(400).json(`exactly 1 "query" param is required`);
    return;
  }
  const fields = [EntryField.word, EntryField.englishTranslationWord]
    .map((field) => [field, `${field}._2gram`, `${field}._3gram`])
    .flat();

  try {
    const { body } = await client.search({
      index: Index.entry,
      body: {
        from: 0,
        size: 5,
        query: {
          bool: {
            should : [
              { term : { word_grades : "초급" } }
            ],
            must : [
              {
                multi_match: {
                  query: req.query.query,
                  type: "bool_prefix",
                  fields,
                }
              },
            ]
          },
        }
      },
    });
    res.json(body.hits.hits);
  } catch (error) {
    next(error);
  }
};

export const handler = [DEFAULT_CORS, compression(), route];
