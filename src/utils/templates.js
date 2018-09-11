import fs from 'fs-extra';
import path from 'path';
import { getDirectories } from './directories';

export function ensurePositive(n) {
  return n < 0 ? 0 : n;
}

export function removeCategoryName(dirName, categoryName, config) {
  if (config && config.hideCategoryNames) {
    const pre = config.categoryPrefix.length;
    const post = config.categoryPostfix.length;
    const i = dirName.indexOf(categoryName);
    const a = dirName.slice(0, ensurePositive(i - pre));
    const b = dirName.slice(ensurePositive(i + categoryName.length + post));
    return a + b;
  }
  return dirName;
}

export function capitalize(word) {
  return word.replace(/\b\w/g, l => l.toUpperCase());
}

export function inCategory(directory, category) {
  return directory.toLowerCase().includes(category.toLowerCase());
}

export function getLinkHTML(dir, category, config) {
  return `
    <li class="link" data-url="${dir}">
      ${removeCategoryName(dir, category, config)}
    </li>
  `;
}

export function getCategoryHTML(category, links) {
  return `
    <ul>
      <h5>${capitalize(category)}</h5>
      ${links}
    </ul>
  `;
}

export function getCategoryLinksHTML(category, directories, config) {
  return directories
    .filter(dir => inCategory(dir, category))
    .map(dir => getLinkHTML(dir, category, config))
    .join('');
}

export function getLinksHTML(config, directories) {
  const html = [];
  if (config.categories.length > 0) {
    config.categories.forEach((category) => {
      const categoryLinksHTML = getCategoryLinksHTML(category, directories, config);
      html.push(getCategoryHTML(category, categoryLinksHTML));
    });
  } else {
    const links = directories.map(dir => getLinkHTML(dir)).join('');
    html.push(`<ul>${links}</ul>`);
  }
  return html.join('');
}

export function copyHTMLIndex(config, linksHTML) {
  const dest = path.resolve(config.baseDir, 'index.html');
  try {
    let html = fs.readFileSync(path.resolve(__dirname, '../../templates/index.html'), 'utf8');
    html = html.replace('%TITLE%', config.title);
    html = html.replace('%TITLE%', config.title);
    html = html.replace('%LINKS%', linksHTML);
    fs.writeFileSync(dest, html);
  } catch (err) {
    switch (err.code) {
      case 'EACCES':
        err.message = `Permission denied while writing to: ${dest}`;
        break;
      case 'ENOENT':
        err.message = `Path does not exist: ${dest}`;
        break;
      default:
        err.message = `Error while writing to: ${dest}`;
    }
    throw err;
  }
  return dest;
}

export function copyAssets(config) {
  const dest = path.resolve(config.baseDir);
  try {
    const assetsFolder = path.resolve(__dirname, '../../templates/assets');
    fs.copySync(assetsFolder, dest);
  } catch (err) {
    switch (err.code) {
      case 'EACCES':
        err.message = `Permission denied while writing to: ${dest}`;
        break;
      case 'ENOENT':
        err.message = `Path does not exist: ${dest}`;
        break;
      default:
        err.message = `Error while writing to: ${dest}`;
    }
    throw err;
  }
}

export function copyTemplates(config) {
  const HTMLIndexPath = copyHTMLIndex(config, getLinksHTML(config, getDirectories(config)));
  copyAssets(config);
  return {
    dir: path.basename(config.baseDir),
    index: `file://${HTMLIndexPath}`,
  };
}
