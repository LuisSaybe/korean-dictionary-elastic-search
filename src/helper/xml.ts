import * as jsdom from "jsdom";

const dom = new jsdom.JSDOM();
const domParser = new dom.window.DOMParser();

const copyChildrenNodesWithoutWhiteSpace = (document) => {
  const clone = document.cloneNode();

  for (const child of document.childNodes) {
    const childCopy = copyChildrenNodesWithoutWhiteSpace(child);
    clone.appendChild(childCopy);

    if (childCopy.nodeValue) {
      childCopy.nodeValue = childCopy.nodeValue.trim();
    }
  }

  return clone;
};

export const removeWhiteSpaceFromXML = function (sourceXml: string) {
  const xmlDoc = domParser.parseFromString(sourceXml, "application/xml");
  return copyChildrenNodesWithoutWhiteSpace(xmlDoc);
};
