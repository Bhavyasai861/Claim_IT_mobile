import { TestBed } from '@angular/core/testing';

import { ClaimitService } from './claimit.service';

describe('ClaimitService', () => {
  let service: ClaimitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
