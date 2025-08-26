import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  id: number;
}

@Component({
  selector: 'app-debug-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-console.component.html',
  styleUrls: ['./debug-console.component.scss'],
})
export class DebugConsoleComponent implements OnInit, OnDestroy {
  logs: ConsoleLog[] = [];
  isVisible = true;
  isMinimized = false;
  private logId = 0;

  // Store original console methods
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  ngOnInit(): void {
    this.interceptConsole();
  }

  ngOnDestroy(): void {
    this.restoreConsole();
  }

  private interceptConsole(): void {
    const self = this;

    console.log = (...args: any[]) => {
      self.addLog('log', args.join(' '));
      self.originalConsole.log.apply(console, args);
    };

    console.error = (...args: any[]) => {
      self.addLog('error', args.join(' '));
      self.originalConsole.error.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      self.addLog('warn', args.join(' '));
      self.originalConsole.warn.apply(console, args);
    };

    console.info = (...args: any[]) => {
      self.addLog('info', args.join(' '));
      self.originalConsole.info.apply(console, args);
    };
  }

  private restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
  }

  private addLog(
    type: 'log' | 'error' | 'warn' | 'info',
    message: string
  ): void {
    this.logs.unshift({
      type,
      message,
      timestamp: new Date(),
      id: this.logId++,
    });

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }

  clearLogs(): void {
    this.logs = [];
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  close(): void {
    this.isVisible = false;
  }

  getLogClass(type: string): string {
    return `log-${type}`;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }

  trackByLogId(index: number, log: ConsoleLog): number {
    return log.id;
  }
}
