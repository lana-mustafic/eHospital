import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<string>('en');
  private translations: { [lang: string]: Translations } = {};

  // Supported languages
  readonly languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' }
  ];

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.setLanguage(savedLang);
    this.loadTranslations();
  }

  getCurrentLanguage(): Observable<string> {
    return this.currentLanguage$.asObservable();
  }

  getCurrentLanguageCode(): string {
    return this.currentLanguage$.value;
  }

  setLanguage(langCode: string): void {
    if (this.languages.find(l => l.code === langCode)) {
      this.currentLanguage$.next(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      // Update document direction for RTL languages
      if (langCode === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', langCode);
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', langCode);
      }
    }
  }

  translate(key: string, params?: { [key: string]: any }): string {
    const lang = this.currentLanguage$.value;
    const translation = this.getNestedTranslation(this.translations[lang] || this.translations['en'], key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }

  private getNestedTranslation(obj: Translations, key: string): string {
    const keys = key.split('.');
    let value: any = obj;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return '';
      }
    }

    return typeof value === 'string' ? value : '';
  }

  private replaceParams(text: string, params: { [key: string]: any }): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  private loadTranslations(): void {
    // Load English (default)
    this.translations['en'] = this.getEnglishTranslations();
    this.translations['es'] = this.getSpanishTranslations();
    this.translations['fr'] = this.getFrenchTranslations();
    this.translations['ar'] = this.getArabicTranslations();
    this.translations['de'] = this.getGermanTranslations();
    this.translations['zh'] = this.getChineseTranslations();
    this.translations['ja'] = this.getJapaneseTranslations();
    this.translations['pt'] = this.getPortugueseTranslations();
  }

  private getEnglishTranslations(): Translations {
    return {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        print: 'Print',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        noData: 'No data available',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        time: 'Time',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        totalPatients: 'Total Patients',
        activePatients: 'Active Patients',
        todayAppointments: 'Today\'s Appointments',
        upcomingAppointments: 'Upcoming Appointments'
      },
      patients: {
        title: 'Patients',
        addPatient: 'Add Patient',
        patientList: 'Patient List',
        patientDetails: 'Patient Details',
        searchPatients: 'Search patients...'
      },
      appointments: {
        title: 'Appointments',
        scheduleAppointment: 'Schedule Appointment',
        newAppointment: 'New Appointment',
        appointmentList: 'Appointment List',
        appointmentDetails: 'Appointment Details'
      },
      audit: {
        title: 'Audit Trail',
        complianceReport: 'Compliance Report',
        changeHistory: 'Change History',
        timestamp: 'Timestamp',
        user: 'User',
        action: 'Action',
        entity: 'Entity',
        details: 'Details'
      },
      accessibility: {
        title: 'Accessibility Settings',
        settings: 'Accessibility Settings',
        highContrast: 'High Contrast Mode',
        highContrastDesc: 'Increase contrast for better visibility',
        fontSize: 'Font Size',
        fontSizeSmall: 'Small',
        fontSizeMedium: 'Medium',
        fontSizeLarge: 'Large',
        fontSizeXLarge: 'Extra Large',
        fontSizeDesc: 'Adjust the text size for better readability',
        reducedMotion: 'Reduce Motion',
        reducedMotionDesc: 'Minimize animations and transitions',
        screenReaderAnnouncements: 'Screen Reader Announcements',
        screenReaderAnnouncementsDesc: 'Enable announcements for screen readers',
        announcements: 'Screen reader announcements',
        skipToContent: 'Skip to main content',
        keyboardShortcuts: 'Keyboard Shortcuts'
      }
    };
  }

  private getSpanishTranslations(): Translations {
    return {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        print: 'Imprimir',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        loading: 'Cargando...',
        noData: 'No hay datos disponibles',
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
        actions: 'Acciones',
        status: 'Estado',
        date: 'Fecha',
        time: 'Hora',
        name: 'Nombre',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        address: 'Dirección',
        viewQueue: 'Ver Cola'
      },
      dashboard: {
        title: 'Panel de Control',
        welcome: 'Bienvenido',
        totalPatients: 'Total de Pacientes',
        activePatients: 'Pacientes Activos',
        todayAppointments: 'Citas de Hoy',
        upcomingAppointments: 'Próximas Citas'
      },
      patients: {
        title: 'Pacientes',
        addPatient: 'Agregar Paciente',
        patientList: 'Lista de Pacientes',
        patientDetails: 'Detalles del Paciente',
        searchPatients: 'Buscar pacientes...'
      },
      appointments: {
        title: 'Citas',
        scheduleAppointment: 'Programar Cita',
        newAppointment: 'Nueva Cita',
        appointmentList: 'Lista de Citas',
        appointmentDetails: 'Detalles de la Cita'
      },
      audit: {
        title: 'Registro de Auditoría',
        complianceReport: 'Informe de Cumplimiento',
        changeHistory: 'Historial de Cambios',
        timestamp: 'Fecha y Hora',
        user: 'Usuario',
        action: 'Acción',
        entity: 'Entidad',
        details: 'Detalles'
      },
      accessibility: {
        title: 'Configuración de Accesibilidad',
        settings: 'Configuración de Accesibilidad',
        highContrast: 'Modo de Alto Contraste',
        highContrastDesc: 'Aumentar el contraste para mejor visibilidad',
        fontSize: 'Tamaño de Fuente',
        fontSizeSmall: 'Pequeño',
        fontSizeMedium: 'Mediano',
        fontSizeLarge: 'Grande',
        fontSizeXLarge: 'Extra Grande',
        fontSizeDesc: 'Ajustar el tamaño del texto para mejor legibilidad',
        reducedMotion: 'Reducir Movimiento',
        reducedMotionDesc: 'Minimizar animaciones y transiciones',
        screenReaderAnnouncements: 'Anuncios de Lector de Pantalla',
        screenReaderAnnouncementsDesc: 'Habilitar anuncios para lectores de pantalla',
        announcements: 'Anuncios de lector de pantalla',
        skipToContent: 'Saltar al contenido principal',
        keyboardShortcuts: 'Atajos de Teclado'
      }
    };
  }

  private getFrenchTranslations(): Translations {
    return {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        create: 'Créer',
        update: 'Mettre à jour',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        print: 'Imprimer',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        loading: 'Chargement...',
        noData: 'Aucune donnée disponible',
        confirm: 'Confirmer',
        yes: 'Oui',
        no: 'Non',
        actions: 'Actions',
        status: 'Statut',
        date: 'Date',
        time: 'Heure',
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        address: 'Adresse'
      },
      dashboard: {
        title: 'Tableau de Bord',
        welcome: 'Bienvenue',
        totalPatients: 'Total des Patients',
        activePatients: 'Patients Actifs',
        todayAppointments: 'Rendez-vous d\'Aujourd\'hui',
        upcomingAppointments: 'Rendez-vous à Venir'
      },
      patients: {
        title: 'Patients',
        addPatient: 'Ajouter un Patient',
        patientList: 'Liste des Patients',
        patientDetails: 'Détails du Patient',
        searchPatients: 'Rechercher des patients...'
      },
      appointments: {
        title: 'Rendez-vous',
        scheduleAppointment: 'Planifier un Rendez-vous',
        newAppointment: 'Nouveau Rendez-vous',
        appointmentList: 'Liste des Rendez-vous',
        appointmentDetails: 'Détails du Rendez-vous'
      },
      audit: {
        title: 'Piste d\'Audit',
        complianceReport: 'Rapport de Conformité',
        changeHistory: 'Historique des Modifications',
        timestamp: 'Horodatage',
        user: 'Utilisateur',
        action: 'Action',
        entity: 'Entité',
        details: 'Détails'
      }
    };
  }

  private getArabicTranslations(): Translations {
    return {
      common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        print: 'طباعة',
        close: 'إغلاق',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        loading: 'جاري التحميل...',
        noData: 'لا توجد بيانات متاحة',
        confirm: 'تأكيد',
        yes: 'نعم',
        no: 'لا',
        actions: 'الإجراءات',
        status: 'الحالة',
        date: 'التاريخ',
        time: 'الوقت',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان'
      },
      dashboard: {
        title: 'لوحة التحكم',
        welcome: 'مرحباً',
        totalPatients: 'إجمالي المرضى',
        activePatients: 'المرضى النشطون',
        todayAppointments: 'مواعيد اليوم',
        upcomingAppointments: 'المواعيد القادمة'
      },
      patients: {
        title: 'المرضى',
        addPatient: 'إضافة مريض',
        patientList: 'قائمة المرضى',
        patientDetails: 'تفاصيل المريض',
        searchPatients: 'البحث عن المرضى...'
      },
      appointments: {
        title: 'المواعيد',
        scheduleAppointment: 'جدولة موعد',
        newAppointment: 'موعد جديد',
        appointmentList: 'قائمة المواعيد',
        appointmentDetails: 'تفاصيل الموعد'
      },
      audit: {
        title: 'سجل التدقيق',
        complianceReport: 'تقرير الامتثال',
        changeHistory: 'سجل التغييرات',
        timestamp: 'الطابع الزمني',
        user: 'المستخدم',
        action: 'الإجراء',
        entity: 'الكيان',
        details: 'التفاصيل'
      },
      accessibility: {
        title: 'إعدادات إمكانية الوصول',
        settings: 'إعدادات إمكانية الوصول',
        highContrast: 'وضع التباين العالي',
        highContrastDesc: 'زيادة التباين لتحسين الرؤية',
        fontSize: 'حجم الخط',
        fontSizeSmall: 'صغير',
        fontSizeMedium: 'متوسط',
        fontSizeLarge: 'كبير',
        fontSizeXLarge: 'كبير جداً',
        fontSizeDesc: 'تعديل حجم النص لتحسين القراءة',
        reducedMotion: 'تقليل الحركة',
        reducedMotionDesc: 'تقليل الرسوم المتحركة والانتقالات',
        screenReaderAnnouncements: 'إعلانات قارئ الشاشة',
        screenReaderAnnouncementsDesc: 'تفعيل الإعلانات لقارئات الشاشة',
        announcements: 'إعلانات قارئ الشاشة',
        skipToContent: 'تخطي إلى المحتوى الرئيسي',
        keyboardShortcuts: 'اختصارات لوحة المفاتيح'
      }
    };
  }

  private getGermanTranslations(): Translations {
    return {
      common: {
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        create: 'Erstellen',
        update: 'Aktualisieren',
        search: 'Suchen',
        filter: 'Filtern',
        export: 'Exportieren',
        print: 'Drucken',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Zurück',
        loading: 'Laden...',
        noData: 'Keine Daten verfügbar',
        confirm: 'Bestätigen',
        yes: 'Ja',
        no: 'Nein',
        actions: 'Aktionen',
        status: 'Status',
        date: 'Datum',
        time: 'Zeit',
        name: 'Name',
        email: 'E-Mail',
        phone: 'Telefon',
        address: 'Adresse'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Willkommen',
        totalPatients: 'Gesamt Patienten',
        activePatients: 'Aktive Patienten',
        todayAppointments: 'Heutige Termine',
        upcomingAppointments: 'Bevorstehende Termine'
      },
      patients: {
        title: 'Patienten',
        addPatient: 'Patient Hinzufügen',
        patientList: 'Patientenliste',
        patientDetails: 'Patientendetails',
        searchPatients: 'Patienten suchen...'
      },
      appointments: {
        title: 'Termine',
        scheduleAppointment: 'Termin Vereinbaren',
        newAppointment: 'Neuer Termin',
        appointmentList: 'Terminliste',
        appointmentDetails: 'Termindetails'
      },
      audit: {
        title: 'Audit-Protokoll',
        complianceReport: 'Compliance-Bericht',
        changeHistory: 'Änderungsverlauf',
        timestamp: 'Zeitstempel',
        user: 'Benutzer',
        action: 'Aktion',
        entity: 'Entität',
        details: 'Details'
      }
    };
  }

  private getChineseTranslations(): Translations {
    return {
      common: {
        save: '保存',
        cancel: '取消',
        delete: '删除',
        edit: '编辑',
        create: '创建',
        update: '更新',
        search: '搜索',
        filter: '筛选',
        export: '导出',
        print: '打印',
        close: '关闭',
        back: '返回',
        next: '下一步',
        previous: '上一步',
        loading: '加载中...',
        noData: '无可用数据',
        confirm: '确认',
        yes: '是',
        no: '否',
        actions: '操作',
        status: '状态',
        date: '日期',
        time: '时间',
        name: '姓名',
        email: '电子邮件',
        phone: '电话',
        address: '地址'
      },
      dashboard: {
        title: '仪表板',
        welcome: '欢迎',
        totalPatients: '患者总数',
        activePatients: '活跃患者',
        todayAppointments: '今日预约',
        upcomingAppointments: '即将到来的预约'
      },
      patients: {
        title: '患者',
        addPatient: '添加患者',
        patientList: '患者列表',
        patientDetails: '患者详情',
        searchPatients: '搜索患者...'
      },
      appointments: {
        title: '预约',
        scheduleAppointment: '安排预约',
        newAppointment: '新预约',
        appointmentList: '预约列表',
        appointmentDetails: '预约详情'
      },
      audit: {
        title: '审计跟踪',
        complianceReport: '合规报告',
        changeHistory: '变更历史',
        timestamp: '时间戳',
        user: '用户',
        action: '操作',
        entity: '实体',
        details: '详情'
      }
    };
  }

  private getJapaneseTranslations(): Translations {
    return {
      common: {
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        create: '作成',
        update: '更新',
        search: '検索',
        filter: 'フィルター',
        export: 'エクスポート',
        print: '印刷',
        close: '閉じる',
        back: '戻る',
        next: '次へ',
        previous: '前へ',
        loading: '読み込み中...',
        noData: 'データがありません',
        confirm: '確認',
        yes: 'はい',
        no: 'いいえ',
        actions: '操作',
        status: 'ステータス',
        date: '日付',
        time: '時間',
        name: '名前',
        email: 'メール',
        phone: '電話',
        address: '住所'
      },
      dashboard: {
        title: 'ダッシュボード',
        welcome: 'ようこそ',
        totalPatients: '患者総数',
        activePatients: 'アクティブな患者',
        todayAppointments: '今日の予約',
        upcomingAppointments: '今後の予約'
      },
      patients: {
        title: '患者',
        addPatient: '患者を追加',
        patientList: '患者リスト',
        patientDetails: '患者詳細',
        searchPatients: '患者を検索...'
      },
      appointments: {
        title: '予約',
        scheduleAppointment: '予約をスケジュール',
        newAppointment: '新しい予約',
        appointmentList: '予約リスト',
        appointmentDetails: '予約詳細'
      },
      audit: {
        title: '監査証跡',
        complianceReport: 'コンプライアンスレポート',
        changeHistory: '変更履歴',
        timestamp: 'タイムスタンプ',
        user: 'ユーザー',
        action: 'アクション',
        entity: 'エンティティ',
        details: '詳細'
      },
      accessibility: {
        title: 'アクセシビリティ設定',
        settings: 'アクセシビリティ設定',
        highContrast: '高コントラストモード',
        highContrastDesc: '視認性向上のためコントラストを上げる',
        fontSize: 'フォントサイズ',
        fontSizeSmall: '小',
        fontSizeMedium: '中',
        fontSizeLarge: '大',
        fontSizeXLarge: '特大',
        fontSizeDesc: '可読性向上のためテキストサイズを調整',
        reducedMotion: 'モーション削減',
        reducedMotionDesc: 'アニメーションとトランジションを最小化',
        screenReaderAnnouncements: 'スクリーンリーダーアナウンス',
        screenReaderAnnouncementsDesc: 'スクリーンリーダー用アナウンスを有効化',
        announcements: 'スクリーンリーダーアナウンス',
        skipToContent: 'メインコンテンツにスキップ',
        keyboardShortcuts: 'キーボードショートカット'
      }
    };
  }

  private getPortugueseTranslations(): Translations {
    return {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        update: 'Atualizar',
        search: 'Pesquisar',
        filter: 'Filtrar',
        export: 'Exportar',
        print: 'Imprimir',
        close: 'Fechar',
        back: 'Voltar',
        next: 'Próximo',
        previous: 'Anterior',
        loading: 'Carregando...',
        noData: 'Nenhum dado disponível',
        confirm: 'Confirmar',
        yes: 'Sim',
        no: 'Não',
        actions: 'Ações',
        status: 'Status',
        date: 'Data',
        time: 'Hora',
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        address: 'Endereço'
      },
      dashboard: {
        title: 'Painel',
        welcome: 'Bem-vindo',
        totalPatients: 'Total de Pacientes',
        activePatients: 'Pacientes Ativos',
        todayAppointments: 'Consultas de Hoje',
        upcomingAppointments: 'Próximas Consultas'
      },
      patients: {
        title: 'Pacientes',
        addPatient: 'Adicionar Paciente',
        patientList: 'Lista de Pacientes',
        patientDetails: 'Detalhes do Paciente',
        searchPatients: 'Pesquisar pacientes...'
      },
      appointments: {
        title: 'Consultas',
        scheduleAppointment: 'Agendar Consulta',
        newAppointment: 'Nova Consulta',
        appointmentList: 'Lista de Consultas',
        appointmentDetails: 'Detalhes da Consulta'
      },
      audit: {
        title: 'Rastreamento de Auditoria',
        complianceReport: 'Relatório de Conformidade',
        changeHistory: 'Histórico de Alterações',
        timestamp: 'Carimbo de Data/Hora',
        user: 'Usuário',
        action: 'Ação',
        entity: 'Entidade',
        details: 'Detalhes'
      }
    };
  }
}

