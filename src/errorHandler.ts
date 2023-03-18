import { ErrorRequestHandler, RequestHandler } from "express";
import set from "lodash.set";
import { ZodError, ZodIssue } from "zod";
import { NotFoundError } from "./NotFoundError";

export const notFoundHandler: RequestHandler = (req, res, next) => {
  throw new NotFoundError();
};

export type ErrorKey = string;
export type ErrorMessage = string;
export type InputErrorMessages = Record<ErrorKey, ErrorMessage[]>;

export const toInputErrorMessages = (
  issues: ZodIssue[]
): InputErrorMessages => {
  const error = {};
  issues.forEach((issue) => {
    set(error, issue.path.join("."), [issue.message]);
  });
  return error;
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({ errors: err.issues });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ errors: err.message });
  }
  console.error(err);
  res.sendStatus(500);
};
