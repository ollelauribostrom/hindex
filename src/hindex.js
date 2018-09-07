import copyTemplates from './utils/templates';
import { parseConfig } from './utils/config';

export default function (config) {
  return copyTemplates(parseConfig(config));
}
