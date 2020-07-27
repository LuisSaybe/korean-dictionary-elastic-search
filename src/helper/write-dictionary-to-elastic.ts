import fs from "fs";
import { pipeline } from "stream";
import readline from "readline";
import * as jsdom from "jsdom";
import { client } from "src/helper/elastic";
import zlib from "zlib";

import { removeWhiteSpaceFromXML } from "src/helper/xml";
import { downloadDictionary } from "src/helper/dictionary";

export const writeDictionaryToElasticSearch = async () => {
  const dom = new jsdom.JSDOM();
  const serializer = new dom.window.XMLSerializer();
  const dictionaryGzipFile = `${new Date().getTime()}.gzip`;
  const jsonEntriesFile = `${new Date().getTime()}.json`;
  await downloadDictionary(dictionaryGzipFile);
  const inputStream = fs.createReadStream(dictionaryGzipFile);
  const outputStream = fs.createWriteStream(jsonEntriesFile);
  const readLines = async () => {
    const lines = readline.createInterface({
      input: fs.createReadStream(jsonEntriesFile),
    });

    let index = 0;

    for await (const line of lines) {
      const { _index, _id, _source } = JSON.parse(line);
      const modifiedXML = removeWhiteSpaceFromXML(_source.xml);
      const xml = serializer.serializeToString(modifiedXML.documentElement);

      if (index % 1000 === 0) {
        console.log(`index = ${index}`);
      }

      await client.index({
        id: _id,
        index: _index,
        body: {
          xml,
        },
      });

      index++;
    }

    fs.unlink(jsonEntriesFile, (e) => {
      if (e) {
        console.error(e);
      }
    });
  };

  pipeline(inputStream, zlib.createGunzip(), outputStream, (e) => {
    if (e) {
      console.error(e);
      return;
    }

    readLines();

    fs.unlink(dictionaryGzipFile, (e) => {
      if (e) {
        console.error(e);
      }
    });
  });
};
