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
    const dom = new jsdom.JSDOM();
    const domParser = new dom.window.DOMParser();
    const doc = domParser.parseFromString(
      zipEntries[zipEntriesIndex].getData().toString("utf8"),
      "application/xml"
    );
    const result = doc.evaluate(
      "//LexicalEntry/@val",
      doc,
      null,
      dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    let attribute = result.iterateNext();

    while (attribute) {
      const xml = await getDefinition(attribute.value);

      client.index({
        id: attribute.value,
        index: ENTRY_INDEX_NAME,
        body: {
          xml,
        },
      });

      console.log(
        `zipEntriesIndex = ${zipEntriesIndex} / ${zipEntries.length} - q ${attribute.value}`
      );
      attribute = result.iterateNext();
    }
  }

  fs.unlink(fileName, (e) => {
    if (e) {
      console.error(e);
    }
  });
};
