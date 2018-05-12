#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import hindex from '../hindex';

let config;

try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'hindex.config.json')));
} catch (err) {
  config = {
    exclude: [],
    categories: null,
    title: 'Hindex',
  };
}

hindex({
  baseDir: process.cwd(),
  exclude: config.exclude,
  categories: config.categories,
  title: config.title,
});

process.exit(0);
