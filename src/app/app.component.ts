import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly version = environment.version;
  private pwaService = inject(PwaService);

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.appTitle);
    // Ensure update check runs early in app lifecycle
    // PwaService constructor already calls checkForUpdates, but this ensures it runs after app is fully initialized
    setTimeout(() => {
      this.pwaService.checkForUpdates();
    }, 30000);
  }
}
