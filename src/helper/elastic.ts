import { Client } from "@elastic/elasticsearch";
import { EntryField, Index } from "src/definition/elastic";

export const client = new Client({ node: "http://elastic:9200" });

export async function initClient(client: Client) {
  await client.indices.create({
    index: Index.entry,
    body: {
      mappings: {
        properties: {
          [EntryField.xml]: { enabled: false },
          [EntryField.word]: {
            type: "search_as_you_type",
            analyzer: "standard",
            search_analyzer: "standard",
          },
          [EntryField.englishTranslationWord]: {
            type: "search_as_you_type",
            analyzer: "standard",
            search_analyzer: "standard",
          },
        },
      },
    },
  });
}
