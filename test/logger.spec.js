import * as log from '../src/utils/logger';

jest.mock('chalk', () => ({
  red: arg => `RED:${arg}`,
  green: arg => `GREEN:${arg}`,
  blue: arg => `BLUE:${arg}`,
}));

describe('Tests for logger.js', () => {
  it('should be able to log an error', () => {
    const logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(() => {});
    log.error('message');
    expect(logSpy).toHaveBeenCalledWith('RED:✖ message');
    logSpy.mockRestore();
  });
  it('should be able to log a success message', () => {
    const logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(() => {});
    log.success('message');
    expect(logSpy).toHaveBeenCalledWith('GREEN:✔ message');
    logSpy.mockRestore();
  });
  it('should be able to log a info message', () => {
    const logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(() => {});
    log.info('message');
    expect(logSpy).toHaveBeenCalledWith('BLUE:ℹ message');
    logSpy.mockRestore();
  });
});
