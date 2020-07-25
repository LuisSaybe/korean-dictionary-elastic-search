import AdmZip from "adm-zip";
import fs from "fs";
import * as jsdom from "jsdom";

import { writeExcelFile } from "src/helper/dictionary";
import { getDefinition } from "src/helper/dictionary-api";
import { client, ENTRY_INDEX_NAME } from "src/helper/elastic";

export const insertWordsToElasticSearch = async () => {
  const time = new Date().getTime();
  const fileName = `./${time}.zip`;
  await writeExcelFile(fileName);

  const zip = new AdmZip(fileName);
  const zipEntries = zip.getEntries();

  for (
    let zipEntriesIndex = 0;
    zipEntriesIndex < zipEntries.length;
    zipEntriesIndex++
  ) {
    const dom = new jsdom.JSDOM(
      zipEntries[zipEntriesIndex].getData().toString("utf8")
    );
    const lexicalEntries = dom.window.document.querySelectorAll("LexicalEntry");

    for (
      let lexicalEntryIndex = 0;
      lexicalEntryIndex < lexicalEntries.length;
      lexicalEntryIndex++
    ) {
      const entry = lexicalEntries[lexicalEntryIndex];
      const q = (entry as any).getAttribute("val");
      const xml = await getDefinition(q);
      console.log(
        `${zipEntriesIndex} / ${zipEntries.length} - ${lexicalEntryIndex} / ${lexicalEntries.length} - q = ${q}`
      );

      client.index({
        id: q,
        index: ENTRY_INDEX_NAME,
        body: {
          xml,
        },
      });
    }
  }

  fs.unlink(fileName, (e) => {
    console.error(e);
  });
};
