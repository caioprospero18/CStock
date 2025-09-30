import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../security/auth.service';

@Pipe({ name: 'hasRole' })
export class HasRolePipe implements PipeTransform {
  constructor(private authService: AuthService) {}

  transform(role: string): boolean {
    return this.authService.hasRole(role);
  }
}
