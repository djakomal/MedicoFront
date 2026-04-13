import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../_helps/notification.service';
import { JwtService } from '../../_helps/jwt/jwt.service';
import { Message } from '../../models/Message';
import { Language, TranslationService } from '../../_helps/translation-service.service';
import { TranslatePipe } from '../../_helps/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  userName: string | null = null;
  notifications: Message[] = [];
  menuOpen: boolean = false;
  
  languageMenuOpen: boolean = false;
  currentLang: string = 'fr';
  currentLanguage: Language | undefined;
  languages: Language[] = [];
  isTranslating: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public translationService: TranslationService
  ) {
    this.languages = this.translationService.languages;
  }

  ngOnInit() {
    this.notificationService.notifications$.subscribe((notifications: Message[]) => {
      this.notifications = notifications;
    });

    this.loadUserName();
    
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.currentLanguage = this.translationService.getLanguage(lang);
      this.cdr.detectChanges();
    });
  }

  clearNotifications() {
    this.notificationService.clearAllNotifications();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges();
  }

  toggleLanguageMenu() {
    this.languageMenuOpen = !this.languageMenuOpen;
    this.cdr.detectChanges();
  }

  changeLanguage(langCode: string) {
    this.isTranslating = true;
    
    setTimeout(() => {
      this.translationService.setLanguage(langCode);
      this.languageMenuOpen = false;
      this.isTranslating = false;
      
      const langName = this.translationService.getLanguage(langCode)?.name;
      this.notificationService.success(
        `${this.translationService.translate('languageChanged')} ${langName}`
      );
      
      this.cdr.detectChanges();
    }, 300);
  }

  loadUserName(): void {
    this.userName = this.jwtService.getUserName();
  }

  logout(): void {
    this.jwtService.removeToken();
    this.userName = null;
    this.menuOpen = false;
    this.router.navigateByUrl('/connex');
  }
}
