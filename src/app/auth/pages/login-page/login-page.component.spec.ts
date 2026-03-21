import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import LoginPageComponent from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
  });

  it('should render the logo above the header using z-[101]', () => {
    const logoWrapper: HTMLElement = fixture.nativeElement.querySelector('img[alt="Finco Logo"]').parentElement;
    expect(logoWrapper.classList).toContain('z-[101]');
    expect(logoWrapper.classList).toContain('relative');
  });
});
