import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SegmentedControlComponent, SegmentedControlItem } from '../../components/shared/segmented-control/segmented-control.component';
import { ChangePasswordSectionComponent } from './sections/change-password/change-password-section.component';
import { ProfileFormComponent } from './sections/profile-form/profile-form.component';
import { ProfileImageSectionComponent } from './sections/profile-image/profile-image-section.component';
import { ProfileStateService } from '../../services/profile/profile-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SegmentedControlComponent, ProfileImageSectionComponent, ProfileFormComponent, ChangePasswordSectionComponent],
  providers: [ProfileStateService],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  readonly tabs: SegmentedControlItem[] = [
    { id: 'perfil', label: 'Dados pessoais' },
    { id: 'senha', label: 'Atualizar senha' },
  ];

  activeTab: 'perfil' | 'senha' = 'perfil';

  constructor(
    public profileState: ProfileStateService
  ) {}
}

