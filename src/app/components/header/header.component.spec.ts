import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HeaderComponent', () => {
  const mockAuthService = {
    isAuthenticated: jest.fn(),
    getUserName: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getUserName.mockReturnValue(null);
  });

  it('should render Profit AI title', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
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
      ],
    });

    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Cadastrar')).toBeTruthy();
  });

  it('should show profile and logout button when authenticated', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getUserName.mockReturnValue('Test User');

    await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    expect(screen.getByText('Perfil')).toBeTruthy();
    expect(screen.getByText('Sair')).toBeTruthy();
  });
});

