import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChangePasswordSectionComponent } from './sections/change-password/change-password-section.component';
import { ProfileFormComponent } from './sections/profile-form/profile-form.component';
import { ProfileImageSectionComponent } from './sections/profile-image/profile-image-section.component';
import { ProfileStateService } from '../../services/profile/profile-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProfileImageSectionComponent, ProfileFormComponent, ChangePasswordSectionComponent],
  providers: [ProfileStateService],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  activeTab: 'perfil' | 'senha' | 'assinatura' = 'perfil';

  constructor(
    public profileState: ProfileStateService
  ) {}

  setTab(tab: 'perfil' | 'senha' | 'assinatura'): void {
    this.activeTab = tab;
  }
}

