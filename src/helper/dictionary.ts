import * as https from "https";
import * as fs from "fs";

export function writeExcelFile(location: string) {
  const file = fs.createWriteStream(location);

  return new Promise((resolve, reject) => {
    https
      .get(
        "https://luissaybe.nyc3.digitaloceanspaces.com/seoul-latte/dictionary/716118.zip",
        function (response) {
          response.pipe(file);
          file.on("finish", function () {
            file.close();
            resolve();
          });
        }
      )
      .on("error", reject);
  });
}
