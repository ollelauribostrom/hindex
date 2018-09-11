#! /usr/bin/env node

import path from 'path';
import hindex from '../hindex';
import { version } from '../../package.json';
import { readConfigFile } from '../utils/config';
import * as log from '../utils/logger';

export async function run(flags) {
  if (flags.version) {
    log.info(version);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
    return;
  }
  try {
    const configFilePath = path.join(process.cwd(), flags.configFilePath || 'hindex.config.json');
    const config = await readConfigFile(configFilePath);
    if (flags.debug) {
      log.info(`Using config: ${JSON.stringify(config)}`);
    } else {
      log.info(`Using config from: ${configFilePath}`);
    }
    const result = hindex(config);
    log.success(`hindex successfully wrapped ${result.dir} ➜ ${result.index}`);
  } catch (err) {
    log.error(err.message);
  } finally {
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  }
}

export function parseArgv(argv) {
  const flags = {};
  if (argv.length > 2) {
    if (argv[2] === '-v' || argv[2] === '-V' || argv[2] === '--version') {
      flags.version = true;
    }
    if (argv[2] === '-d' || argv[2] === '--debug') {
      flags.debug = true;
    }
    if (argv[2].substr(0, 2) === '-c' || argv[2].substr(0, 8) === '--config') {
      const [, configFilePath] = argv[2].split('=');
      flags.configFilePath = configFilePath;
    }
  }
  return flags;
}

if (process.env.NODE_ENV !== 'test') {
  run(parseArgv(process.argv));
}
