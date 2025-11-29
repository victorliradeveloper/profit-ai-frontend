import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('should render Flashdeck AI title', async () => {
    await render(HeaderComponent);

    const title = screen.getByText('Flashdeck AI');
    expect(title).toBeTruthy();
  });
});
