
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AgentSidebar } from '../../sidebars/agent-sidebar/agent-sidebar';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [RouterOutlet, AgentSidebar],
  templateUrl: './agent-layout.html',
  styleUrl: './agent-layout.scss'
})
export class AgentLayout {
  portalMenuOpen = false;

  constructor(private readonly router: Router) {}

  get currentPortal(): string {
    return this.router.url.startsWith('/agent') ? 'Agent' : 'Admin';
  }

  togglePortalMenu(): void {
    this.portalMenuOpen = !this.portalMenuOpen;
  }

  switchPortal(portal: 'admin' | 'agent'): void {
    this.portalMenuOpen = false;

    if (portal === 'admin') {
      void this.router.navigate(['/admin/dashboard']);
    } else {
      void this.router.navigate(['/agent/dashboard']);
    }
  }
}
