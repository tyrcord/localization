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
      processAndSortJSONFile(filePath);
    }
  }
}

function processAndSortJSONFile(filePath) {
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

    // Read the JSON data from the file
    const data = fs.readFileSync(filePath, "utf8");
    let jsonData = JSON.parse(data);

    // Replace spaces before punctuation
    jsonData = replaceSpacesBeforePunctuation(jsonData);

    // Capitalize first letter of sentences
    jsonData = capitalizeFirstLetterOfSentences(jsonData);

    // Sort keys alphabetically
    jsonData = sortKeysAlphabetically(jsonData);

    // Write the sorted JSON data to the file
    jsonData = JSON.stringify(jsonData, null, 2) + "\n";
    fs.writeFileSync(filePath, sortedData, "utf8");

    console.log(`Sorted keys in file: ${filePath}`);
  } catch (error) {
    console.error(`Error sorting or renaming JSON file: ${filePath}\n`, error);
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

function capitalizeFirstLetterOfSentences(jsonData) {
  const sentenceBoundaryRegex = /(\.|\?|!)\s+([a-z])/g;

  if (typeof jsonData === "string") {
    return jsonData.replace(
      sentenceBoundaryRegex,
      (match, p1, p2) => p1 + " " + p2.toUpperCase()
    );
  }

  if (typeof jsonData !== "object" || jsonData === null) {
    return jsonData;
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(capitalizeFirstLetterOfSentences);
  }

  const updatedObject = {};

  for (const key in jsonData) {
    updatedObject[key] = capitalizeFirstLetterOfSentences(jsonData[key]);
  }

  return updatedObject;
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

try {
  main();
} catch (error) {
  console.error("An error occurred:", error);
  process.exit(1);
}
