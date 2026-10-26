
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AdminSidebar } from '../../sidebars/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  portalMenuOpen = false;

  constructor(private readonly router: Router) {}

  get currentPortal(): string {
    const url = this.router.url;

    if (url.startsWith('/agent')) {
      return 'Agent';
    }

    if (url.startsWith('/customer')) {
      return 'Customer';
    }

    return 'Admin';
  }

  togglePortalMenu(): void {
    this.portalMenuOpen = !this.portalMenuOpen;
  }

  switchPortal(portal: 'admin' | 'agent' | 'customer'): void {
    this.portalMenuOpen = false;
    void this.router.navigate([`/${portal}/dashboard`]);
  }
}
