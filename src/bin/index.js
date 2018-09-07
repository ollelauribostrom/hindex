#! /usr/bin/env node

import path from 'path';
import hindex from '../hindex';
import { version } from '../../package.json';
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
  if (process.argv[2] === '-v' || process.argv[2] === '-V' || process.argv[2] === '--version') {
    console.log(version);
    process.exit(0);
  }

  run(process.argv);
}
