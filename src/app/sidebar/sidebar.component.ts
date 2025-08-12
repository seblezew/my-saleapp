import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service'; // Add this import

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(public authService: AuthService) { } // Inject AuthService here

  ngOnInit(): void {
  }
}