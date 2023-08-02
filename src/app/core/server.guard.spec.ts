import { TestBed } from '@angular/core/testing';

import { ServerGuard } from './server.guard';

describe('ServerGuard', () => {
  let guard: ServerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ServerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
