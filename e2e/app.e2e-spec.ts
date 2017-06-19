import { M4SketcherPage } from './app.po';

describe('m4-sketcher App', () => {
  let page: M4SketcherPage;

  beforeEach(() => {
    page = new M4SketcherPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
