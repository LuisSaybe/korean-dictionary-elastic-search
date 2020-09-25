import { RequestHandler } from "express";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export function queryValidator(schema: Parameters<typeof ajv.compile>[0]) {
  const validate = ajv.compile(schema);

  const handler: RequestHandler = (req, res, next) => {
    const valid = validate(req.query);

    if (valid) {
      next();
    } else {
      res.status(400).json(validate.errors);
    }
  };

  return handler;
}