import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
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
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    public profileState: ProfileStateService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
  }
}

