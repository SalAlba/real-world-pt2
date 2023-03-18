import express, {ErrorRequestHandler} from "express";
import cors from "cors";
import {NotFoundError} from "./NotFoundError";
import {articlesRouter} from "./articlesRouter";


export const app = express();
app.use(cors());
app.use(express.json());

app.use(articlesRouter);
app.use((req, res, next) => {
  throw new NotFoundError();
});
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ errors: err.message });
  }
  console.error(err);
  res.sendStatus(500);
};
app.use(errorHandler);
