import { TestBed, inject } from '@angular/core/testing';

import { AngularFirestype } from './angular-firestype.service';

describe('AngularFirestype', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AngularFirestype]
    });
  });

  it('should be created', inject([AngularFirestype], (service: AngularFirestype) => {
    expect(service).toBeTruthy();
  }));
});
