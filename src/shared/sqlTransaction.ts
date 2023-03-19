import { Kysely, Transaction } from "kysely";

export type WithTx<D> = ReturnType<typeof transactional<D>>;

export const transactional =
  <D>(db: Kysely<D>) =>
  <A extends any[], R>(
    fn: (tx: Transaction<D>) => (...args: A) => Promise<R>
  ) =>
  (...args: A): Promise<R> => {
    return db.transaction().execute((trx) => fn(trx)(...args));
  };
