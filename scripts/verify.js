const fs = require("fs");
const path = require("path");

const referenceLanguage = "en";
const excludeDirectories = ["scripts", ".git", ".github", "node_modules"];

function getKeysFromJSONFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return extractKeys(data);
}

function extractKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      keys.push(...extractKeys(value, `${prefix}${key}.`));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
}

function verifyLocalizationForModule(moduleName) {
  const moduleDirectoryPath = path.join(process.cwd(), moduleName);

  // Load the reference keys
  const referenceFilePath = path.join(
    moduleDirectoryPath,
    `${referenceLanguage}.json`
  );

  if (!fs.existsSync(referenceFilePath)) {
    console.warn(
      `No ${referenceLanguage}.json found for module: ${moduleName}`
    );

    return;
  }

  const referenceKeys = getKeysFromJSONFile(referenceFilePath);

  // Read all files in the module directory
  const files = fs.readdirSync(moduleDirectoryPath);

  // Filter out only .json files and exclude the reference file
  const otherLangFiles = files.filter(
    (file) => file.endsWith(".json") && file !== `${referenceLanguage}.json`
  );

  let hasErrors = false;

  for (const langFile of otherLangFiles) {
    const langKeys = getKeysFromJSONFile(
      path.join(moduleDirectoryPath, langFile)
    );

    const missingKeys = referenceKeys.filter((key) => !langKeys.includes(key));
    const extraKeys = langKeys.filter((key) => !referenceKeys.includes(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      console.log(`Issues found in ${langFile} for module: ${moduleName}`);
      hasErrors = true;

      if (missingKeys.length > 0) {
        console.log(`\tMissing keys: ${missingKeys.join(", ")}`);
      }

      if (extraKeys.length > 0) {
        console.log(`\tExtra keys: ${extraKeys.join(", ")}`);
      }
    }
  }

  return hasErrors;
}

function main() {
  const directories = fs
    .readdirSync(process.cwd(), { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() && !excludeDirectories.includes(dirent.name)
    )
    .map((dirent) => dirent.name);

  let hasErrors = false;

  for (const moduleName of directories) {
    const errorsFound = verifyLocalizationForModule(moduleName);

    if (errorsFound) hasErrors = true;
  }

  return hasErrors;
}

try {
  const hasErrors = main();

  if (hasErrors) {
    console.error("Errors found in translations files");
    process.exit(1);
  } else {
    console.log("Translations files are valid");
  }
} catch (error) {
  console.error("An error occurred:", error);
  process.exit(1);
}
