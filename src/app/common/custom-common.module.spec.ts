import { CustomCommonModule } from './custom-common.module';

describe('CustomCommonModule', () => {
  let customCommonModule: CustomCommonModule;

  beforeEach(() => {
    customCommonModule = new CustomCommonModule();
  });

  it('should create an instance', () => {
    expect(customCommonModule).toBeTruthy();
  });
});
