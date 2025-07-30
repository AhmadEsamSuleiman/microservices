import { RequestHandler } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    const toParse = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    const result = schema.safeParse(toParse);
    if (!result.success) {
      res.status(400).json({
        status: "fail",
        errors: result.error.format(),
      });
      return;
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;

    next();
  };
