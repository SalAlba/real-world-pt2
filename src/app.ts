import express from "express";
import cors from "cors";
import {articlesRouter} from "./articlesRouter";
import {errorHandler, notFoundHandler} from "./errorHandler";

export const app = express();
app.use(cors());
app.use(express.json());

app.use(articlesRouter);
app.use(notFoundHandler);
app.use(errorHandler);
