import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  const mockAuthService = {
    logout: jest.fn(),
  };

  const unauthSession = {
    token: null,
    userName: null,
    userEmail: null,
    userAvatar: null
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
      userAvatar: null
    };

    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStateService, useValue: { session$: of(authSession) } },
      ],
    });

    expect(screen.getByText('Perfil')).toBeTruthy();
    expect(screen.getByText('Sair')).toBeTruthy();
  });
});

