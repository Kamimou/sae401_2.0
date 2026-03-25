import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Graph3 } from './graph3';

describe('Graph3', () => {
  let component: Graph3;
  let fixture: ComponentFixture<Graph3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Graph3],
    }).compileComponents();

    fixture = TestBed.createComponent(Graph3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
