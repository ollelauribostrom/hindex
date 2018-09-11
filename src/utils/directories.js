import fs from 'fs';
import path from 'path';

export function isDirectory(entry, baseDir) {
  return fs.statSync(`${baseDir}/${entry}`).isDirectory();
}

export function excludeDirectories(dir, exclude) {
  return !exclude.includes(dir);
}

export function hasHTMLIndexFile(dir, baseDir) {
  return fs.existsSync(`${baseDir}${path.sep}${dir}${path.sep}index.html`);
}

export function getDirectories(config) {
  try {
    return fs.readdirSync(config.baseDir)
      .filter(entry => isDirectory(entry, config.baseDir))
      .filter(dir => excludeDirectories(dir, config.exclude))
      .filter(dir => hasHTMLIndexFile(dir, config.baseDir));
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
