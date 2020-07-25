import { Client } from "@elastic/elasticsearch";

export const client = new Client({ node: "http://elastic:9200" });
export const ENTRY_INDEX_NAME = "entry";
