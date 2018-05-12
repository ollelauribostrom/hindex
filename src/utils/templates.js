import fs from 'fs-extra';
import path from 'path';
import getDirectories from './directories';

export function removeCategoryName(directory, category) {
  let dir = directory.replace(category, '').trim();
  if (dir[0] === '-') {
    dir = dir.replace('-', '');
  }
  return dir;
}

export function captialize(word) {
  return word.replace(/\b\w/g, l => l.toUpperCase());
}

export function getLink(baseDir, dir, category) {
  return `<li class="link" data-url="${baseDir}/${dir}">${removeCategoryName(dir, category)}</li>`;
}

export function inCategory(directory, category) {
  return directory.toLowerCase().includes(category.toLowerCase());
}

export function getLinks(config, directories) {
  const links = [];

  if (config.categories) {
    config.categories.forEach((category) => {
      const categoryLinks = directories
        .filter(dir => inCategory(dir, category))
        .map(dir => getLink(config.baseDir, dir, category))
        .join('');
      links.push(`
        <ul>
          <h5>${captialize(category)}</h5>
          ${categoryLinks}
        </ul>
      `);
    });
  } else {
    const allLinks = directories
      .map(dir => getLink(config.baseDir, dir))
      .join('');
    links.push(`<ul>${allLinks}</ul>`);
  }

  return links.join('');
}

export function copyIndexHtml(config, links) {
  let html = fs.readFileSync(path.resolve(__dirname, '../../templates/index.html'), 'utf8');
  html = html.replace('%TITLE%', config.title);
  html = html.replace('%TITLE%', config.title);
  html = html.replace('%LINKS%', links);
  fs.writeFileSync(path.resolve(config.baseDir, 'index.html'), html);
}

export function copyFiles(config) {
  const assetsFolder = path.resolve(__dirname, '../../templates/assets');
  const stylesFolder = path.resolve(__dirname, '../../templates/styles');
  fs.copySync(assetsFolder, path.join(config.baseDir, 'assets'));
  fs.copySync(stylesFolder, path.join(config.baseDir, 'styles'));
}

export default function copyTemplates(config) {
  copyIndexHtml(config, getLinks(config, getDirectories(config)));
  copyFiles(config);
}
