#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import hindex from '../hindex';

let config;
const defaultConfig = {
  baseDir: process.cwd(),
  exclude: [],
  categories: null,
  title: 'Hindex',
};

try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'hindex.config.json')));
} catch (err) {
  config = {};
  console.log('No config file found, using default');
}

hindex(Object.assign({}, defaultConfig, config));
process.exit(0);
