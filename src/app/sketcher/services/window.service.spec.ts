import { TestBed, inject } from '@angular/core/testing';

import { WindowRef } from './window.service';

describe('WindowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowRef]
    });
  });

  it('should ...', inject([WindowRef], (service: WindowRef) => {
    expect(service).toBeTruthy();
  }));
});
