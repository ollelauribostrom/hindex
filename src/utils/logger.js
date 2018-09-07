import chalk from 'chalk';

export function error(message) {
  console.log(`${chalk.red('✖')} ${message}`);
}

export function success(message) {
  console.log(`${chalk.green('✔')} ${message}`);
}

export function info(message) {
  console.log(`${chalk.blue('ℹ')} ${message}`);
}
