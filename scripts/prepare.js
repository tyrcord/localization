#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function deepSearchJSONFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      deepSearchJSONFiles(filePath);
    } else if (path.extname(file) === ".json") {
      sortAndRenameJSONFile(filePath);
    }
  }
}

function replaceSpacesBeforePunctuation(jsonData) {
  const regex = / (\.|,|!|\?|:|;)/g; // Matches a space followed by specific punctuation

  if (typeof jsonData === "string") {
    return jsonData.replace(regex, "\u00A0$1");
  }

  if (typeof jsonData !== "object" || jsonData === null) {
    return jsonData;
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(replaceSpacesBeforePunctuation);
  }

  const updatedObject = {};

  for (const key in jsonData) {
    updatedObject[key] = replaceSpacesBeforePunctuation(jsonData[key]);
  }

  return updatedObject;
}

function sortAndRenameJSONFile(filePath) {
  try {
    const fileName = path.basename(filePath);

    // Check if the file is zh_Hans.json
    if (fileName === "zh_Hans.json") {
      const newFilePath = path.join(path.dirname(filePath), "zh.json");

      // Rename the file
      fs.renameSync(filePath, newFilePath);
      filePath = newFilePath; // Update the filePath to the renamed file
      console.log(`Renamed file: ${filePath}`);
    }

    const data = fs.readFileSync(filePath, "utf8");
    let jsonData = JSON.parse(data);

    jsonData = replaceSpacesBeforePunctuation(jsonData);

    const sortedJsonData = sortKeysAlphabetically(jsonData);
    const sortedData = JSON.stringify(sortedJsonData, null, 2) + "\n";

    fs.writeFileSync(filePath, sortedData, "utf8");
    console.log(`Sorted keys in file: ${filePath}`);
  } catch (error) {
    console.error(`Error sorting or renaming JSON file: ${filePath}\n`, error);
  }
}

function sortKeysAlphabetically(jsonData) {
  if (typeof jsonData !== "object" || jsonData === null) {
    return jsonData;
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(sortKeysAlphabetically);
  }

  const sortedObject = {};
  const sortedKeys = Object.keys(jsonData).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    sortedObject[key] = sortKeysAlphabetically(jsonData[key]);
  }

  return sortedObject;
}

function main() {
  const currentDir = process.cwd();
  deepSearchJSONFiles(currentDir);
}

main();
