
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CustomerSidebar } from '../../sidebars/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, CustomerSidebar],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss'
})
export class CustomerLayout {
  portalMenuOpen = false;

  constructor(private readonly router: Router) {}

  get currentPortal(): string {
    return this.router.url.startsWith('/customer')
      ? 'Customer'
      : 'Admin';
  }

  togglePortalMenu(): void {
    this.portalMenuOpen = !this.portalMenuOpen;
  }

  switchPortal(portal: 'admin' | 'agent' | 'customer'): void {
    this.portalMenuOpen = false;
    void this.router.navigate([`/${portal}/dashboard`]);
  }
}
