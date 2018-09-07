#! /usr/bin/env node

import path from 'path';
import hindex from '../hindex';
import { readConfigFile } from '../utils/config';
import * as log from '../utils/logger';

export async function run(argv) {
  try {
    const configFilePath = path.join(process.cwd(), 'hindex.config.json');
    const config = await readConfigFile(configFilePath);
    if (argv[2] === '--debug') {
      log.info(`Using config: ${JSON.stringify(config)}`);
    } else {
      log.info(`Using config from: ${configFilePath}`);
    }
    const result = hindex(config);
    log.success(`hindex successfully wrapped ${result.dir} ➜ ${result.index}`);
  } catch (err) {
    log.error(err.message);
  } finally {
    process.exit(0);
  }
}

if (process.env.NODE_ENV !== 'test') {
  run(process.argv);
}
