
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-agent-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './agent-sidebar.html',
  styleUrl: './agent-sidebar.scss'
})
export class AgentSidebar {}
