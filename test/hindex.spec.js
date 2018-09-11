import hindex from '../src/hindex';
import * as config from '../src/utils/config';
import * as templates from '../src/utils/templates';

describe('Test for hindex', () => {
  it('should call copyTemplates with a parsed version of the provided config', () => {
    const mockConfig = { a: 1, b: 2 };
    const copyTemplatesSpy = jest.spyOn(templates, 'copyTemplates');
    const parseConfigSpy = jest.spyOn(config, 'parseConfig');
    copyTemplatesSpy.mockImplementation(() => {});
    parseConfigSpy.mockImplementation(configObj => configObj);
    hindex(mockConfig);
    expect(parseConfigSpy).toHaveBeenCalledWith(mockConfig);
    expect(copyTemplatesSpy).toHaveBeenCalledWith(mockConfig);
    copyTemplatesSpy.mockRestore();
    parseConfigSpy.mockRestore();
  });
});
