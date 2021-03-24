import { RequestHandler, json } from "express";
import compression from "compression";
const { KKMA } = require("koalanlp/API");
const { Parser } = require("koalanlp/proc");

import { DEFAULT_CORS } from "src/helper/cors";

const route: RequestHandler = async (req, res, next) => {
  if (typeof req.body.text !== "string" || req.body.text.length > 200) {
    res.status(400).end();
    return;
  }

  const parser = new Parser(KKMA);
  let parsed;

  try {
    parsed = await parser(req.body.text);
  } catch (e) {
    next(e);
    return;
  }

  for (const sent of parsed) {
    console.log("sent", sent);
    console.log(sent.toString());
    for (const dep of sent.dependencies) {
      console.log("dep", dep);
      console.log(dep.toString());
    }
  }

  res.status(200).end();
};

export const handler = [DEFAULT_CORS, compression(), json(), route];
