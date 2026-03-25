import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Graph2 } from './graph2';

describe('Graph2', () => {
  let component: Graph2;
  let fixture: ComponentFixture<Graph2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Graph2],
    }).compileComponents();

    fixture = TestBed.createComponent(Graph2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
