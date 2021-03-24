import { RequestHandler } from "express";
import compression from "compression";

import { Index, EntryField } from "src/definition/elastic";
import { client } from "src/helper/elastic";
import { DEFAULT_CORS } from "src/helper/cors";
import { WordGrade } from "src/definition/korean-open-api";
import { queryValidator } from "src/middleware/query-validator";

const route: RequestHandler = async (req, res, next) => {
  const bool = {
    should: [],
    must: [],
    filter: [],
  };

  if (req.query.query) {
    const fields = [
      EntryField.word,
      EntryField.englishTranslationWord,
      EntryField.frenchTranslationWord,
    ]
      .map((field) => [field, `${field}._2gram`, `${field}._3gram`])
      .flat();

    bool.should = [
      { term: { word_grades: WordGrade.beginner } },
      { term: { word_grades: WordGrade.intermediate } },
      { term: { word_grades: WordGrade.advanced } },
    ];

    bool.must = [
      {
        multi_match: {
          query: req.query.query,
          type: "bool_prefix",
          fields,
        },
      },
    ];
  }

  if (req.query.word_grades) {
    bool.filter = (Array.isArray(req.query.word_grades)
      ? req.query.word_grades
      : [req.query.word_grades]
    ).map((word_grades) => ({
      term: { word_grades },
    }));
  }

  try {
    const [
      {
        body: {
          hits: { hits },
        },
      },
      {
        body: { count },
      },
    ] = await Promise.all([
      client.search({
        index: Index.entry,
        body: {
          from:
            typeof req.query.from === "undefined" ? 0 : Number(req.query.from),
          size:
            typeof req.query.size === "undefined" ? 5 : Number(req.query.size),
          query: {
            bool,
          },
        },
      }),
      client.count({
        index: Index.entry,
        body: {
          query: {
            bool: {
              filter: bool.filter,
            },
          },
        },
      }),
    ]);

    res.json({ count, hits });
  } catch (error) {
    next(error);
  }
};

export const handler = [
  DEFAULT_CORS,
  queryValidator({
    type: "object",
    additionalProperties: false,
    properties: {
      query: {
        type: "string",
      },
      from: {
        type: "string",
        pattern: "^[0-9]{1,5}$",
      },
      size: {
        type: "string",
        pattern: "^[0-9]{1,3}$",
      },
      word_grades: {
        type: ["array", "string"],
        uniqueItems: true,
        enum: [
          WordGrade.beginner,
          WordGrade.intermediate,
          WordGrade.advanced,
          WordGrade.none,
        ],
        items: {
          type: "string",
          enum: [
            WordGrade.beginner,
            WordGrade.intermediate,
            WordGrade.advanced,
            WordGrade.none,
          ],
        },
      },
    },
  }),
  compression(),
  route,
];
