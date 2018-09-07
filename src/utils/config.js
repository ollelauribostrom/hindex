import fs from 'fs';

export const baseConfig = {
  baseDir: process.cwd(),
  title: 'hindex',
  exclude: ['.git'],
  categories: [],
  categoryPrefix: '',
  categoryPostfix: '',
  hideCategoryNames: false,
};

export const configOptions = {
  baseDir: String,
  title: String,
  exclude: Array,
  categories: Array,
  categoryPrefix: String,
  categoryPostfix: String,
  hideCategoryNames: Boolean,
};

export function readConfigFile(configFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(configFilePath, (err, data) => {
      if (err) {
        switch (err.code) {
          case 'EACCES':
            reject(new Error(`Permission denied: ${configFilePath}`));
            break;
          case 'ENOENT':
            reject(new Error(`Config file not found: ${configFilePath}`));
            break;
          default:
            reject(new Error(`Error while reading config file: ${configFilePath}`));
        }
      }
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error(`Config file contains invalid JSON: ${configFilePath}`));
      }
    });
  });
}

export function parseConfig(config) {
  for (const key in config) {
    if (!configOptions[key]) {
      throw new Error(`Invalid config option: ${key}`);
    }
    if (config[key].constructor !== configOptions[key]) {
      throw new Error(`Option ${key} must be of type: ${configOptions[key].name}`);
    }
  }
  return Object.assign({}, baseConfig, config);
}
