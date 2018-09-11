import fs from 'fs-extra';
import * as templates from '../src/utils/templates';

jest.mock('fs-extra', () => {
  const MemoryFS = require('memory-fs');
  const mockFs = new MemoryFS();
  mockFs.copySync = jest.fn();
  return mockFs;
});

function trimWhitespace(str) {
  return str.replace(/\s/g, '');
}

describe('Tests for templates.js', () => {
  describe('ensurePositive', () => {
    it('should make sure that at least 0 is returned', () => {
      expect([-1, 0, 1].map(templates.ensurePositive)).toEqual([0, 0, 1]);
    });
  });
  describe('removeCategoryName', () => {
    it('should remove the category name if specified in the config', () => {
      const dirName = 'coverage2018-08-12';
      const categoryName = 'coverage';
      const config = { hideCategoryNames: true, categoryPrefix: '', categoryPostfix: '' };
      expect(templates.removeCategoryName(dirName, categoryName, config)).toEqual('2018-08-12');
    });
    it('should remove any categoryPrefix if specified in the config', () => {
      const dirName = '2018-08-12-coverage';
      const categoryName = 'coverage';
      const config = { hideCategoryNames: true, categoryPrefix: '-', categoryPostfix: '' };
      expect(templates.removeCategoryName(dirName, categoryName, config)).toEqual('2018-08-12');
    });
    it('should remove any categoryPostfix if specified in the config', () => {
      const dirName = 'coverage-2018-08-12';
      const categoryName = 'coverage';
      const config = { hideCategoryNames: true, categoryPrefix: '', categoryPostfix: '-' };
      expect(templates.removeCategoryName(dirName, categoryName, config)).toEqual('2018-08-12');
    });
    it('should remove both categoryPrefix and categoryPostfix if specified in the config', () => {
      const dirName = 'test**coverage--2018-08-12';
      const categoryName = 'coverage';
      const config = { hideCategoryNames: true, categoryPostfix: '--', categoryPrefix: '**' };
      expect(templates.removeCategoryName(dirName, categoryName, config)).toEqual('test2018-08-12');
    });
    it('should to nothing if config.hideCategoryNames = false', () => {
      const dirName = 'coverage-2018-08-12';
      const categoryName = 'coverage';
      const config = { hideCategoryNames: false };
      expect(templates.removeCategoryName(dirName, categoryName, config)).toEqual(dirName);
    });
  });
  describe('capitalize', () => {
    it('should capitalize the first letter of the string', () => {
      expect(templates.capitalize('hello')).toEqual('Hello');
    });
  });
  describe('inCategory', () => {
    it('should true if the directory name includes the category name', () => {
      expect(templates.inCategory('coverage-2018-08-12', 'coverage')).toEqual(true);
    });
    it('should false if the directory name does not include the category name', () => {
      expect(templates.inCategory('2018-08-12', 'coverage')).toEqual(false);
    });
  });
  describe('getLinkHTML', () => {
    it('should return the correct HTML', () => {
      const html = templates.getLinkHTML('coverage-2018-08-12', 'coverage');
      expect(trimWhitespace(html)).toEqual(trimWhitespace(`
        <li class="link" data-url="coverage-2018-08-12">
          coverage-2018-08-12
        </li>
      `));
    });
  });
  describe('getCategoryHTML', () => {
    it('should return the correct HTML', () => {
      const html = templates.getCategoryHTML('coverage', 'links');
      expect(trimWhitespace(html)).toEqual(trimWhitespace(`
        <ul>
          <h5>Coverage</h5>
          links
        </ul>
      `));
    });
  });
  describe('getCategoryLinksHTML', () => {
    it('should return the correct HTML', () => {
      const category = 'coverage';
      const directories = [
        'coverage-2018-08-16',
        'mutation-2018-08-16',
      ];
      const html = templates.getCategoryLinksHTML(category, directories);
      expect(trimWhitespace(html)).toEqual(trimWhitespace(`
        <li class="link" data-url="coverage-2018-08-16">
          coverage-2018-08-16
        </li>
      `));
    });
  });
  describe('getLinksHTML', () => {
    it('should return the correct HTML', () => {
      const config = { categories: ['coverage'] };
      const directories = [
        'coverage-2018-08-16',
        'mutation-2018-08-16',
      ];
      const html = templates.getLinksHTML(config, directories);
      expect(trimWhitespace(html)).toEqual(trimWhitespace(`
        <ul>
          <h5>Coverage</h5>
          <li class="link" data-url="coverage-2018-08-16">
            coverage-2018-08-16
          </li>
        </ul>
      `));
    });
    it('should return the correct HTML (no categories)', () => {
      const config = { categories: [] };
      const directories = [
        'coverage-2018-08-16',
        'mutation-2018-08-16',
      ];
      const html = templates.getLinksHTML(config, directories);
      expect(trimWhitespace(html)).toEqual(trimWhitespace(`
        <ul>
          <li class="link" data-url="coverage-2018-08-16">
            coverage-2018-08-16
          </li>
          <li class="link" data-url="mutation-2018-08-16">
            mutation-2018-08-16
          </li>
        </ul>
      `));
    });
  });
  describe('copyHTMLIndex', () => {
    it('should fill the template index.html and copy it to the baseDir', () => {
      const config = { baseDir: '/base', title: 'Reports' };
      const links = 'links-html';
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
      const html = '<title>%TITLE%</title><h1 class="title">%TITLE%</h1><div class="content">%LINKS%</div>';
      fs.mkdirpSync('/base');
      readFileSyncSpy.mockImplementation(() => html);
      const dest = templates.copyHTMLIndex(config, links);
      readFileSyncSpy.mockRestore();
      const filled = fs.readFileSync('/base/index.html', 'utf8');
      expect(filled).toEqual('<title>Reports</title><h1 class="title">Reports</h1><div class="content">links-html</div>');
      expect(dest).toEqual('/base/index.html');
    });
    it('should handle EACCES errors', () => {
      const config = { baseDir: '/base' };
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
      const error = new Error();
      error.code = 'EACCES';
      readFileSyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyHTMLIndex(config)).toThrowError('Permission denied while writing to: /base');
      readFileSyncSpy.mockRestore();
    });
    it('should handle ENOENT errors', () => {
      const config = { baseDir: '/base' };
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
      const error = new Error();
      error.code = 'ENOENT';
      readFileSyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyHTMLIndex(config)).toThrowError('Path does not exist: /base');
      readFileSyncSpy.mockRestore();
    });
    it('should handle general errors', () => {
      const config = { baseDir: '/base' };
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
      const error = new Error();
      readFileSyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyHTMLIndex(config)).toThrowError('Error while writing to: /base');
      readFileSyncSpy.mockRestore();
    });
  });
  describe('copyAssets', () => {
    it('should copy the assets to the baseDir', () => {
      const config = { baseDir: '/base', title: 'Reports' };
      const copySyncSpy = jest.spyOn(fs, 'copySync');
      templates.copyAssets(config);
      expect(copySyncSpy).toHaveBeenCalledWith(expect.stringContaining('templates/assets'), '/base');
    });
    it('should handle EACCES errors', () => {
      const config = { baseDir: '/base' };
      const copySyncSpy = jest.spyOn(fs, 'copySync');
      const error = new Error();
      error.code = 'EACCES';
      copySyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyAssets(config)).toThrowError('Permission denied while writing to: /base');
      copySyncSpy.mockRestore();
    });
    it('should handle ENOENT errors', () => {
      const config = { baseDir: '/base' };
      const copySyncSpy = jest.spyOn(fs, 'copySync');
      const error = new Error();
      error.code = 'ENOENT';
      copySyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyAssets(config)).toThrowError('Path does not exist: /base');
      copySyncSpy.mockRestore();
    });
    it('should handle general errors', () => {
      const config = { baseDir: '/base' };
      const copySyncSpy = jest.spyOn(fs, 'copySync');
      const error = new Error();
      copySyncSpy.mockImplementation(() => { throw error; });
      expect(() => templates.copyAssets(config)).toThrowError('Error while writing to: /base');
      copySyncSpy.mockRestore();
    });
  });
});
