import fs from 'fs';
import * as directory from '../src/utils/directories';

jest.mock('fs', () => {
  const MemoryFS = require('memory-fs');
  return new MemoryFS();
});

describe('Tests for directories', () => {
  describe('isDirectory', () => {
    it('should return true if path is a directory', () => {
      fs.mkdirpSync('/src/a');
      expect(directory.isDirectory('a', '/src')).toEqual(true);
    });
    it('should return false if path is not a directory', () => {
      fs.mkdirpSync('/src/b');
      fs.writeFileSync('/src/b/file', 'content');
      expect(directory.isDirectory('file', '/src/b')).toEqual(false);
    });
  });
  describe('excludeDirectories', () => {
    it('should return false if directory should be excluded', () => {
      const exclude = ['.git'];
      expect(directory.excludeDirectories('.git', exclude)).toEqual(false);
    });
    it('should return true if directory should not be excluded', () => {
      const exclude = ['.git'];
      expect(directory.excludeDirectories('src', exclude)).toEqual(true);
    });
  });
  describe('hasHTMLIndexFile', () => {
    it('should return true if folder contains index.html', () => {
      fs.mkdirpSync('/src/a');
      fs.writeFileSync('/src/a/index.html', 'content');
      expect(directory.hasHTMLIndexFile('a', '/src')).toEqual(true);
    });
    it('should return false if folder does not contain index.html', () => {
      fs.mkdirpSync('/src/b');
      expect(directory.hasHTMLIndexFile('b', '/src')).toEqual(false);
    });
  });
  describe('getDirectories', () => {
    it('should return all non excluded directories with an index.html file', () => {
      fs.mkdirpSync('/src/.git');
      fs.mkdirpSync('/src/a');
      fs.mkdirpSync('/src/b');
      fs.mkdirpSync('/src/c');
      fs.writeFileSync('/src/a/index.html', 'content');
      fs.writeFileSync('/src/b/index.html', 'content');
      fs.writeFileSync('/src/LICENSE', 'content');
      expect(directory.getDirectories({ baseDir: '/src', exclude: ['git'] })).toEqual(['a', 'b']);
    });
    it('should handle EACCES errors', () => {
      const error = new Error();
      error.code = 'EACCES';
      const readdirSyncSpy = jest.spyOn(fs, 'readdirSync');
      readdirSyncSpy.mockImplementation(() => { throw error; });
      expect(() => directory.getDirectories({ baseDir: '/src' })).toThrowError('Permission denied while reading directory: /src');
      readdirSyncSpy.mockRestore();
    });
    it('should handle ENOENT errors', () => {
      const error = new Error();
      error.code = 'ENOENT';
      const readdirSyncSpy = jest.spyOn(fs, 'readdirSync');
      readdirSyncSpy.mockImplementation(() => { throw error; });
      expect(() => directory.getDirectories({ baseDir: '/src' })).toThrowError('Directory not found: /src');
      readdirSyncSpy.mockRestore();
    });
    it('should handle general errors', () => {
      const error = new Error();
      const readdirSyncSpy = jest.spyOn(fs, 'readdirSync');
      readdirSyncSpy.mockImplementation(() => { throw error; });
      expect(() => directory.getDirectories({ baseDir: '/src' })).toThrowError('Error while reading directory: /src');
      readdirSyncSpy.mockRestore();
    });
  });
});
