import fs from "fs/promises";
import yaml from "js-yaml";

export const loadSwaggerDocument = async (path) => {
  try {
    const yamlFile = await fs.readFile(path, "utf8");
    return yaml.load(yamlFile);
  } catch (error) {
    console.error(`Error loading swagger doc: ${error}`);
    process.exit(1);
  }
};
