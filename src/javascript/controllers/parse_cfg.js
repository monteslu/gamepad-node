import xml2js from 'xml2js';
import fs from 'fs/promises';

export default function parseCfg(cfgFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(cfgFile, 'utf8')
      .then((xmlFile) => {
        const parser = new xml2js.Parser();
        parser.parseString(xmlFile, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          const { inputList } = result;
          const outputList = inputList.inputConfig.map((ic) => {
            return {
              name: ic['$'].deviceName.trim(), // no idea why some have trailing spaces
              type: ic['$'].type,
              guid: ic['$'].deviceGUID,
              input: ic.input.map((i) => {
                return i['$'];
              }),
            };
          });
          resolve(outputList);
        });
      })
      .catch(reject);
  });
}

