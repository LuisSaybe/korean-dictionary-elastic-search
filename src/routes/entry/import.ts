import { insertWordsToElasticSearch } from "src/helper/import";

export const handler = (_, res) => {
  insertWordsToElasticSearch();
  res.sendStatus(200);
};
