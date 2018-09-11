import fs from 'fs';
import * as config from '../src/utils/config';

jest.mock('fs', () => {
  const MemoryFS = require('memory-fs');
  return new MemoryFS();
});

describe('Tests for config.js', () => {
  describe('readConfigFile', () => {
    it('should read the config file and return the parsed JSON data', async () => {
      fs.writeFileSync('/hindex.config.json', '{"a": 1, "b": 2}');
      await expect(config.readConfigFile('/hindex.config.json')).resolves.toEqual({ a: 1, b: 2 });
    });
    it('should throw an error if the config file contains invalid JSON data', async () => {
      fs.writeFileSync('/hindex.config.json', '{a: 1}');
      const errorMessage = 'Config file contains invalid JSON: /hindex.config.json';
      await expect(config.readConfigFile('/hindex.config.json')).rejects.toThrowError(errorMessage);
    });
    it('should handle EACCES errors', async () => {
      const readFile = jest.spyOn(fs, 'readFile');
      readFile.mockImplementation((_, cb) => cb({ code: 'EACCES' }));
      const errorMessage = 'Permission denied: ./hindex.config.json';
      await expect(config.readConfigFile('./hindex.config.json')).rejects.toThrowError(errorMessage);
      readFile.mockRestore();
    });
    it('should handle ENOENT errors', async () => {
      const readFile = jest.spyOn(fs, 'readFile');
      readFile.mockImplementation((_, cb) => cb({ code: 'ENOENT' }));
      const errorMessage = 'Config file not found: ./hindex.config.json';
      await expect(config.readConfigFile('./hindex.config.json')).rejects.toThrowError(errorMessage);
      readFile.mockRestore();
    });
    it('should handle general errors', async () => {
      const readFile = jest.spyOn(fs, 'readFile');
      readFile.mockImplementation((_, cb) => cb({ code: '' }));
      const errorMessage = 'Error while reading config file: ./hindex.config.json';
      await expect(config.readConfigFile('./hindex.config.json')).rejects.toThrowError(errorMessage);
      readFile.mockRestore();
    });
  });
  describe('parseConfig', () => {
    it('should throw an error for invalid options', () => {
      const options = { someOption: true };
      expect(() => config.parseConfig(options)).toThrowError('Invalid config option: someOption');
    });
    it('should throw an error for options using the wrong type', () => {
      const options = { exclude: '.git' };
      expect(() => config.parseConfig(options)).toThrowError('Option exclude must be of type: Array');
    });
    it('should use the default option for any property that is not set', () => {
      const options = { baseDir: './src' };
      expect(config.parseConfig(options)).toEqual({
        baseDir: './src',
        title: 'hindex',
        exclude: ['.git'],
        categories: [],
        categoryPrefix: '',
        categoryPostfix: '',
        hideCategoryNames: false,
      });
    });
  });
});
