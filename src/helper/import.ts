import { Client } from "@elastic/elasticsearch";
import AdmZip from "adm-zip";
import fs from "fs";
import * as jsdom from "jsdom";

import { writeExcelFile } from "src/helper/dictionary";
import { getDefinition } from "src/helper/dictionary-api";

export const insertWordsToElasticSearch = async (
  client: Client,
  index: string
) => {
  const time = new Date().getTime();
  const fileName = `./${time}.zip`;

  await writeExcelFile(fileName);

  const zip = new AdmZip(fileName);
  const entries = zip.getEntries();

  for (const entry of entries) {
    const data = entry.getData().toString("utf8");
    const dom = new jsdom.JSDOM(data);
    const xmlEntries = Array.from(
      dom.window.document.querySelectorAll("LexicalEntry")
    );

    for (let n = 0; n < xmlEntries.length; n++) {
      const entry = xmlEntries[n];
      const q = (entry as any).getAttribute("val");
      const xml = await getDefinition(q);
      console.log("q", q);
      console.log(`${n} / ${xmlEntries.length}`);

      await client.index({
        index,
        body: {
          q,
          xml,
        },
      });
    }

    break;
  }

  await client.indices.refresh({ index });

  fs.unlink(fileName, (e) => {
    console.error(e);
  });
};
