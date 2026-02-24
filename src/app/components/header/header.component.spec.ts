import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  const mockAuthService = {
    logout: jest.fn(),
  };

  const originalGetComputedStyle = window.getComputedStyle;

  beforeAll(() => {
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      getPropertyValue: () => '',
    } as any));
  });

  afterAll(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });

  const unauthSession = {
    token: null,
    userName: null,
    userEmail: null,
    userAvatarKey: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Profit AI title', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStateService, useValue: { session$: of(unauthSession) } },
        provideNoopAnimations(),
      ],
    });

    const title = screen.getByText('Profit AI');
    expect(title).toBeTruthy();
  });

  it('should show login and register links when not authenticated', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStateService, useValue: { session$: of(unauthSession) } },
        provideNoopAnimations(),
      ],
    });

    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Cadastrar')).toBeTruthy();
  });

  it('should show profile and logout button when authenticated', async () => {
    const authSession = {
      token: 'token',
      userName: 'Test User',
      userEmail: 'test@example.com',
      userAvatarKey: null
    };

    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStateService, useValue: { session$: of(authSession) } },
        provideNoopAnimations(),
      ],
    });

    expect(screen.getByText('Test User')).toBeTruthy();

    const trigger = screen.getByRole('button', { name: /abrir menu do usuário/i });
    await userEvent.click(trigger);

    expect(await screen.findByRole('menuitem', { name: /meu perfil/i })).toBeTruthy();
    expect(await screen.findByRole('menuitem', { name: /configurações/i })).toBeTruthy();
    expect(await screen.findByRole('menuitem', { name: /sair/i })).toBeTruthy();
  });
});

