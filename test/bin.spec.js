import { run, parseArgv } from '../src/bin';
import { version } from '../package.json';
import hindex from '../src/hindex';
import * as config from '../src/utils/config';
import * as log from '../src/utils/logger';

jest.mock('../src/hindex', () => jest.fn(() => ({
  dir: 'dir',
  index: 'index',
})));

function spyOnLog() {
  const success = jest.spyOn(log, 'success');
  const info = jest.spyOn(log, 'info');
  const error = jest.spyOn(log, 'error');
  success.mockImplementation(() => {});
  info.mockImplementation(() => {});
  error.mockImplementation(() => {});
  const restore = () => {
    success.mockRestore();
    info.mockRestore();
    error.mockRestore();
  };
  return {
    success,
    info,
    error,
    restore,
  };
}

describe('Tests for bin/index.js', () => {
  describe('run', () => {
    it('should read config from hindex.config.json and invoke hindex', async () => {
      const { restore } = spyOnLog();
      const mockConfig = { a: 1, b: 2 };
      const readConfigFileSpy = jest.spyOn(config, 'readConfigFile');
      readConfigFileSpy.mockImplementation(() => mockConfig);
      await run(['', '']);
      expect(readConfigFileSpy).toHaveBeenCalledWith(expect.stringContaining('/hindex/hindex.config.json'));
      expect(hindex).toHaveBeenCalledWith(mockConfig);
      readConfigFileSpy.mockRestore();
      restore();
    });
    it('should log information about the process', async () => {
      const { info, success, restore } = spyOnLog();
      const readConfigFileSpy = jest.spyOn(config, 'readConfigFile');
      readConfigFileSpy.mockImplementation(() => {});
      await run(['', '']);
      expect(info).toHaveBeenCalledWith(expect.stringContaining('Using config from:'));
      expect(success).toHaveBeenCalledWith('hindex successfully wrapped dir ➜ index');
      readConfigFileSpy.mockRestore();
      restore();
    });
    it('should handle the debug flag', async () => {
      const { info, restore } = spyOnLog();
      const mockConfig = { a: 1, b: 2 };
      const readConfigFileSpy = jest.spyOn(config, 'readConfigFile');
      readConfigFileSpy.mockImplementation(() => mockConfig);
      await run({ debug: true });
      expect(info).toHaveBeenCalledWith('Using config: {"a":1,"b":2}');
      readConfigFileSpy.mockRestore();
      restore();
    });
    it('should handle the version flag', async () => {
      const { info, restore } = spyOnLog();
      await run({ version: true });
      expect(info).toHaveBeenCalledWith(version);
      restore();
    });
    it('should handle errors', async () => {
      const { error, restore } = spyOnLog();
      const readConfigFileSpy = jest.spyOn(config, 'readConfigFile');
      readConfigFileSpy.mockImplementation(() => {});
      hindex.mockImplementation(() => { throw new Error('hindex error'); });
      await run(['', '']);
      expect(error).toHaveBeenCalledWith('hindex error');
      readConfigFileSpy.mockRestore();
      restore();
    });
  });
  describe('parseArgv', () => {
    it('should correctly parse the version flag', () => {
      expect(parseArgv(['', '', '-v'])).toEqual({ version: true });
      expect(parseArgv(['', '', '-V'])).toEqual({ version: true });
      expect(parseArgv(['', '', '--version'])).toEqual({ version: true });
    });
    it('should correctly parse the debug flag', () => {
      expect(parseArgv(['', '', '-d'])).toEqual({ debug: true });
      expect(parseArgv(['', '', '--debug'])).toEqual({ debug: true });
    });
    it('should correctly parse the config flag', () => {
      expect(parseArgv(['', '', '-c=path'])).toEqual({ configFilePath: 'path' });
      expect(parseArgv(['', '', '--config=path'])).toEqual({ configFilePath: 'path' });
    });
  });
});
