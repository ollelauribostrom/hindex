import fs from 'fs';
import path from 'path';

export function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

export function excludeDirectories(dir, exclude) {
  return !exclude.includes(dir);
}

export function hasHTMLIndexFile(dir) {
  return fs.existsSync(`${dir}${path.sep}index.html`);
}

export default function getDirectories(config) {
  try {
    return fs.readdirSync(config.baseDir)
      .filter(isDirectory)
      .filter(dir => excludeDirectories(dir, config.exclude))
      .filter(hasHTMLIndexFile);
  } catch (err) {
    switch (err.code) {
      case 'EACCES':
        err.message = `Permission denied while reading directory: ${config.baseDir}`;
        break;
      case 'ENOENT':
        err.message = `Directory not found: ${config.baseDir}`;
        break;
      default:
        err.message = `Error while reading directory: ${config.baseDir}`;
    }
    throw err;
  }
}
