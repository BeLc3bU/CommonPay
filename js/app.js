/**
 * Controlador Principal de la Aplicación (CommonPay)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- VARIABLES DE ESTADO ---
  let appConfig = {};
  let fianzaAcumulado = 0.0;
  let fianzaHistorial = [];
  let historialTransferencias = [];
  let conciliaciones = [];
  let currentMonthIndex = new Date().getMonth(); // Mes actual del sistema
  const currentAnio = 2026; // Año de trabajo por defecto
  let miGrafico = null; // Instancia del gráfico Chart.js
  let isPedroEditor = false; // Estado del permiso de edición

  // --- ELEMENTOS DEL DOM ---
  // Navegación
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const selectorMesGlobal = document.getElementById('selector-mes-global');
  const selectorMesGlobalMobile = document.getElementById('selector-mes-global-mobile');
  const monthSelectorContainer = document.getElementById('month-selector-container');
  const themeCheckbox = document.getElementById('theme-checkbox');

  // Sidebar / Drawer móvil
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const mobileBottomNavItems = document.querySelectorAll('.mobile-nav-item');

  // Vista Dashboard
  const totalOlgaEl = document.getElementById('total-olga');
  const totalPedroEl = document.getElementById('total-pedro');
  const conceptosOlgaEl = document.getElementById('conceptos-olga');
  const conceptosPedroEl = document.getElementById('conceptos-pedro');
  const olgaSuperavitBadge = document.getElementById('olga-superavit-badge');
  const olgaSuperavitDetail = document.getElementById('olga-superavit-detail');
  const btnCompletarMes = document.getElementById('btn-completar-mes');
  const btnExportarPdfMes = document.getElementById('btn-exportar-pdf-mes');
  const btnExportarPdfPrevision = document.getElementById('btn-exportar-pdf-prevision');
  const dineroEsperadoCuentaEl = document.getElementById('dinero-esperado-cuenta');
  const dineroEsperadoDesgloseEl = document.getElementById('dinero-esperado-desglose');
  const conSuperavitOlgaEl = document.getElementById('con-superavit-olga');
  const conTotalEsperadoCuentaEl = document.getElementById('con-total-esperado-cuenta');
  const alertasMesEl = document.getElementById('alertas-mes');

  // Vista Fianza
  const fianzaPorcentajeEl = document.getElementById('fianza-porcentaje');
  const fianzaProgressBarEl = document.getElementById('fianza-progress-bar');
  const fianzaObjetivoEl = document.getElementById('fianza-objetivo');
  const fianzaAcumuladoEl = document.getElementById('fianza-acumulado');
  const fianzaPendienteEl = document.getElementById('fianza-pendiente');
  const fianzaEstadoIconEl = document.getElementById('fianza-estado-icon');
  const fianzaEstadoTituloEl = document.getElementById('fianza-estado-titulo');
  const fianzaEstadoDescEl = document.getElementById('fianza-estado-desc');
  const inputAportacionExtra = document.getElementById('input-aportacion-extra');
  const btnAportarManual = document.getElementById('btn-aportar-manual');
  const btnRetirarManual = document.getElementById('btn-retirar-manual');
  const tablaFianzaHistorialBody = document.getElementById('tabla-fianza-historial-body');

  // Vista Estadísticas
  const statsTotalOlgaEl = document.getElementById('stats-total-olga');
  const statsTotalPedroEl = document.getElementById('stats-total-pedro');
  const statsTotalExtraEl = document.getElementById('stats-total-extra');

  // Vista Historial
  const tablaHistorialBody = document.getElementById('tabla-historial-body');
  const btnExportarExcel = document.getElementById('btn-exportar-excel');

  // Vista Configuración
  const cfgHipotecaCuota = document.getElementById('cfg-hipoteca-cuota');
  const cfgHipotecaAlquiler = document.getElementById('cfg-hipoteca-alquiler');
  const cfgComunidad = document.getElementById('cfg-comunidad');
  const cfgFianzaObjetivo = document.getElementById('cfg-fianza-objetivo');
  const cfgFianzaMensual = document.getElementById('cfg-fianza-mensual');
  const cfgOlgaCoche = document.getElementById('cfg-olga-coche');
  const cfgOlgaManutencion = document.getElementById('cfg-olga-manutencion');
  const cfgOlgaIngresoHabitual = document.getElementById('cfg-olga-ingreso-habitual');
  const cfgOlgaSuperavit = document.getElementById('cfg-olga-superavit');
  const cfgExtraIbi = document.getElementById('cfg-extra-ibi');
  const cfgExtraSeguro = document.getElementById('cfg-extra-seguro');
  const btnConfigReset = document.getElementById('btn-config-reset');
  const btnConfigGuardar = document.getElementById('btn-config-guardar');
  const cfgAlertaHipoteca = document.getElementById('cfg-alerta-hipoteca');
  const cfgAlertaManutencion = document.getElementById('cfg-alerta-manutencion');
  const cfgAlertaAlquiler = document.getElementById('cfg-alerta-alquiler');
  const cfgHipotecaNueva = document.getElementById('cfg-hipoteca-nueva');
  const cfgIpcTasa = document.getElementById('cfg-ipc-tasa');
  const cfgIravTasa = document.getElementById('cfg-irav-tasa');

  // Elementos del DOM de Autenticación
  const authStatusEl = document.getElementById('auth-status');
  const btnAuthAction = document.getElementById('btn-auth-action');
  const loginModal = document.getElementById('login-modal');
  const btnCloseLogin = document.getElementById('btn-close-login');
  const btnCancelLogin = document.getElementById('btn-cancel-login');
  const loginForm = document.getElementById('login-form');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const loginErrorEl = document.getElementById('login-error');
  const loginErrorText = document.getElementById('login-error-text');

  // --- NOMBRES DE MESES ---
  const NOMBRES_MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  // --- INICIALIZACIÓN ---
  function cargarDatosLocalesInmediatos() {
    const DEFAULT_CONFIG = {
      gastosFijos: {
        cuotaHipoteca: 716.81,
        ingresoAlquiler: 462.0,
        comunidad: 39.38
      },
      gastosPersonales: {
        olga: {
          coche: 188.02,
          manutencion: 189.3,
          superavit: 115.57,
          ingresoHabitual: 550.0
        },
        pedro: {}
      },
      gastosExtraordinarios: [
        {
          id: 'ibi',
          nombre: 'IBI',
          importeTotal: 306.63,
          meses: [0, 1, 2]
        },
        {
          id: 'seguro_hogar',
          nombre: 'Seguro Hogar',
          importeTotal: 108.2,
          meses: [3]
        }
      ],
      fianza: {
        pointer: 'fianza',
        objetivo: 450.0,
        aportacionMensualPersona: 10.0
      },
      alertas: {
        mesHipoteca: 9, // Octubre
        mesManutencion: 5, // Junio
        mesAlquiler: 10, // Noviembre
        tasaManutencion: 2.0, // 2% IPC
        tasaAlquiler: 2.0, // 2% IRAV
        cuotaHipotecaNueva: 777.37 // Sube a 777.37 €
      }
    };

    try {
      const cfg = localStorage.getItem('commonpay_config');
      appConfig = cfg ? JSON.parse(cfg) : DEFAULT_CONFIG;
      if (appConfig) {
        if (!appConfig.alertas) appConfig.alertas = {};
        if (
          appConfig.alertas.cuotaHipotecaNueva === undefined ||
          appConfig.alertas.cuotaHipotecaNueva === 716.81
        ) {
          appConfig.alertas.cuotaHipotecaNueva = 777.37;
        }
        if (appConfig.alertas.mesHipoteca === undefined || appConfig.alertas.mesHipoteca === 8) {
          appConfig.alertas.mesHipoteca = 9;
        }
        if (!appConfig.gastosPersonales) appConfig.gastosPersonales = {};
        if (!appConfig.gastosPersonales.olga) appConfig.gastosPersonales.olga = {};
        if (
          appConfig.gastosPersonales.olga.superavit === undefined ||
          appConfig.gastosPersonales.olga.superavit === 0.0 ||
          appConfig.gastosPersonales.olga.superavit === 62.75
        ) {
          appConfig.gastosPersonales.olga.superavit = 115.57;
        }
        if (appConfig.gastosPersonales.olga.ingresoHabitual === undefined) {
          appConfig.gastosPersonales.olga.ingresoHabitual = 550.0;
        }
      }
    } catch (e) {
      appConfig = DEFAULT_CONFIG;
    }

    try {
      const fz = localStorage.getItem('commonpay_fianza_acumulado');
      fianzaAcumulado = fz && parseFloat(fz) > 0 ? parseFloat(fz) : 410.0;
    } catch (e) {
      fianzaAcumulado = 410.0;
    }

    try {
      const fzh = localStorage.getItem('commonpay_fianza_historial');
      fianzaHistorial = fzh ? JSON.parse(fzh) : [];
    } catch (e) {
      fianzaHistorial = [];
    }

    try {
      const hist = localStorage.getItem('commonpay_historial');
      historialTransferencias = hist ? JSON.parse(hist) : [];
    } catch (e) {
      historialTransferencias = [];
    }

    try {
      const conc = localStorage.getItem('commonpay_conciliaciones');
      conciliaciones = conc ? JSON.parse(conc) : [];
    } catch (e) {
      conciliaciones = [];
    }
  }

  async function init() {
    // 1. Cargar e hidratar la interfaz de inmediato con datos locales (síncrono/inmediato)
    cargarDatosLocalesInmediatos();

    // 2. Establecer mes por defecto
    selectorMesGlobal.value = currentMonthIndex;
    if (selectorMesGlobalMobile) selectorMesGlobalMobile.value = currentMonthIndex;

    // 3. Inicializar tema visual
    const savedTheme = window.StorageModule.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeCheckbox.checked = savedTheme === 'dark';

    // 4. Registrar Eventos
    setupEventListeners();

    // 5. Renderizar de inmediato para evitar ceros en pantalla
    actualizarEstadoAuthVisual();
    actualizarInterfaz();
    lucide.createIcons();

    // 6. Cargar datos desde la nube en segundo plano (asíncrono no bloqueante)
    try {
      // Inicializar conexión con Supabase
      await window.StorageModule.inicializarSupabase();

      // Verificar autenticación de Pedro
      const user = await window.StorageModule.obtenerUsuarioActivo();
      isPedroEditor = user !== null;
      actualizarEstadoAuthVisual();

      // Paralelizar la descarga de datos desde Supabase
      const [config, fianza, historialFianza, historialTrans, conciliacionesList] =
        await Promise.all([
          window.StorageModule.getConfiguration(),
          window.StorageModule.getFianzaAcumulado(),
          window.StorageModule.getFianzaHistorial(),
          window.StorageModule.getHistorial(),
          window.StorageModule.getConciliaciones()
        ]);

      // Sobrescribir variables de estado con la información remota
      appConfig = config;
      fianzaAcumulado = fianza;
      fianzaHistorial = historialFianza;
      historialTransferencias = historialTrans;
      conciliaciones = conciliacionesList;

      // Refrescar suavemente la interfaz con los datos sincronizados
      actualizarInterfaz();
      lucide.createIcons();
    } catch (err) {
      console.warn('Sincronización con la nube fallida, operando en LocalStorage:', err);
    }
  }

  // --- CONTROL DE PERMISOS DE EDICIÓN (ROLES) ---
  function actualizarEstadoAuthVisual() {
    if (isPedroEditor) {
      authStatusEl.className = 'auth-status editor-active';
      authStatusEl.innerHTML =
        '<i data-lucide="user-check" style="width:14px; height:14px;"></i> <span id="auth-text">Pedro (Editor)</span>';
      btnAuthAction.innerHTML =
        '<i data-lucide="log-out" style="width:14px; height:14px;"></i> Cerrar Sesión';
    } else {
      authStatusEl.className = 'auth-status read-only';
      authStatusEl.innerHTML =
        '<i data-lucide="eye" style="width:14px; height:14px;"></i> <span id="auth-text">Solo Lectura</span>';
      btnAuthAction.innerHTML =
        '<i data-lucide="log-in" style="width:14px; height:14px;"></i> Acceso Editor';
    }

    // Mostrar u ocultar pestañas exclusivas del editor (Liquidación y Ajustes)
    const editorNavs = document.querySelectorAll('.editor-only-nav');
    editorNavs.forEach((nav) => {
      nav.style.display = isPedroEditor ? 'block' : 'none';
    });

    // Redirección si un invitado intenta estar en una vista restringida
    if (!isPedroEditor) {
      const activeView = document.querySelector('.view-section.active');
      if (
        activeView &&
        (activeView.id === 'conciliacion-view' || activeView.id === 'config-view')
      ) {
        const dashboardLink = document.getElementById('nav-dashboard');
        if (dashboardLink) {
          cambiarVista('dashboard-view', dashboardLink);
        }
      }
    }

    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  function actualizarControlesEdicion(isEditor) {
    // Inputs del panel de ajustes
    const conSaldoReal = document.getElementById('con-saldo-real');
    const inputsAjustes = [
      cfgHipotecaCuota,
      cfgHipotecaAlquiler,
      cfgComunidad,
      cfgFianzaObjetivo,
      cfgFianzaMensual,
      cfgOlgaCoche,
      cfgOlgaManutencion,
      cfgOlgaIngresoHabitual,
      cfgOlgaSuperavit,
      cfgExtraIbi,
      cfgExtraSeguro,
      cfgAlertaHipoteca,
      cfgAlertaManutencion,
      cfgAlertaAlquiler,
      cfgHipotecaNueva,
      cfgIpcTasa,
      cfgIravTasa,
      inputAportacionExtra,
      conSaldoReal
    ];

    // Botones de acción del sistema
    const btnCalcularBalance = document.getElementById('btn-calcular-balance');
    const botonesEdicion = [
      btnCompletarMes,
      btnAportarManual,
      btnRetirarManual,
      btnConfigReset,
      btnConfigGuardar,
      btnCalcularBalance
    ];

    // Habilitar o deshabilitar inputs
    inputsAjustes.forEach((input) => {
      if (input) {
        input.disabled = !isEditor;
        if (!isEditor) {
          input.classList.add('read-only-disabled');
        } else {
          input.classList.remove('read-only-disabled');
        }
      }
    });

    // Habilitar o deshabilitar botones
    botonesEdicion.forEach((btn) => {
      if (btn) {
        btn.disabled = !isEditor;
        if (!isEditor) {
          btn.classList.add('read-only-disabled');
          if (btn === btnCompletarMes) {
            btn.style.opacity = '0.5';
          }
        } else {
          btn.classList.remove('read-only-disabled');
          if (btn === btnCompletarMes) {
            btn.style.opacity = '1';
          }
        }
      }
    });

    // Controlar botones de borrado en el historial
    const deleteButtons = document.querySelectorAll('.btn-icon.delete');
    deleteButtons.forEach((btn) => {
      btn.disabled = !isEditor;
      if (!isEditor) {
        btn.style.display = 'none'; // En modo lectura ocultamos el borrado
      } else {
        btn.style.display = 'inline-flex';
      }
    });
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Cambio de pestañas
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-target');
        cambiarVista(targetView, link);
        // Cerrar drawer en móvil al navegar
        if (sidebar && window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          sidebarOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Selector de mes
    selectorMesGlobal.addEventListener('change', (e) => {
      currentMonthIndex = parseInt(e.target.value);
      // Sincronizar selector móvil
      if (selectorMesGlobalMobile) selectorMesGlobalMobile.value = currentMonthIndex;
      actualizarDashboardMes();

      // Si la sección de conciliación está activa, actualizarla
      const activeView = document.querySelector('.view-section.active');
      if (activeView && activeView.id === 'conciliacion-view') {
        actualizarVistaConciliacion();
      }
    });

    // Selector de mes MÓVIL — sincroniza con el principal
    if (selectorMesGlobalMobile) {
      selectorMesGlobalMobile.addEventListener('change', (e) => {
        currentMonthIndex = parseInt(e.target.value);
        selectorMesGlobal.value = currentMonthIndex;
        actualizarDashboardMes();
        const activeView = document.querySelector('.view-section.active');
        if (activeView && activeView.id === 'conciliacion-view') {
          actualizarVistaConciliacion();
        }
      });
    }

    // Conmutador de tema
    themeCheckbox.addEventListener('change', (e) => {
      const newTheme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      window.StorageModule.saveTheme(newTheme);
      // Si el gráfico está activo, forzar reconstrucción
      if (document.getElementById('stats-view').classList.contains('active')) {
        renderizarGraficoAnual();
      }
    });

    // Acción completar mes
    btnCompletarMes.addEventListener('click', completarMesActual);

    // Exportación a PDF del desglose mensual
    btnExportarPdfMes.addEventListener('click', exportarPdfMes);

    // Exportación a PDF de la previsión anual
    if (btnExportarPdfPrevision) {
      btnExportarPdfPrevision.addEventListener('click', exportarPdfPrevision);
    }

    // Aportación extraordinaria manual a la fianza
    btnAportarManual.addEventListener('click', aportarManualFianza);

    // Retiro manual de la fianza
    btnRetirarManual.addEventListener('click', retirarManualFianza);

    // Exportación a Excel
    btnExportarExcel.addEventListener('click', exportarExcelHistorial);

    // Conciliación del día 15
    const btnCalcularBalance = document.getElementById('btn-calcular-balance');
    if (btnCalcularBalance) {
      btnCalcularBalance.addEventListener('click', calcularConciliacion);
    }

    // Google Calendar / iCal
    const btnExportarIcal = document.getElementById('btn-exportar-ical');
    if (btnExportarIcal) btnExportarIcal.addEventListener('click', exportarCalendarioIcs);

    // Selector de persona en vista Previsión Anual
    const selectPersona = document.getElementById('prevision-persona-select');
    if (selectPersona) {
      selectPersona.addEventListener('change', actualizarVistaPrevision);
    }

    // Conmutador de vistas en Previsión Anual para móviles (Tarjetas vs Tabla)
    const btnPrevisionCards = document.getElementById('btn-prevision-cards');
    const btnPrevisionTable = document.getElementById('btn-prevision-table');
    const cardsContainerEl = document.getElementById('prevision-cards-container');
    const tableContainerEl = document.getElementById('prevision-table-container');

    if (btnPrevisionCards && btnPrevisionTable) {
      btnPrevisionCards.addEventListener('click', () => {
        btnPrevisionCards.classList.add('active');
        btnPrevisionTable.classList.remove('active');
        if (cardsContainerEl) cardsContainerEl.classList.add('view-active');
        if (tableContainerEl) tableContainerEl.classList.add('view-hidden');
      });

      btnPrevisionTable.addEventListener('click', () => {
        btnPrevisionTable.classList.add('active');
        btnPrevisionCards.classList.remove('active');
        if (cardsContainerEl) cardsContainerEl.classList.remove('view-active');
        if (tableContainerEl) tableContainerEl.classList.remove('view-hidden');
      });
    }

    const btnGcalOlga = document.getElementById('btn-gcal-olga');
    if (btnGcalOlga) btnGcalOlga.addEventListener('click', () => abrirGoogleCalendar('olga'));

    const btnGcalHipoteca = document.getElementById('btn-gcal-hipoteca');
    if (btnGcalHipoteca)
      btnGcalHipoteca.addEventListener('click', () => abrirGoogleCalendar('hipoteca'));

    const btnGcalAlquiler = document.getElementById('btn-gcal-alquiler');
    if (btnGcalAlquiler)
      btnGcalAlquiler.addEventListener('click', () => abrirGoogleCalendar('alquiler'));

    // Guardar ajustes
    btnConfigGuardar.addEventListener('click', guardarAjustes);

    // Restaurar ajustes por defecto
    btnConfigReset.addEventListener('click', restaurarAjustesPorDefecto);

    // Eventos de Autenticación
    btnAuthAction.addEventListener('click', manejarAccionAuth);
    btnCloseLogin.addEventListener('click', () => cerrarModalLogin());
    btnCancelLogin.addEventListener('click', () => cerrarModalLogin());
    loginForm.addEventListener('submit', procesarLogin);

    // Cerrar modales al hacer click fuera
    const pdfDownloadModal = document.getElementById('pdf-download-modal');
    const btnClosePdfModal = document.getElementById('btn-close-pdf-modal');

    if (btnClosePdfModal && pdfDownloadModal) {
      btnClosePdfModal.addEventListener('click', () => {
        pdfDownloadModal.style.display = 'none';
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        cerrarModalLogin();
      }
      if (pdfDownloadModal && e.target === pdfDownloadModal) {
        pdfDownloadModal.style.display = 'none';
      }
    });

    // --- MÓVIL: HAMBURGER / DRAWER / BOTTOM NAV ---
    function abrirSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function cerrarSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', abrirSidebar);
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', cerrarSidebar);
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', cerrarSidebar);
    }

    // Barra de navegación inferior (móvil)
    mobileBottomNavItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-target');
        cambiarVista(targetView, null);
        // Sincronizar ítem activo en bottom nav
        mobileBottomNavItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  } // fin setupEventListeners

  // --- LÓGICA DE INICIO Y CIERRE DE SESIÓN ---
  async function manejarAccionAuth() {
    if (isPedroEditor) {
      if (
        confirm(
          '¿Estás seguro de que deseas cerrar la sesión de editor? La aplicación regresará al modo de solo lectura.'
        )
      ) {
        try {
          await window.StorageModule.logout();
          isPedroEditor = false;

          // Re-cargar la base de datos pública actualizada
          appConfig = await window.StorageModule.getConfiguration();
          fianzaAcumulado = await window.StorageModule.getFianzaAcumulado();
          historialTransferencias = await window.StorageModule.getHistorial();

          actualizarEstadoAuthVisual();
          actualizarInterfaz();
          alert('Sesión de editor cerrada. Modo solo lectura activado.');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          alert('Error al cerrar sesión de editor.');
        }
      }
    } else {
      loginEmailInput.value = '';
      loginPasswordInput.value = '';
      loginErrorEl.style.display = 'none';
      loginModal.style.display = 'flex';
      loginEmailInput.focus();
    }
  }

  function cerrarModalLogin() {
    loginModal.style.display = 'none';
  }

  async function procesarLogin(e) {
    e.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    loginErrorEl.style.display = 'none';

    const submitBtn = document.getElementById('btn-submit-login');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i data-lucide="loader-2" class="animate-spin" style="width: 14px; height: 14px;"></i> Conectando...';
    lucide.createIcons();

    try {
      await window.StorageModule.login(email, password);
      isPedroEditor = true;

      // Cargar los datos desde Supabase con sesión activa
      appConfig = await window.StorageModule.getConfiguration();
      fianzaAcumulado = await window.StorageModule.getFianzaAcumulado();
      historialTransferencias = await window.StorageModule.getHistorial();

      cerrarModalLogin();
      actualizarEstadoAuthVisual();
      actualizarInterfaz();
      alert('¡Acceso de editor autorizado con éxito!');
    } catch (error) {
      console.error('Error de autenticación:', error);
      loginErrorText.innerText = 'Error: ' + (error.message || 'Credenciales incorrectas.');
      loginErrorEl.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  }

  // --- NAVEGACIÓN ---
  function cambiarVista(viewId, _activeLink) {
    // Validar acceso restringido a vistas de editor (Liquidación y Ajustes)
    if ((viewId === 'conciliacion-view' || viewId === 'config-view') && !isPedroEditor) {
      alert('Acceso restringido. Debes iniciar sesión como Editor para acceder a esta sección.');
      const dashboardLink = document.getElementById('nav-dashboard');
      if (dashboardLink) {
        cambiarVista('dashboard-view', dashboardLink);
      }
      return;
    }

    // Desactivar todos los enlaces y secciones
    navLinks.forEach((link) => link.classList.remove('active'));
    mobileBottomNavItems.forEach((item) => item.classList.remove('active'));
    viewSections.forEach((sec) => sec.classList.remove('active'));

    // Activar sección actual
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Activar enlace correspondiente en el sidebar
    navLinks.forEach((link) => {
      if (link.getAttribute('data-target') === viewId) {
        link.classList.add('active');
      }
    });

    // Activar enlace correspondiente en la barra inferior móvil
    mobileBottomNavItems.forEach((item) => {
      if (item.getAttribute('data-target') === viewId) {
        item.classList.add('active');
      }
    });

    // Adaptar cabecera y selector de mes según la sección
    if (viewId === 'dashboard-view') {
      pageTitle.innerText = 'Mes Actual';
      pageSubtitle.innerText = 'Calcula las transferencias del mes e incrementa tus ahorros.';
      monthSelectorContainer.style.display = 'flex';
      actualizarDashboardMes();
    } else if (viewId === 'fianza-view') {
      pageTitle.innerText = 'Fondo de Fianza';
      pageSubtitle.innerText = 'Monitorea el progreso de reposición y añade ahorros adicionales.';
      monthSelectorContainer.style.display = 'none';
      actualizarVistaFianza();
    } else if (viewId === 'stats-view') {
      pageTitle.innerText = 'Estadísticas Anuales';
      pageSubtitle.innerText = 'Previsión y desglose anual de los gastos del hogar.';
      monthSelectorContainer.style.display = 'none';
      renderizarGraficoAnual();
      actualizarEstadisticasResumen();
    } else if (viewId === 'historial-view') {
      pageTitle.innerText = 'Historial';
      pageSubtitle.innerText = 'Revisa los registros guardados de las transferencias realizadas.';
      monthSelectorContainer.style.display = 'none';
      actualizarVistaHistorial();
    } else if (viewId === 'config-view') {
      pageTitle.innerText = 'Configuración';
      pageSubtitle.innerText = 'Edita los importes y gastos del sistema sin tocar código.';
      monthSelectorContainer.style.display = 'none';
      cargarInputsConfiguracion();
    } else if (viewId === 'conciliacion-view') {
      pageTitle.innerText = 'Liquidación y Conciliación';
      pageSubtitle.innerText =
        'Controla el saldo del día 15, salvaguarda la fianza y liquida diferencias.';
      monthSelectorContainer.style.display = 'flex';
      actualizarVistaConciliacion();
    } else if (viewId === 'prevision-view') {
      pageTitle.innerText = 'Previsión Anual';
      pageSubtitle.innerText =
        'Consulta el calendario de aportaciones previstas mes a mes para cada persona.';
      monthSelectorContainer.style.display = 'none';
      actualizarVistaPrevision();
    }

    // Refrescar iconos y aplicar seguridad a controles
    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  // --- INTERFAZ GENERAL ---
  function actualizarInterfaz() {
    actualizarDashboardMes();
    actualizarVistaFianza();
    actualizarVistaHistorial();
    actualizarEstadisticasResumen();
    actualizarTablaConciliaciones();
  }

  // --- LÓGICA VISTA: DASHBOARD ---
  function actualizarDashboardMes() {
    actualizarAlertasMes(currentMonthIndex);
    const desglose = window.CalculationsModule.calcularDesgloseMes(currentMonthIndex, appConfig);

    // Formatear montos principales
    totalOlgaEl.innerHTML = `${formatMoneda(desglose.desgloseOlga.total)} <span class="monto-currency">€</span>`;
    totalPedroEl.innerHTML = `${formatMoneda(desglose.desglosePedro.total)} <span class="monto-currency">€</span>`;

    // Renderizar conceptos Olga
    renderizarConceptos(conceptosOlgaEl, desglose.desgloseOlga.conceptos);

    // Renderizar conceptos Pedro
    renderizarConceptos(conceptosPedroEl, desglose.desglosePedro.conceptos);

    // Renderizar Superávit de Olga
    const superavitAcumulado = appConfig.gastosPersonales?.olga?.superavit || 0;
    const ingresoHabitual =
      appConfig.gastosPersonales?.olga?.ingresoHabitual !== undefined
        ? appConfig.gastosPersonales.olga.ingresoHabitual
        : 550.0;
    const superavitMes = window.CalculationsModule.calcularSuperavit(
      ingresoHabitual,
      desglose.desgloseOlga.total
    );

    if (olgaSuperavitBadge) {
      olgaSuperavitBadge.className = 'superavit-box-badge';
      if (superavitAcumulado > 0) {
        olgaSuperavitBadge.textContent = `+${formatMoneda(superavitAcumulado)} €`;
      } else if (superavitAcumulado < 0) {
        olgaSuperavitBadge.classList.add('negative');
        olgaSuperavitBadge.textContent = `${formatMoneda(superavitAcumulado)} €`;
      } else {
        olgaSuperavitBadge.classList.add('neutral');
        olgaSuperavitBadge.textContent = '0,00 €';
      }
    }

    if (olgaSuperavitDetail) {
      const signoMes = superavitMes > 0 ? '+' : '';
      olgaSuperavitDetail.innerHTML = `Ingreso habitual: <strong>${formatMoneda(ingresoHabitual)} €</strong> &bull; Superávit este mes: <span style="font-weight: 600; color: ${superavitMes >= 0 ? '#10b981' : '#ef4444'}">${signoMes}${formatMoneda(superavitMes)} €</span>`;
    }

    // Renderizar Dinero que debería haber en cuenta común (Fianza repuesta + Superávit de Olga)
    const dineroEsperadoTotal = window.CalculationsModule.calcularDineroEsperadoCuenta(
      fianzaAcumulado,
      superavitAcumulado
    );
    if (dineroEsperadoCuentaEl) {
      dineroEsperadoCuentaEl.innerHTML = `${formatMoneda(dineroEsperadoTotal)} <span class="monto-currency">€</span>`;
    }
    if (dineroEsperadoDesgloseEl) {
      dineroEsperadoDesgloseEl.innerHTML = `Fianza repuesta: <strong>${formatMoneda(fianzaAcumulado)} €</strong> + Superávit Olga: <strong>${formatMoneda(superavitAcumulado)} €</strong>`;
    }

    // Verificar si el mes actual está marcado como completado
    const yaRegistrado = historialTransferencias.some(
      (t) => t.mesIndex === currentMonthIndex && t.anio === currentAnio
    );

    if (yaRegistrado) {
      btnCompletarMes.disabled = true;
      btnCompletarMes.innerHTML = '<i data-lucide="check-check"></i> Transferencia registrada';
    } else {
      btnCompletarMes.disabled = !isPedroEditor;
      btnCompletarMes.innerHTML = '<i data-lucide="check-circle2"></i> Transferencia realizada';
    }

    // Volver a aplicar opacidades por rol
    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  function renderizarConceptos(container, conceptos) {
    container.innerHTML = '';
    conceptos.forEach((c) => {
      const item = document.createElement('div');
      item.className = 'concepto-item';

      // Elegir icono según tipo
      let iconName = 'info';
      if (c.tipo === 'comun') {
        iconName = c.nombre.includes('Hipoteca') ? 'home' : 'building';
      } else if (c.tipo === 'personal') {
        iconName = c.nombre.includes('Coche') ? 'car' : 'shopping-bag';
      } else if (c.tipo === 'fianza') {
        iconName = 'piggy-bank';
      } else if (c.tipo === 'extraordinario') {
        iconName = 'sparkles';
      }

      item.innerHTML = `
        <span class="concepto-label">
          <i data-lucide="${iconName}" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
          <span>${c.nombre}</span>
          <span class="concepto-tag ${c.tipo}">${c.tipo}</span>
        </span>
        <span class="concepto-value">${formatMoneda(c.valor)} €</span>
      `;
      container.appendChild(item);
    });
  }

  function actualizarAlertasMes(mesIndex) {
    alertasMesEl.innerHTML = '';
    const alertas = appConfig.alertas || { mesHipoteca: 9, mesManutencion: 5, mesAlquiler: 10 };

    let htmlAlertas = '';

    if (mesIndex === parseInt(alertas.mesHipoteca)) {
      htmlAlertas += `
        <div class="alert-banner">
          <div class="alert-banner-icon"><i data-lucide="alert-triangle"></i></div>
          <div class="alert-banner-content">
            <strong>Regularización de Hipoteca Variable:</strong> Este mes de ${NOMBRES_MESES[mesIndex]} se regulariza la cuota hipotecaria. Por favor, revisa si el importe ha cambiado y actualízalo en la pestaña de Ajustes.
          </div>
        </div>
      `;
    }

    if (mesIndex === parseInt(alertas.mesManutencion)) {
      htmlAlertas += `
        <div class="alert-banner">
          <div class="alert-banner-icon"><i data-lucide="alert-triangle"></i></div>
          <div class="alert-banner-content">
            <strong>Actualización por IPC de Manutención:</strong> En ${NOMBRES_MESES[mesIndex]} se debe actualizar la cuota de manutención de Olga conforme al IPC. Modifica el importe en la pestaña de Ajustes.
          </div>
        </div>
      `;
    }

    if (mesIndex === parseInt(alertas.mesAlquiler)) {
      htmlAlertas += `
        <div class="alert-banner">
          <div class="alert-banner-icon"><i data-lucide="alert-triangle"></i></div>
          <div class="alert-banner-content">
            <strong>Actualización por IRAV de Alquiler:</strong> En ${NOMBRES_MESES[mesIndex]} se actualiza el ingreso por alquiler de la casa de acuerdo al IRAV. Ajusta el ingreso de alquiler en la pestaña de Ajustes.
          </div>
        </div>
      `;
    }

    if (htmlAlertas) {
      alertasMesEl.innerHTML = htmlAlertas;
      lucide.createIcons();
    }
  }

  // --- LÓGICA VISTA: FONDO FIANZA ---
  async function actualizarVistaFianza() {
    const objetivo = appConfig.fianza.objective || appConfig.fianza.objetivo || 450.0;
    const actual = fianzaAcumulado;
    const pendiente = Math.max(0, window.CalculationsModule.round(objetivo - actual));
    const porcentaje = Math.min(100, window.CalculationsModule.round((actual / objetivo) * 100));

    // Elementos visuales
    fianzaPorcentajeEl.innerText = `${porcentaje}%`;
    fianzaProgressBarEl.style.width = `${porcentaje}%`;
    fianzaObjetivoEl.innerText = `${formatMoneda(objetivo)} €`;
    fianzaAcumuladoEl.innerText = `${formatMoneda(actual)} €`;
    fianzaPendienteEl.innerText = `${formatMoneda(pendiente)} €`;

    // Estado del cerdito/ahorro
    if (actual >= objetivo) {
      fianzaEstadoIconEl.className = 'fianza-status-icon text-success';
      fianzaEstadoIconEl.innerHTML = '<i data-lucide="party-popper"></i>';
      fianzaEstadoTituloEl.innerText = '¡Objetivo Conseguido!';
      fianzaEstadoDescEl.innerText =
        'El fondo de la fianza de 450 € ha sido repuesto por completo. ¡Buen trabajo!';
      btnAportarManual.disabled = true;
      btnRetirarManual.disabled = !isPedroEditor || actual <= 0;
      inputAportacionExtra.disabled = !isPedroEditor;
    } else {
      fianzaEstadoIconEl.className = 'fianza-status-icon text-primary';
      fianzaEstadoIconEl.innerHTML = '<i data-lucide="piggy-bank"></i>';
      fianzaEstadoTituloEl.innerText = 'Ahorrando...';
      fianzaEstadoDescEl.innerText = `Lleváis acumulados ${formatMoneda(actual)} € de los ${formatMoneda(objetivo)} € necesarios. Falta por ahorrar ${formatMoneda(pendiente)} €.`;
      btnAportarManual.disabled = !isPedroEditor;
      btnRetirarManual.disabled = !isPedroEditor || actual <= 0;
      inputAportacionExtra.disabled = !isPedroEditor;
    }

    // Actualizar tabla del historial de fianza
    try {
      fianzaHistorial = await window.StorageModule.getFianzaHistorial();
      actualizarTablaFianzaHistorial();
    } catch (err) {
      console.error('Error al actualizar la tabla de historial de fianza:', err);
    }

    // Aplicar opacidades según rol
    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  function actualizarTablaFianzaHistorial() {
    if (!tablaFianzaHistorialBody) return;
    tablaFianzaHistorialBody.innerHTML = '';

    if (!fianzaHistorial || fianzaHistorial.length === 0) {
      tablaFianzaHistorialBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state" style="text-align: center; padding: 2.5rem 0.5rem; color: var(--text-muted);">
            <i data-lucide="inbox" style="width: 28px; height: 28px; margin-bottom: 0.5rem; opacity: 0.7; display: block; margin-left: auto; margin-right: auto;"></i>
            No hay movimientos registrados en el fondo de fianza.
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    fianzaHistorial.forEach((m) => {
      const row = document.createElement('tr');
      const fecha = new Date(m.fecha);
      const fechaFormateada = `${agregarCero(fecha.getDate())}/${agregarCero(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${agregarCero(fecha.getHours())}:${agregarCero(fecha.getMinutes())}`;

      const esPositivo = m.importe >= 0;
      const claseImporte = esPositivo ? 'text-success' : 'text-danger';
      const signo = esPositivo ? '+' : '';

      row.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.85rem; padding: 0.75rem 0.5rem;">${fechaFormateada}</td>
        <td style="font-weight: 500; padding: 0.75rem 0.5rem;">${m.concepto}</td>
        <td class="${claseImporte} font-title" style="font-weight: 600; text-align: right; padding: 0.75rem 0.5rem;">${signo}${formatMoneda(m.importe)} €</td>
        <td class="font-title" style="font-weight: 600; text-align: right; color: var(--text-main); padding: 0.75rem 0.5rem;">${formatMoneda(m.acumuladoDespues)} €</td>
        <td style="text-align: center; padding: 0.75rem 0.5rem;">
          <button class="btn-icon delete btn-delete-fianza-mov" title="Eliminar Movimiento" data-id="${m.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      `;

      // Evento de borrado
      const btnDelete = row.querySelector('.btn-delete-fianza-mov');
      btnDelete.addEventListener('click', async () => {
        if (!isPedroEditor) return;
        if (
          confirm(
            `¿Estás seguro de que deseas eliminar el movimiento "${m.concepto}"? Esto revertirá su impacto de ${formatMoneda(m.importe)} € en el saldo actual de la fianza.`
          )
        ) {
          const nuevoAcumulado = window.CalculationsModule.round(fianzaAcumulado - m.importe);
          try {
            await window.StorageModule.saveFianzaAcumulado(nuevoAcumulado);
            await window.StorageModule.deleteMovimientoFianza(m.id);
            fianzaAcumulado = nuevoAcumulado;
            actualizarInterfaz();
            alert('Movimiento eliminado y saldo de la fianza actualizado con éxito.');
          } catch (e) {
            alert('Error al intentar eliminar el movimiento de la base de datos.');
          }
        }
      });

      tablaFianzaHistorialBody.appendChild(row);
    });
  }

  async function aportarManualFianza() {
    if (!isPedroEditor) return;
    const valor = parseFloat(inputAportacionExtra.value);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, introduce un importe de aportación válido superior a 0 €.');
      return;
    }

    const objetivo = appConfig.fianza.objetivo;
    const pendiente = objetivo - fianzaAcumulado;

    if (pendiente <= 0) {
      alert('El objetivo de la fianza ya ha sido alcanzado.');
      return;
    }

    let aportacionReal = valor;
    if (valor > pendiente) {
      aportacionReal = pendiente;
      alert(
        `La aportación excede el límite del objetivo. Se ha ajustado la aportación a ${formatMoneda(pendiente)} €.`
      );
    }

    fianzaAcumulado = window.CalculationsModule.round(fianzaAcumulado + aportacionReal);

    try {
      await window.StorageModule.saveFianzaAcumulado(fianzaAcumulado);
      await window.StorageModule.addMovimientoFianza(
        'Aportación manual',
        aportacionReal,
        fianzaAcumulado
      );
      inputAportacionExtra.value = '';
      actualizarInterfaz();
      alert(`Se han añadido ${formatMoneda(aportacionReal)} € al fondo de la fianza con éxito.`);
    } catch (e) {
      alert('Error al intentar guardar el acumulado de fianza en la base de datos.');
    }
  }

  async function retirarManualFianza() {
    if (!isPedroEditor) return;
    const valor = parseFloat(inputAportacionExtra.value);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, introduce un importe a retirar válido superior a 0 €.');
      return;
    }

    if (fianzaAcumulado <= 0) {
      alert('No hay fondos acumulados en la fianza para retirar.');
      return;
    }

    let retiroReal = valor;
    if (valor > fianzaAcumulado) {
      retiroReal = fianzaAcumulado;
      alert(
        `El importe excede el acumulado actual. Se ha ajustado el retiro al total disponible de ${formatMoneda(fianzaAcumulado)} €.`
      );
    }

    fianzaAcumulado = window.CalculationsModule.round(fianzaAcumulado - retiroReal);

    try {
      await window.StorageModule.saveFianzaAcumulado(fianzaAcumulado);
      await window.StorageModule.addMovimientoFianza('Retiro manual', -retiroReal, fianzaAcumulado);
      inputAportacionExtra.value = '';
      actualizarInterfaz();
      alert(`Se han retirado ${formatMoneda(retiroReal)} € del fondo de la fianza con éxito.`);
    } catch (e) {
      alert('Error al intentar retirar fondos de la fianza de la base de datos.');
    }
  }

  // --- ACCIÓN COMPLETAR MES ---
  async function completarMesActual() {
    if (!isPedroEditor) return;
    const desglose = window.CalculationsModule.calcularDesgloseMes(currentMonthIndex, appConfig);
    const yaRegistrado = historialTransferencias.some(
      (t) => t.mesIndex === currentMonthIndex && t.anio === currentAnio
    );

    if (yaRegistrado) {
      alert('Este mes ya se encuentra completado y registrado en el historial.');
      return;
    }

    // 1. Aportar automáticamente a la fianza si no se ha alcanzado la meta
    const objetivo = appConfig.fianza.objetivo;
    const aporteMensualFondo = appConfig.fianza.aportacionMensualPersona * 2; // 20 €
    let fianzaNueva = fianzaAcumulado;
    let aportacionRealizada = 0;

    if (fianzaAcumulado < objetivo) {
      const pendiente = objetivo - fianzaAcumulado;
      aportacionRealizada = Math.min(aporteMensualFondo, pendiente);
      fianzaNueva = window.CalculationsModule.round(fianzaAcumulado + aportacionRealizada);
      fianzaAcumulado = fianzaNueva;

      try {
        await window.StorageModule.saveFianzaAcumulado(fianzaAcumulado);
        if (aportacionRealizada > 0) {
          await window.StorageModule.addMovimientoFianza(
            `Aportación mensual (${NOMBRES_MESES[currentMonthIndex]})`,
            aportacionRealizada,
            fianzaAcumulado
          );
        }
      } catch (err) {
        console.error(
          'Error al registrar fianza acumulada en base de datos. Continuando registro de mes:',
          err
        );
      }
    }

    // 2. Calcular superávit de Olga e ingreso registrado
    const ingresoOlga =
      appConfig.gastosPersonales?.olga?.ingresoHabitual !== undefined
        ? appConfig.gastosPersonales.olga.ingresoHabitual
        : 550.0;
    const cuotaTeoricaOlga = desglose.desgloseOlga.total;
    const superavitMes = window.CalculationsModule.calcularSuperavit(ingresoOlga, cuotaTeoricaOlga);

    if (superavitMes !== 0) {
      const superavitAnteriorCents = Math.round(
        (appConfig.gastosPersonales?.olga?.superavit || 0) * 100
      );
      const superavitMesCents = Math.round(superavitMes * 100);
      const nuevoSuperavit = (superavitAnteriorCents + superavitMesCents) / 100;

      if (!appConfig.gastosPersonales) appConfig.gastosPersonales = {};
      if (!appConfig.gastosPersonales.olga) appConfig.gastosPersonales.olga = {};
      appConfig.gastosPersonales.olga.superavit = nuevoSuperavit;

      try {
        await window.StorageModule.saveConfiguration(appConfig);
      } catch (errConfig) {
        console.error('Error al actualizar superávit de Olga en base de datos:', errConfig);
      }
    }

    // 3. Registrar en el historial
    const registro = {
      mesIndex: currentMonthIndex,
      mesNombre: NOMBRES_MESES[currentMonthIndex],
      anio: currentAnio,
      fechaCompletado: new Date().toISOString(),
      transferenciaOlga: ingresoOlga,
      transferenciaPedro: desglose.desglosePedro.total,
      fianzaAlMomento: fianzaAcumulado,
      desglose: {
        ...desglose,
        ingresoRealOlga: ingresoOlga,
        cuotaTeoricaOlga: cuotaTeoricaOlga,
        superavitMesOlga: superavitMes
      }
    };

    try {
      const exito = await window.StorageModule.addTransferenciaAlHistorial(registro);
      if (exito) {
        historialTransferencias = await window.StorageModule.getHistorial();
        actualizarInterfaz();

        let mensaje = `¡Excelente! El mes de ${NOMBRES_MESES[currentMonthIndex]} se ha guardado como completado.\n\n- Ingreso registrado para Olga: ${formatMoneda(ingresoOlga)} € (Cuota teórica: ${formatMoneda(cuotaTeoricaOlga)} €).`;
        if (superavitMes > 0) {
          mensaje += `\n- Se ha sumado un superávit de +${formatMoneda(superavitMes)} € al saldo acumulado de Olga (Saldo acumulado: ${formatMoneda(appConfig.gastosPersonales.olga.superavit)} €).`;
        } else if (superavitMes < 0) {
          mensaje += `\n- Como el ingreso fue inferior a la cuota, se han descontado ${formatMoneda(Math.abs(superavitMes))} € de su superávit (Saldo restante: ${formatMoneda(appConfig.gastosPersonales.olga.superavit)} €).`;
        }
        if (aportacionRealizada > 0) {
          mensaje += `\n- Se han sumado ${formatMoneda(aportacionRealizada)} € al fondo de la fianza.`;
        } else {
          mensaje +=
            '\n- El fondo de fianza ya estaba al máximo, por lo que no se han añadido importes adicionales.';
        }
        alert(mensaje);
      } else {
        alert('Hubo un error al registrar la transferencia. Inténtalo de nuevo.');
      }
    } catch (e) {
      alert(
        'Error al intentar conectar con la base de datos remota para registrar la transferencia.'
      );
    }
  }

  // --- LÓGICA VISTA: HISTORIAL ---
  async function actualizarVistaHistorial() {
    tablaHistorialBody.innerHTML = '';

    if (historialTransferencias.length === 0) {
      tablaHistorialBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i data-lucide="inbox"></i>
            Aún no hay meses registrados en el historial de transferencias.
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    // Ordenar de más reciente a más antiguo
    const historialOrdenado = [...historialTransferencias].sort((a, b) => b.mesIndex - a.mesIndex);

    historialOrdenado.forEach((t) => {
      const row = document.createElement('tr');

      const fecha = new Date(t.fechaCompletado);
      const fechaFormateada = `${agregarCero(fecha.getDate())}/${agregarCero(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${agregarCero(fecha.getHours())}:${agregarCero(fecha.getMinutes())}`;

      row.innerHTML = `
        <td style="font-weight: 600;">${t.mesNombre} / ${t.anio}</td>
        <td class="text-primary font-title" style="font-weight: 600;">${formatMoneda(t.transferenciaOlga)} €</td>
        <td class="font-title" style="font-weight: 600; color: #3b82f6;">${formatMoneda(t.transferenciaPedro)} €</td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${fechaFormateada}</td>
        <td style="font-weight: 600;" class="text-success">${formatMoneda(t.fianzaAlMomento)} €</td>
        <td><span class="badge-completado">Completado</span></td>
        <td style="text-align: center;">
          <button class="btn-icon delete" title="Eliminar Registro" data-mes="${t.mesIndex}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      `;

      // Evento para eliminar
      const btnDelete = row.querySelector('.btn-icon.delete');
      btnDelete.addEventListener('click', async () => {
        if (!isPedroEditor) return;
        if (
          confirm(
            `¿Estás seguro de que deseas eliminar el registro de ${t.mesNombre}? Esto no modificará el acumulado actual de la fianza automáticamente, pero permitirá volver a registrar este mes.`
          )
        ) {
          try {
            await window.StorageModule.deleteTransferenciaDelHistorial(t.mesIndex, t.anio);
            historialTransferencias = await window.StorageModule.getHistorial();
            actualizarInterfaz();
          } catch (e) {
            alert('Error al intentar eliminar el registro de la base de datos.');
          }
        }
      });

      tablaHistorialBody.appendChild(row);
    });

    // Aplicar seguridad visual a los botones de eliminación individuales
    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  // --- LÓGICA VISTA: ESTADÍSTICAS ---
  function actualizarEstadisticasResumen() {
    let totalOlgaAnual = 0;
    let totalPedroAnual = 0;
    let totalExtraordinarios = 0;

    for (let m = 0; m < 12; m++) {
      const desg = window.CalculationsModule.calcularDesgloseMes(m, appConfig);
      totalOlgaAnual += desg.desgloseOlga.total;
      totalPedroAnual += desg.desglosePedro.total;

      // Sumar extraordinarios
      const extraordinariosDelMes =
        desg.desgloseOlga.conceptos
          .filter((c) => c.tipo === 'extraordinario')
          .reduce((sum, c) => sum + c.valor, 0) * 2; // Por dos (Olga + Pedro)

      totalExtraordinarios += extraordinariosDelMes;
    }

    statsTotalOlgaEl.innerText = `${formatMoneda(totalOlgaAnual)} €`;
    statsTotalPedroEl.innerText = `${formatMoneda(totalPedroAnual)} €`;
    statsTotalExtraEl.innerText = `${formatMoneda(totalExtraordinarios)} €`;
  }

  function renderizarGraficoAnual() {
    const canvas = document.getElementById('graficoGastosAnual');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Destruir gráfico previo si existe
    if (miGrafico) {
      miGrafico.destroy();
    }

    const dataOlga = [];
    const dataPedro = [];

    // Estilos dinámicos según el tema
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textThemeColor = isDark ? '#94a3b8' : '#64748b';
    const gridThemeColor = isDark ? '#1e293b' : '#e2e8f0';

    for (let m = 0; m < 12; m++) {
      const desg = window.CalculationsModule.calcularDesgloseMes(m, appConfig);
      dataOlga.push(desg.desgloseOlga.total);
      dataPedro.push(desg.desglosePedro.total);
    }

    miGrafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: NOMBRES_MESES,
        datasets: [
          {
            label: 'Transferencia Olga (€)',
            data: dataOlga,
            backgroundColor: isDark ? 'rgba(129, 140, 248, 0.85)' : 'rgba(99, 102, 241, 0.85)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Transferencia Pedro (€)',
            data: dataPedro,
            backgroundColor: isDark ? 'rgba(96, 165, 250, 0.85)' : 'rgba(59, 130, 246, 0.85)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textThemeColor,
              font: {
                family: "'Inter', sans-serif",
                weight: '500'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: false,
            grid: {
              display: false
            },
            ticks: {
              color: textThemeColor
            }
          },
          y: {
            stacked: false,
            grid: {
              color: gridThemeColor
            },
            ticks: {
              color: textThemeColor,
              callback: function (value) {
                return value + ' €';
              }
            }
          }
        }
      }
    });
  }

  // --- LÓGICA VISTA: AJUSTES / CONFIGURACIÓN ---
  function cargarInputsConfiguracion() {
    cfgHipotecaCuota.value = appConfig.gastosFijos.cuotaHipoteca;
    cfgHipotecaAlquiler.value = appConfig.gastosFijos.ingresoAlquiler;
    cfgComunidad.value = appConfig.gastosFijos.comunidad;
    cfgFianzaObjetivo.value = appConfig.fianza.objetivo;
    cfgFianzaMensual.value = appConfig.fianza.aportacionMensualPersona;
    cfgOlgaCoche.value = appConfig.gastosPersonales.olga.coche;
    cfgOlgaManutencion.value = appConfig.gastosPersonales.olga.manutencion;
    cfgOlgaIngresoHabitual.value =
      appConfig.gastosPersonales?.olga?.ingresoHabitual !== undefined
        ? appConfig.gastosPersonales.olga.ingresoHabitual
        : 550.0;
    cfgOlgaSuperavit.value =
      appConfig.gastosPersonales?.olga?.superavit !== undefined
        ? appConfig.gastosPersonales.olga.superavit
        : 0.0;

    // Buscar extraordinarios
    const ibi = appConfig.gastosExtraordinarios.find((e) => e.id === 'ibi');
    const seguro = appConfig.gastosExtraordinarios.find((e) => e.id === 'seguro_hogar');

    cfgExtraIbi.value = ibi ? ibi.importeTotal : 0;
    cfgExtraSeguro.value = seguro ? seguro.importeTotal : 0;

    // Cargar meses de regularización y alertas
    const alertas = appConfig.alertas || {
      mesHipoteca: 9,
      mesManutencion: 5,
      mesAlquiler: 10,
      tasaManutencion: 2.0,
      tasaAlquiler: 2.0,
      cuotaHipotecaNueva: 777.37
    };
    cfgAlertaHipoteca.value = alertas.mesHipoteca;
    cfgAlertaManutencion.value = alertas.mesManutencion;
    cfgAlertaAlquiler.value = alertas.mesAlquiler;
    cfgHipotecaNueva.value =
      alertas.cuotaHipotecaNueva !== undefined
        ? alertas.cuotaHipotecaNueva
        : appConfig.gastosFijos.cuotaHipoteca;
    cfgIpcTasa.value = alertas.tasaManutencion !== undefined ? alertas.tasaManutencion : 2.0;
    cfgIravTasa.value = alertas.tasaAlquiler !== undefined ? alertas.tasaAlquiler : 2.0;
  }

  async function guardarAjustes() {
    if (!isPedroEditor) return;
    const cuotaHip = parseFloat(cfgHipotecaCuota.value);
    const alqHip = parseFloat(cfgHipotecaAlquiler.value);
    const com = parseFloat(cfgComunidad.value);
    const fiaObj = parseFloat(cfgFianzaObjetivo.value);
    const fiaMen = parseFloat(cfgFianzaMensual.value);
    const cocheO = parseFloat(cfgOlgaCoche.value);
    const manO = parseFloat(cfgOlgaManutencion.value);
    const ingHabO = parseFloat(cfgOlgaIngresoHabitual.value);
    const superavitO = parseFloat(cfgOlgaSuperavit.value);
    const ibiTotal = parseFloat(cfgExtraIbi.value);
    const seguroTotal = parseFloat(cfgExtraSeguro.value);

    // Validaciones
    const cuotaHipNueva = parseFloat(cfgHipotecaNueva.value);
    const ipcTasa = parseFloat(cfgIpcTasa.value);
    const iravTasa = parseFloat(cfgIravTasa.value);

    if (
      [
        cuotaHip,
        alqHip,
        com,
        fiaObj,
        fiaMen,
        cocheO,
        manO,
        ingHabO,
        ibiTotal,
        seguroTotal,
        cuotaHipNueva,
        ipcTasa,
        iravTasa
      ].some((v) => isNaN(v) || v < 0) ||
      isNaN(superavitO)
    ) {
      alert(
        'Por favor, asegúrate de que todos los campos son valores numéricos válidos iguales o superiores a 0.'
      );
      return;
    }

    // Actualizar configuración
    appConfig.gastosFijos.cuotaHipoteca = cuotaHip;
    appConfig.gastosFijos.ingresoAlquiler = alqHip;
    appConfig.gastosFijos.comunidad = com;
    appConfig.fianza.objetivo = fiaObj;
    appConfig.fianza.aportacionMensualPersona = fiaMen;
    appConfig.gastosPersonales.olga.coche = cocheO;
    appConfig.gastosPersonales.olga.manutencion = manO;
    appConfig.gastosPersonales.olga.ingresoHabitual = ingHabO;
    appConfig.gastosPersonales.olga.superavit = window.CalculationsModule.round(superavitO);

    // Modificar extraordinarios
    const ibi = appConfig.gastosExtraordinarios.find((e) => e.id === 'ibi');
    if (ibi) ibi.importeTotal = ibiTotal;

    const seguro = appConfig.gastosExtraordinarios.find((e) => e.id === 'seguro_hogar');
    if (seguro) seguro.importeTotal = seguroTotal;

    // Guardar meses de regularización y alertas
    if (!appConfig.alertas) appConfig.alertas = {};
    appConfig.alertas.mesHipoteca = parseInt(cfgAlertaHipoteca.value);
    appConfig.alertas.mesManutencion = parseInt(cfgAlertaManutencion.value);
    appConfig.alertas.mesAlquiler = parseInt(cfgAlertaAlquiler.value);
    appConfig.alertas.cuotaHipotecaNueva = cuotaHipNueva;
    appConfig.alertas.tasaManutencion = ipcTasa;
    appConfig.alertas.tasaAlquiler = iravTasa;

    // Guardar en Storage (asíncrono)
    try {
      await window.StorageModule.saveConfiguration(appConfig);
      actualizarInterfaz();
      alert('¡Ajustes guardados con éxito en la base de datos de la nube!');
    } catch (err) {
      alert('Error al intentar guardar los ajustes en la base de datos.');
    }
  }

  async function restaurarAjustesPorDefecto() {
    if (!isPedroEditor) return;
    if (
      confirm(
        '¿Estás seguro de que deseas restablecer los importes a los valores por defecto del problema de negocio? Se perderán las modificaciones de la base de datos.'
      )
    ) {
      try {
        appConfig = await window.StorageModule.resetConfiguration();
        cargarInputsConfiguracion();
        actualizarInterfaz();
        alert('Valores restablecidos por defecto.');
      } catch (err) {
        alert('Error al intentar restablecer los ajustes.');
      }
    }
  }

  // --- EXPORTACIONES ---

  // --- LÓGICA VISTA: PREVISIÓN ANUAL ---
  function actualizarVistaPrevision() {
    const selectPersona = document.getElementById('prevision-persona-select');
    const persona = selectPersona ? selectPersona.value : 'olga';
    const esOlga = persona === 'olga';
    const colorPersona = esOlga ? 'var(--primary)' : '#3b82f6';
    const colorLight = esOlga ? 'var(--primary-light)' : 'rgba(59,130,246,0.12)';
    const alertas = appConfig.alertas || { mesHipoteca: 9, mesManutencion: 5, mesAlquiler: 10 };

    // Actualizar cabecera de la tabla
    const tableTitle = document.getElementById('prevision-table-title');
    if (tableTitle)
      tableTitle.textContent = `Calendario de Aportaciones — ${esOlga ? 'Olga' : 'Pedro'}`;

    // Mostrar/ocultar columnas personales (coche y manutención son de Olga)
    const thCoche = document.getElementById('prevision-th-coche');
    const thManutencion = document.getElementById('prevision-th-manutencion');
    if (thCoche) thCoche.style.display = esOlga ? '' : 'none';
    if (thManutencion) thManutencion.style.display = esOlga ? '' : 'none';

    // Construir filas mes a mes (tanto para tabla como para tarjetas móviles)
    let totalAnual = 0;
    let totalHipoteca = 0;
    let totalComunidad = 0;
    let totalFianza = 0;
    let totalPersonal = 0;
    let totalExtra = 0;
    let cardsHTML = '';
    const mesActual = new Date().getMonth();
    const tbody = document.getElementById('prevision-tabla-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (let m = 0; m < 12; m++) {
      const desg = window.CalculationsModule.calcularDesgloseMes(m, appConfig);
      const conceptos = esOlga ? desg.desgloseOlga.conceptos : desg.desglosePedro.conceptos;
      const total = esOlga ? desg.desgloseOlga.total : desg.desglosePedro.total;

      const hipoteca = conceptos.find((c) => c.nombre.includes('Hipoteca'))?.valor || 0;
      const comunidad = conceptos.find((c) => c.nombre.includes('Comunidad'))?.valor || 0;
      const fianza = conceptos.find((c) => c.tipo === 'fianza')?.valor || 0;
      const coche = esOlga ? conceptos.find((c) => c.nombre.includes('Coche'))?.valor || 0 : 0;
      const manutencion = esOlga
        ? conceptos.find((c) => c.nombre.includes('Manutenci'))?.valor || 0
        : 0;
      const extraordinarios = conceptos
        .filter((c) => c.tipo === 'extraordinario')
        .reduce((s, c) => s + c.valor, 0);

      totalAnual += total;
      totalHipoteca += hipoteca;
      totalComunidad += comunidad;
      totalFianza += fianza;
      totalPersonal += coche + manutencion;
      totalExtra += extraordinarios;

      // Indicadores de meses especiales
      let badges = '';
      if (m === parseInt(alertas.mesHipoteca))
        badges += '<span class="prevision-badge hipoteca">Rev. Hipoteca</span>';
      if (m === parseInt(alertas.mesManutencion))
        badges += '<span class="prevision-badge ipc">IPC Manut.</span>';
      if (m === parseInt(alertas.mesAlquiler))
        badges += '<span class="prevision-badge alquiler">Rev. Alquiler</span>';

      // Highlight mes actual
      const esMesActual = m === mesActual;
      const rowStyle = esMesActual ? `background-color:${colorLight};` : '';
      const tdTotalStyle = `text-align:right;font-weight:700;color:${colorPersona};`;
      const mesNombreHTML = `<span style="font-weight:600;">${NOMBRES_MESES[m]}</span>${badges ? '<br>' + badges : ''}`;

      const tdCoche = esOlga ? `<td style="text-align:right;">${formatMoneda(coche)} €</td>` : '';
      const tdManutencion = esOlga
        ? `<td style="text-align:right;">${formatMoneda(manutencion)} €</td>`
        : '';

      // 1. Fila de la tabla (Desktop y modo Tabla)
      const row = document.createElement('tr');
      if (esMesActual) row.classList.add('prevision-row-actual');
      row.style.cssText = rowStyle;
      row.innerHTML = `
        <td class="sticky-col">${mesNombreHTML}</td>
        <td style="text-align:right;">${formatMoneda(hipoteca)} €</td>
        <td style="text-align:right;">${formatMoneda(comunidad)} €</td>
        <td style="text-align:right;">${formatMoneda(fianza)} €</td>
        ${tdCoche}
        ${tdManutencion}
        <td style="text-align:right;">${extraordinarios > 0 ? formatMoneda(extraordinarios) + ' €' : '<span style="color:var(--text-muted)">—</span>'}</td>
        <td style="${tdTotalStyle}">${formatMoneda(total)} €</td>
      `;
      tbody.appendChild(row);

      // 2. Tarjeta individual para Móvil
      cardsHTML += `
        <div class="prevision-month-card ${esMesActual ? 'is-current-month' : ''}">
          <div class="prevision-month-header">
            <div class="prevision-month-title-box">
              <span class="prevision-month-name">${NOMBRES_MESES[m]}</span>
              ${esMesActual ? '<span class="badge-mes-actual">Mes Actual</span>' : ''}
              ${badges ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">${badges}</div>` : ''}
            </div>
            <div class="prevision-month-total">
              <span class="prevision-month-total-label">Aportación</span>
              <span class="prevision-month-total-val" style="color:${colorPersona};">${formatMoneda(total)} €</span>
            </div>
          </div>
          <div class="prevision-month-body">
            <div class="prevision-concept-chip">
              <span class="chip-label">Hipoteca (50%)</span>
              <span class="chip-val">${formatMoneda(hipoteca)} €</span>
            </div>
            <div class="prevision-concept-chip">
              <span class="chip-label">Comunidad (50%)</span>
              <span class="chip-val">${formatMoneda(comunidad)} €</span>
            </div>
            <div class="prevision-concept-chip">
              <span class="chip-label">Fianza</span>
              <span class="chip-val">${formatMoneda(fianza)} €</span>
            </div>
            ${
              esOlga
                ? `
            <div class="prevision-concept-chip">
              <span class="chip-label">Coche</span>
              <span class="chip-val">${formatMoneda(coche)} €</span>
            </div>
            <div class="prevision-concept-chip">
              <span class="chip-label">Manutención</span>
              <span class="chip-val">${formatMoneda(manutencion)} €</span>
            </div>
            `
                : ''
            }
            <div class="prevision-concept-chip ${extraordinarios > 0 ? 'highlight-extra' : ''}">
              <span class="chip-label">Extraordinarios</span>
              <span class="chip-val">${extraordinarios > 0 ? formatMoneda(extraordinarios) + ' €' : '—'}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Fila de totales en la tabla
    const tdCocheTot = esOlga ? '<td style="text-align:right;font-weight:700;">-</td>' : '';
    const tdManutencionTot = esOlga ? '<td style="text-align:right;font-weight:700;">-</td>' : '';
    const rowTotal = document.createElement('tr');
    rowTotal.style.cssText = `background-color:${colorLight};border-top:2px solid ${colorPersona};`;
    rowTotal.innerHTML = `
      <td class="sticky-col" style="font-weight:800;font-family:'Outfit',sans-serif;font-size:1rem;">TOTAL ANUAL</td>
      <td style="text-align:right;font-weight:700;">${formatMoneda(totalHipoteca)} €</td>
      <td style="text-align:right;font-weight:700;">${formatMoneda(totalComunidad)} €</td>
      <td style="text-align:right;font-weight:700;">${formatMoneda(totalFianza)} €</td>
      ${tdCocheTot}
      ${tdManutencionTot}
      <td style="text-align:right;font-weight:700;">${formatMoneda(totalExtra)} €</td>
      <td style="text-align:right;font-weight:800;color:${colorPersona};font-size:1.05rem;">${formatMoneda(totalAnual)} €</td>
    `;
    tbody.appendChild(rowTotal);

    // Tarjeta de total anual para la vista móvil de tarjetas
    cardsHTML += `
      <div class="prevision-card-total-anual">
        <div>
          <div class="prevision-card-total-title">TOTAL ANUAL PREVISTO</div>
          <span style="font-size:0.75rem;color:var(--text-muted);">Suma completa de los 12 meses</span>
        </div>
        <div class="prevision-card-total-amount" style="color:${colorPersona};">${formatMoneda(totalAnual)} €</div>
      </div>
    `;

    const cardsContainer = document.getElementById('prevision-cards-container');
    const tableContainer = document.getElementById('prevision-table-container');
    const btnToggleTable = document.getElementById('btn-prevision-table');

    if (cardsContainer) cardsContainer.innerHTML = cardsHTML;

    // Asegurar estado por defecto en móvil (Tarjetas activas si no se seleccionó tabla)
    if (cardsContainer && tableContainer) {
      const tablaSeleccionada = btnToggleTable && btnToggleTable.classList.contains('active');
      if (!tablaSeleccionada) {
        cardsContainer.classList.add('view-active');
        tableContainer.classList.add('view-hidden');
      }
    }

    // Badge total
    const totalBadge = document.getElementById('prevision-total-badge');
    if (totalBadge) totalBadge.textContent = `Total previsto: ${formatMoneda(totalAnual)} €`;

    // Tarjetas de resumen
    const summaryGrid = document.getElementById('prevision-summary-grid');
    if (summaryGrid) {
      const conceptosResumen = [
        {
          label: 'Hipoteca + Comunidad',
          valor: totalHipoteca + totalComunidad,
          icon: 'home',
          color: 'var(--primary)',
          light: 'var(--primary-light)'
        },
        {
          label: 'Fondo de Fianza',
          valor: totalFianza,
          icon: 'piggy-bank',
          color: 'var(--success)',
          light: 'var(--success-light)'
        },
        ...(esOlga
          ? [
              {
                label: 'Gastos Personales',
                valor: totalPersonal,
                icon: 'car',
                color: '#f59e0b',
                light: 'var(--warning-light)'
              }
            ]
          : []),
        {
          label: 'Extraordinarios',
          valor: totalExtra,
          icon: 'sparkles',
          color: '#d97706',
          light: 'rgba(217,119,6,0.1)'
        },
        {
          label: 'Total Previsto',
          valor: totalAnual,
          icon: 'trending-up',
          color: colorPersona,
          light: colorLight,
          big: true
        }
      ];
      summaryGrid.innerHTML = conceptosResumen
        .map(
          (item) => `
        <div class="prevision-summary-card glass-card${item.big ? ' prevision-summary-big' : ''}">
          <div class="prevision-summary-icon" style="background-color:${item.light};color:${item.color};">
            <i data-lucide="${item.icon}"></i>
          </div>
          <div class="prevision-summary-info">
            <div class="prevision-summary-label">${item.label}</div>
            <div class="prevision-summary-value" style="color:${item.color};">${formatMoneda(item.valor)} €</div>
          </div>
        </div>
      `
        )
        .join('');
      lucide.createIcons();
    }

    // Nota informativa
    const notaTexto = document.getElementById('prevision-nota-texto');
    if (notaTexto) {
      if (esOlga) {
        notaTexto.innerHTML = `<strong>Olga:</strong> Los gastos comunes (Hipoteca Neta y Comunidad) se calculan al 50%. Los gastos personales incluyen coche y manutención, esta última se actualiza según IPC en ${NOMBRES_MESES[parseInt(alertas.mesManutencion)]}. Los extraordinarios (IBI, Seguro) se prorratean entre ambas personas en los meses correspondientes. La fila resaltada indica el mes actual.`;
      } else {
        notaTexto.innerHTML = `<strong>Pedro:</strong> Los gastos comunes (Hipoteca Neta y Comunidad) se calculan al 50%. Pedro no tiene gastos personales fijos asignados actualmente. Los extraordinarios (IBI, Seguro) se prorratean en los meses configurados. La hipoteca se revisa en ${NOMBRES_MESES[parseInt(alertas.mesHipoteca)]} y el alquiler en ${NOMBRES_MESES[parseInt(alertas.mesAlquiler)]}. La fila resaltada indica el mes actual.`;
      }
    }
  }

  // --- MOTOR UNIVERSAL DE EXPORTACIÓN Y DESCARGA DE PDF ---

  function mostrarModalDescargaPdf(blobUrl, filename) {
    const modal = document.getElementById('pdf-download-modal');
    const btnDescarga = document.getElementById('btn-pdf-modal-download');
    if (modal && btnDescarga) {
      btnDescarga.href = blobUrl;
      btnDescarga.download = filename;
      modal.style.display = 'flex';
      if (window.lucide) lucide.createIcons();
    }
  }

  /**
   * Entrega el Blob PDF al usuario mediante Web Share API (móviles/PWA) o descarga directa con modal de respaldo.
   */
  async function entregarArchivoPdf(pdfBlob, filename) {
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // 1. Web Share API nativa (iOS Safari, Android Chrome, PWAs instaladas)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
          text: `Informe ${filename} generado desde CommonPay`
        });
        return;
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') return; // Cancelado voluntariamente por el usuario
        console.warn('Fallo en navigator.share, procediendo a descarga directa:', shareErr);
      }
    }

    // 2. Descarga tradicional por Blob URL
    const blobUrl = URL.createObjectURL(pdfBlob);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // En iOS Safari, a.download en blobs se bloquea; abrimos la URL del blob en pestaña nueva
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        window.location.href = blobUrl;
      }
    } else {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 2000);
    }

    // 3. Mostrar modal de confirmación con enlace directo de respaldo
    mostrarModalDescargaPdf(blobUrl, filename);
  }

  // Generador de plantilla A4 limpia para el mes en curso
  function crearContenedorImprimibleMes() {
    const mesNombre = NOMBRES_MESES[currentMonthIndex];
    const desglose = window.CalculationsModule.calcularDesgloseMes(currentMonthIndex, appConfig);
    const fianzaAcum = appConfig.fianza?.acumulado || 410.0;
    const superavitOlga = appConfig.gastosPersonales?.olga?.superavit || 115.57;
    const dineroEsperado = window.CalculationsModule.calcularDineroEsperadoCuenta(fianzaAcum, superavitOlga);

    const temp = document.createElement('div');
    temp.id = 'temp-pdf-mes-container';
    temp.style.cssText = 'position:fixed;left:-9999px;top:0;width:1050px;padding:32px;background:#ffffff;color:#1e293b;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;z-index:-1000;';

    temp.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px;">
        <div>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#4f46e5;">CommonPay</h1>
          <p style="margin:4px 0 0 0;font-size:13px;color:#64748b;">Desglose Financiero Mensual &bull; ${mesNombre} ${currentAnio}</p>
        </div>
        <div style="text-align:right;background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 16px;border-radius:8px;">
          <span style="font-size:11px;color:#64748b;display:block;">Fondo a Salvaguardar en Cuenta:</span>
          <strong style="font-size:17px;color:#15803d;">${formatMoneda(dineroEsperado)} €</strong>
          <span style="font-size:10px;color:#94a3b8;display:block;">(Fianza ${formatMoneda(fianzaAcum)} € + Superávit Olga ${formatMoneda(superavitOlga)} €)</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <!-- Tarjeta Olga -->
        <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:12px;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong style="font-size:18px;color:#4f46e5;">Olga</strong>
            <span style="font-size:22px;font-weight:800;color:#4f46e5;">${formatMoneda(desglose.desgloseOlga.total)} €</span>
          </div>
          <div style="border-top:1px dashed #cbd5e1;padding-top:12px;">
            ${desglose.desgloseOlga.conceptos.map(c => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">${c.nombre}</span>
                <strong style="color:#1e293b;">${formatMoneda(c.valor)} €</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tarjeta Pedro -->
        <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:12px;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong style="font-size:18px;color:#2563eb;">Pedro</strong>
            <span style="font-size:22px;font-weight:800;color:#2563eb;">${formatMoneda(desglose.desglosePedro.total)} €</span>
          </div>
          <div style="border-top:1px dashed #cbd5e1;padding-top:12px;">
            ${desglose.desglosePedro.conceptos.map(c => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">${c.nombre}</span>
                <strong style="color:#1e293b;">${formatMoneda(c.valor)} €</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;">
        <span>Documento oficial de control doméstico &bull; Generado el ${new Date().toLocaleDateString('es-ES')}</span>
        <span>CommonPay App</span>
      </div>
    `;

    document.body.appendChild(temp);
    return temp;
  }

  // Generador de plantilla A4 limpia para Previsión Anual
  function crearContenedorImprimiblePrevision(persona) {
    const esOlga = persona === 'olga';
    const personaNombre = esOlga ? 'Olga' : 'Pedro';
    const colorHex = esOlga ? '#4f46e5' : '#2563eb';
    const colorLightHex = esOlga ? '#eef2ff' : '#eff6ff';

    const temp = document.createElement('div');
    temp.id = 'temp-pdf-prevision-container';
    temp.style.cssText = 'position:fixed;left:-9999px;top:0;width:1100px;padding:32px;background:#ffffff;color:#1e293b;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;z-index:-1000;';

    let totalAnual = 0;
    let totalHipoteca = 0;
    let totalComunidad = 0;
    let totalFianza = 0;
    let totalExtra = 0;
    let filasHTML = '';

    for (let m = 0; m < 12; m++) {
      const desg = window.CalculationsModule.calcularDesgloseMes(m, appConfig);
      const conceptos = esOlga ? desg.desgloseOlga.conceptos : desg.desglosePedro.conceptos;
      const total = esOlga ? desg.desgloseOlga.total : desg.desglosePedro.total;

      const hipoteca = conceptos.find((c) => c.nombre.includes('Hipoteca'))?.valor || 0;
      const comunidad = conceptos.find((c) => c.nombre.includes('Comunidad'))?.valor || 0;
      const fianza = conceptos.find((c) => c.tipo === 'fianza')?.valor || 0;
      const coche = esOlga ? conceptos.find((c) => c.nombre.includes('Coche'))?.valor || 0 : 0;
      const manutencion = esOlga ? conceptos.find((c) => c.nombre.includes('Manutenci'))?.valor || 0 : 0;
      const extraordinarios = conceptos.filter((c) => c.tipo === 'extraordinario').reduce((s, c) => s + c.valor, 0);

      totalAnual += total;
      totalHipoteca += hipoteca;
      totalComunidad += comunidad;
      totalFianza += fianza;
      totalExtra += extraordinarios;

      const tdCoche = esOlga ? `<td style="text-align:right;padding:8px 10px;">${formatMoneda(coche)} €</td>` : '';
      const tdManutencion = esOlga ? `<td style="text-align:right;padding:8px 10px;">${formatMoneda(manutencion)} €</td>` : '';

      filasHTML += `
        <tr style="border-bottom:1px solid #e2e8f0;background:${m % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding:8px 10px;font-weight:600;">${NOMBRES_MESES[m]}</td>
          <td style="text-align:right;padding:8px 10px;">${formatMoneda(hipoteca)} €</td>
          <td style="text-align:right;padding:8px 10px;">${formatMoneda(comunidad)} €</td>
          <td style="text-align:right;padding:8px 10px;">${formatMoneda(fianza)} €</td>
          ${tdCoche}
          ${tdManutencion}
          <td style="text-align:right;padding:8px 10px;">${extraordinarios > 0 ? formatMoneda(extraordinarios) + ' €' : '—'}</td>
          <td style="text-align:right;padding:8px 10px;font-weight:700;color:${colorHex};">${formatMoneda(total)} €</td>
        </tr>
      `;
    }

    const tdCocheTot = esOlga ? '<td style="text-align:right;font-weight:700;padding:10px;">-</td>' : '';
    const tdManutencionTot = esOlga ? '<td style="text-align:right;font-weight:700;padding:10px;">-</td>' : '';

    temp.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px;">
        <div>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:${colorHex};">CommonPay</h1>
          <p style="margin:4px 0 0 0;font-size:13px;color:#64748b;">Previsión Anual de Pagos &bull; ${personaNombre} &bull; Ejercicio ${currentAnio}</p>
        </div>
        <div style="text-align:right;background:${colorLightHex};border:1.5px solid ${colorHex};padding:10px 18px;border-radius:10px;">
          <span style="font-size:11px;color:#64748b;display:block;">TOTAL ANUAL PREVISTO:</span>
          <strong style="font-size:20px;color:${colorHex};">${formatMoneda(totalAnual)} €</strong>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;">
        <thead>
          <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
            <th style="padding:10px;text-align:left;color:#475569;">Mes</th>
            <th style="padding:10px;text-align:right;color:#475569;">Hipoteca (50%)</th>
            <th style="padding:10px;text-align:right;color:#475569;">Comunidad (50%)</th>
            <th style="padding:10px;text-align:right;color:#475569;">Fianza</th>
            ${esOlga ? '<th style="padding:10px;text-align:right;color:#475569;">Coche</th><th style="padding:10px;text-align:right;color:#475569;">Manutención</th>' : ''}
            <th style="padding:10px;text-align:right;color:#475569;">Extraordinarios</th>
            <th style="padding:10px;text-align:right;color:${colorHex};font-weight:700;">Aportación Total</th>
          </tr>
        </thead>
        <tbody>
          ${filasHTML}
          <tr style="background:${colorLightHex};border-top:2.5px solid ${colorHex};">
            <td style="padding:10px;font-weight:800;">TOTAL ANUAL</td>
            <td style="text-align:right;font-weight:700;padding:10px;">${formatMoneda(totalHipoteca)} €</td>
            <td style="text-align:right;font-weight:700;padding:10px;">${formatMoneda(totalComunidad)} €</td>
            <td style="text-align:right;font-weight:700;padding:10px;">${formatMoneda(totalFianza)} €</td>
            ${tdCocheTot}
            ${tdManutencionTot}
            <td style="text-align:right;font-weight:700;padding:10px;">${formatMoneda(totalExtra)} €</td>
            <td style="text-align:right;font-weight:800;color:${colorHex};font-size:14px;padding:10px;">${formatMoneda(totalAnual)} €</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;">
        <span>Documento financiero emitido desde CommonPay &bull; Fecha: ${new Date().toLocaleDateString('es-ES')}</span>
        <span>Revisión Hipoteca (777,37 € desde Octubre) &bull; IRAV Alquiler (2%) &bull; IPC Manutención (2%)</span>
      </div>
    `;

    document.body.appendChild(temp);
    return temp;
  }

  // EXPORTAR MES EN CURSO A PDF
  async function exportarPdfMes() {
    const mesNombre = NOMBRES_MESES[currentMonthIndex];
    const filename = `CommonPay_Desglose_${mesNombre}_${currentAnio}.pdf`;
    const btn = document.getElementById('btn-exportar-pdf-mes');
    const originalBtnHTML = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Generando...';
      if (window.lucide) lucide.createIcons();
    }

    const tempElement = crearContenedorImprimibleMes();

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      const pdfBlob = await html2pdf().set(opt).from(tempElement).outputPdf('blob');
      await entregarArchivoPdf(pdfBlob, filename);
    } catch (err) {
      console.error('Error al exportar PDF del mes:', err);
      alert('Error al generar el PDF del mes: ' + (err.message || err));
    } finally {
      if (tempElement && tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  // EXPORTAR PREVISIÓN ANUAL A PDF
  async function exportarPdfPrevision() {
    const selectPersona = document.getElementById('prevision-persona-select');
    const persona = selectPersona ? selectPersona.value : 'olga';
    const personaNombre = persona === 'olga' ? 'Olga' : 'Pedro';
    const filename = `CommonPay_Prevision_Anual_${personaNombre}_${currentAnio}.pdf`;
    const btn = document.getElementById('btn-exportar-pdf-prevision');
    const originalBtnHTML = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Generando...';
      if (window.lucide) lucide.createIcons();
    }

    const tempElement = crearContenedorImprimiblePrevision(persona);

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      const pdfBlob = await html2pdf().set(opt).from(tempElement).outputPdf('blob');
      await entregarArchivoPdf(pdfBlob, filename);
    } catch (err) {
      console.error('Error al exportar PDF de previsión:', err);
      alert('Error al generar el PDF de previsión: ' + (err.message || err));
    } finally {
      if (tempElement && tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  // EXPORTAR HISTORIAL A EXCEL (XLSX)
  function exportarExcelHistorial() {
    if (historialTransferencias.length === 0) {
      alert('No hay datos en el historial para exportar.');
      return;
    }

    const rows = historialTransferencias.map((t) => {
      const fecha = new Date(t.fechaCompletado);
      const fechaFormateada = `${agregarCero(fecha.getDate())}/${agregarCero(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;

      return {
        Mes: t.mesNombre,
        Año: t.anio,
        'Transferencia Olga (€)': t.transferenciaOlga,
        'Transferencia Pedro (€)': t.transferenciaPedro,
        'Total Aportado en el Mes (€)': window.CalculationsModule.round(
          t.transferenciaOlga + t.transferenciaPedro
        ),
        'Fondo Fianza al Momento (€)': t.fianzaAlMomento,
        'Fecha de Registro': fechaFormateada,
        Estado: 'Completado'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Transferencias');

    const maxKeys = Object.keys(rows[0]);
    const wscols = maxKeys.map((key) => {
      return { wch: Math.max(key.length + 3, 15) };
    });
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, 'CommonPay_Historial_Gastos_2026.xlsx');
  }

  // --- LÓGICA VISTA: LIQUIDACIÓN Y CONCILIACIÓN (DÍA 15 - FASE 3) ---

  function obtenerFianzaAcumuladaParaMes(mesIndex, anio) {
    const registro = historialTransferencias.find(
      (t) => t.mesIndex === mesIndex && t.anio === anio
    );
    if (registro) {
      return registro.fianzaAlMomento;
    }
    return fianzaAcumulado;
  }

  function actualizarVistaConciliacion() {
    const fianzaEsp = obtenerFianzaAcumuladaParaMes(currentMonthIndex, currentAnio);
    const superavitOlga = appConfig.gastosPersonales?.olga?.superavit || 0;
    const totalEsperado = window.CalculationsModule.calcularDineroEsperadoCuenta(
      fianzaEsp,
      superavitOlga
    );

    document.getElementById('con-mes-nombre').innerText =
      `${NOMBRES_MESES[currentMonthIndex]} / ${currentAnio}`;
    document.getElementById('con-fianza-esperada').innerText = `${formatMoneda(fianzaEsp)} €`;
    if (conSuperavitOlgaEl) {
      conSuperavitOlgaEl.innerText = `${formatMoneda(superavitOlga)} €`;
    }
    if (conTotalEsperadoCuentaEl) {
      conTotalEsperadoCuentaEl.innerText = `${formatMoneda(totalEsperado)} €`;
    }

    // Limpiar input y resultado previo
    document.getElementById('con-saldo-real').value = '';
    const panelResultado = document.getElementById('resultado-conciliacion');
    panelResultado.style.display = 'none';
    panelResultado.innerHTML = '';

    actualizarTablaConciliaciones();
  }

  function actualizarTablaConciliaciones() {
    const tbody = document.getElementById('tabla-conciliaciones-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!conciliaciones || conciliaciones.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <i data-lucide="inbox" style="width: 32px; height: 32px; display: block; margin: 0 auto 0.5rem; opacity: 0.5;"></i>
            Aún no hay liquidaciones del día 15 registradas.
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    // Ordenar por año desc, mes desc
    const listaOrdenada = [...conciliaciones].sort((a, b) => {
      if (a.anio !== b.anio) return b.anio - a.anio;
      return b.mesIndex - a.mesIndex;
    });

    listaOrdenada.forEach((c) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-color)';

      const fechaObj = new Date(c.fecha);
      const fechaFormateada = `${agregarCero(fechaObj.getDate())}/${agregarCero(fechaObj.getMonth() + 1)}/${fechaObj.getFullYear()}`;

      let badgeClass = '';
      let badgeText = '';
      let difTexto = '';

      if (c.tipo === 'sobrante_retirado') {
        badgeClass = 'sobrante';
        badgeText = 'Sobrante Retirado';
        difTexto = `+${formatMoneda(c.diferencia)} €`;
      } else if (c.tipo === 'deficit_repuesto') {
        badgeClass = 'deficit';
        badgeText = 'Déficit Repuesto';
        difTexto = `${formatMoneda(c.diferencia)} €`;
      } else {
        badgeClass = 'equilibrado';
        badgeText = 'Equilibrado';
        difTexto = '0,00 €';
      }

      const diffColorClass =
        c.diferencia > 0 ? 'text-success' : c.diferencia < 0 ? 'text-danger' : 'text-primary';

      row.innerHTML = `
        <td style="padding: 1rem 0.5rem; font-weight: 600;">${c.mesNombre} / ${c.anio}</td>
        <td style="padding: 1rem 0.5rem; text-align: right; font-weight: 500;">${formatMoneda(c.saldoReal)} €</td>
        <td style="padding: 1rem 0.5rem; text-align: right; color: var(--success); font-weight: 500;">${formatMoneda(c.fianzaAcumulada)} €</td>
        <td style="padding: 1rem 0.5rem; text-align: right; font-weight: 600;" class="${diffColorClass}">${difTexto}</td>
        <td style="padding: 1rem 0.5rem; color: var(--text-muted); font-size: 0.85rem;">${fechaFormateada}</td>
        <td style="padding: 1rem 0.5rem;"><span class="badge-conciliacion ${badgeClass}">${badgeText}</span></td>
        <td style="padding: 1rem 0.5rem; text-align: center;">
          <button class="btn-danger-link delete-conciliacion-btn" title="Eliminar Liquidación" data-id="${c.id}" data-mes="${c.mesIndex}" data-anio="${c.anio}">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </td>
      `;

      // Evento de eliminación
      const btnDel = row.querySelector('.delete-conciliacion-btn');
      btnDel.addEventListener('click', async () => {
        if (!isPedroEditor) return;
        if (
          confirm(
            `¿Estás seguro de que deseas eliminar el registro de liquidación de ${c.mesNombre} / ${c.anio}?`
          )
        ) {
          try {
            await window.StorageModule.deleteConciliacion(c.id, c.mesIndex, c.anio);
            conciliaciones = await window.StorageModule.getConciliaciones();
            actualizarVistaConciliacion();
            alert('Liquidación eliminada correctamente.');
          } catch (e) {
            alert('Error al eliminar la liquidación de la base de datos.');
          }
        }
      });

      tbody.appendChild(row);
    });

    // Controlar visibilidad del botón de eliminación en la tabla de conciliaciones
    const deleteButtons = tbody.querySelectorAll('.delete-conciliacion-btn');
    deleteButtons.forEach((btn) => {
      btn.disabled = !isPedroEditor;
      if (!isPedroEditor) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'inline-flex';
      }
    });

    lucide.createIcons();
  }

  function calcularConciliacion() {
    const inputSaldo = document.getElementById('con-saldo-real');
    const saldoRealVal = parseFloat(inputSaldo.value);

    if (isNaN(saldoRealVal) || saldoRealVal < 0) {
      alert('Por favor, introduce un saldo real válido igual o superior a 0 €.');
      return;
    }

    const fianzaEsp = obtenerFianzaAcumuladaParaMes(currentMonthIndex, currentAnio);
    const superavitOlga = appConfig.gastosPersonales?.olga?.superavit || 0;
    const totalEsperado = window.CalculationsModule.calcularDineroEsperadoCuenta(
      fianzaEsp,
      superavitOlga
    );
    const totalEsperadoCents = Math.round(totalEsperado * 100);
    const saldoRealCents = Math.round(saldoRealVal * 100);
    const diferenciaCents = saldoRealCents - totalEsperadoCents;
    const diferencia = diferenciaCents / 100;

    const panelResultado = document.getElementById('resultado-conciliacion');
    panelResultado.style.display = 'block';

    let cardClass = '';
    let iconName = '';
    let titulo = '';
    let difSimbolo = '';
    let instrucciones = '';
    let tipo = '';

    if (diferencia > 0) {
      cardClass = 'sobrante';
      iconName = 'check-circle';
      titulo = 'Liquidación del día 15: Sobrante Detectado';
      difSimbolo = '+';
      tipo = 'sobrante_retirado';
      instrucciones = `El saldo en el banco es superior a los fondos que deben salvaguardarse (Fianza: ${formatMoneda(fianzaEsp)} € + Superávit de Olga: ${formatMoneda(superavitOlga)} € = ${formatMoneda(totalEsperado)} €). <br><br><strong>Pedro debe retirar ${formatMoneda(diferencia)} €</strong> de la cuenta común y transferirlos a su cuenta personal. Tras este retiro, el saldo de la cuenta común quedará exactamente nivelado protegiendo la fianza y el superávit de Olga (<strong>${formatMoneda(totalEsperado)} €</strong>).`;
    } else if (diferencia < 0) {
      cardClass = 'deficit';
      iconName = 'alert-triangle';
      titulo = 'Liquidación del día 15: Déficit Detectado';
      difSimbolo = '';
      tipo = 'deficit_repuesto';
      instrucciones = `El saldo en el banco está por debajo de los fondos protegidos que deben permanecer en cuenta (Fianza: ${formatMoneda(fianzaEsp)} € + Superávit Olga: ${formatMoneda(superavitOlga)} € = ${formatMoneda(totalEsperado)} €). <br><br><strong>Pedro debe aportar ${formatMoneda(Math.abs(diferencia))} €</strong> a la cuenta común para cubrir el déficit y garantizar la fianza y el superávit de Olga (<strong>${formatMoneda(totalEsperado)} €</strong>).`;
    } else {
      cardClass = 'equilibrado';
      iconName = 'scale';
      titulo = 'Liquidación del día 15: Cuenta Equilibrada';
      difSimbolo = '';
      tipo = 'equilibrado';
      instrucciones = `El saldo bancario actual coincide exactamente con el total que debe haber en cuenta (Fianza: ${formatMoneda(fianzaEsp)} € + Superávit Olga: ${formatMoneda(superavitOlga)} € = <strong>${formatMoneda(totalEsperado)} €</strong>). No hay acciones de liquidación pendientes para Pedro.`;
    }

    panelResultado.className = `glass-card balance-card ${cardClass}`;

    // Crear el HTML interno
    let registrarBtnHTML = '';

    // Comprobar si ya existe registro para este mes y año
    const yaRegistrado = conciliaciones.some(
      (c) => c.mesIndex === currentMonthIndex && c.anio === currentAnio
    );

    if (yaRegistrado) {
      registrarBtnHTML = `
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.05); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-muted); text-align: center;">
          <i data-lucide="check-check" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
          Liquidación de este mes ya registrada en el historial.
        </div>
      `;
    } else if (isPedroEditor) {
      registrarBtnHTML = `
        <button class="btn btn-primary" id="btn-registrar-conciliacion" style="width: 100%; margin-top: 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <i data-lucide="save"></i> Registrar Liquidación
        </button>
      `;
    } else {
      registrarBtnHTML = `
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.05); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-muted); text-align: center;">
          <i data-lucide="lock" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
          Inicia sesión como Editor para registrar esta liquidación.
        </div>
      `;
    }

    panelResultado.innerHTML = `
      <div class="balance-header">
        <div class="balance-icon">
          <i data-lucide="${iconName}"></i>
        </div>
        <h4 class="balance-title">${titulo}</h4>
      </div>
      <div class="balance-body">
        <div class="balance-value-row">
          <span class="balance-value-label">Diferencia Calculada:</span>
          <span class="balance-value-amount">${difSimbolo}${formatMoneda(diferencia)} €</span>
        </div>
        <div class="balance-instruction-box">
          ${instrucciones}
        </div>
        ${registrarBtnHTML}
      </div>
    `;

    lucide.createIcons();

    // Vincular evento al botón de registrar
    const btnReg = document.getElementById('btn-registrar-conciliacion');
    if (btnReg) {
      btnReg.addEventListener('click', () => {
        ejecutarRegistroConciliacion(saldoRealVal, fianzaEsp, diferencia, tipo);
      });
    }
  }

  async function ejecutarRegistroConciliacion(saldoReal, fianzaAcumulada, diferencia, tipo) {
    if (!isPedroEditor) return;

    const conciliacion = {
      mesIndex: currentMonthIndex,
      mesNombre: NOMBRES_MESES[currentMonthIndex],
      anio: currentAnio,
      saldoReal: saldoReal,
      fianzaAcumulada: fianzaAcumulada,
      diferencia: diferencia,
      tipo: tipo,
      fecha: new Date().toISOString()
    };

    try {
      const exito = await window.StorageModule.addConciliacion(conciliacion);
      if (exito) {
        conciliaciones = await window.StorageModule.getConciliaciones();
        actualizarVistaConciliacion();
        alert(
          `Liquidación del mes de ${NOMBRES_MESES[currentMonthIndex]} registrada correctamente.`
        );
      } else {
        alert('Esta liquidación ya había sido registrada anteriormente.');
      }
    } catch (e) {
      alert('Error al intentar guardar la liquidación en la base de datos.');
    }
  }

  // --- FUNCIONES DE SOPORTE / UTILIDADES ---

  function formatMoneda(numero) {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero);
  }

  function agregarCero(num) {
    return num < 10 ? '0' + num : num;
  }

  // --- GOOGLE CALENDAR / iCAL (FASE 4) ---

  /**
   * Formatea una fecha como YYYYMMDD para iCal
   */
  function icsDate(anio, mes, dia) {
    return `${anio}${agregarCero(mes + 1)}${agregarCero(dia)}`;
  }

  /**
   * Formatea una fecha como YYYYMMDD para URL de Google Calendar
   */
  function gcalDate(anio, mes, dia) {
    return `${anio}${agregarCero(mes + 1)}${agregarCero(dia)}`;
  }

  /**
   * Genera y descarga un archivo .ics con todos los eventos del año configurados.
   * Incluye eventos recurrentes mensuales (días 5, 10, 15) y alertas de revisión contractual.
   */
  function exportarCalendarioIcs() {
    const alertas = appConfig.alertas || {
      mesHipoteca: 9,
      mesManutencion: 5,
      mesAlquiler: 10
    };

    const anio = currentAnio;
    const uid = () => Math.random().toString(36).substring(2, 11).toUpperCase();
    const ahora = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    let eventos = [];

    // Función interna para crear un bloque VEVENT
    const vevent = ({ uid: u, dtstart, dtend, summary, description, rrule }) => {
      let bloque = `BEGIN:VEVENT\r\nUID:${u}@commonpay\r\nDTSTAMP:${ahora}\r\nDTSTART;VALUE=DATE:${dtstart}\r\nDTEND;VALUE=DATE:${dtend}\r\nSUMMARY:${summary}\r\nDESCRIPTION:${description}`;
      if (rrule) bloque += `\r\nRRULE:${rrule}`;
      bloque +=
        '\r\nBEGIN:VALARM\r\nTRIGGER:-PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:Recordatorio CommonPay\r\nEND:VALARM\r\nEND:VEVENT';
      return bloque;
    };

    // 1. Ingreso de Olga — recurrente cada día 5
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, 0, 5),
        dtend: icsDate(anio, 0, 6),
        summary: '💸 Ingreso Olga — Cuenta Común',
        description:
          'Olga transfiere su aportación mensual a la cuenta común (gastos de hogar + manutención + coche). Verificar que el ingreso ha llegado.',
        rrule: `FREQ=MONTHLY;BYMONTHDAY=5;UNTIL=${anio}1231`
      })
    );

    // 2. Cobro Hipoteca — recurrente cada día 10
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, 0, 10),
        dtend: icsDate(anio, 0, 11),
        summary: '🏠 Cobro Hipoteca — Cuenta Común',
        description: `El banco cargará la cuota hipotecaria en torno al día 10. Cuota base: ${formatMoneda(appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Revisar el saldo de la cuenta.`,
        rrule: `FREQ=MONTHLY;BYMONTHDAY=10;UNTIL=${anio}1231`
      })
    );

    // 3. Ingreso Alquiler Casa — recurrente cada día 15
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, 0, 15),
        dtend: icsDate(anio, 0, 16),
        summary: '🏡 Ingreso Alquiler Casa — Cuenta Común',
        description: `El inquilino transfiere el alquiler de la casa. Importe mensual: ${formatMoneda(appConfig.gastosFijos?.ingresoAlquiler || 0)} €. Comprobar el ingreso en cuenta y liquidar diferencias del día 15.`,
        rrule: `FREQ=MONTHLY;BYMONTHDAY=15;UNTIL=${anio}1231`
      })
    );

    // 4. Revisión Hipoteca Variable (evento puntual el día 1 del mes configurado)
    const mesHip = parseInt(alertas.mesHipoteca ?? 9);
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, mesHip, 1),
        dtend: icsDate(anio, mesHip, 2),
        summary: `⚠️ Revisión Hipoteca Variable — ${NOMBRES_MESES[mesHip]} ${anio}`,
        description: `Este mes se revisa la cuota de la hipoteca variable. Nueva cuota estimada: ${formatMoneda(alertas.cuotaHipotecaNueva || appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Actualizar el importe en CommonPay > Ajustes.`,
        rrule: null
      })
    );

    // 5. Actualización Manutención IPC (evento puntual el día 1 del mes configurado)
    const mesMant = parseInt(alertas.mesManutencion ?? 5);
    const manutencionNueva =
      (appConfig.gastosPersonales?.olga?.manutencion || 0) *
      (1 + (alertas.tasaManutencion || 2) / 100);
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, mesMant, 1),
        dtend: icsDate(anio, mesMant, 2),
        summary: `📈 Actualización Manutención IPC — ${NOMBRES_MESES[mesMant]} ${anio}`,
        description: `Este mes se actualiza la cuota de manutención conforme al IPC (${alertas.tasaManutencion || 2}%). Nuevo importe estimado: ${formatMoneda(manutencionNueva)} €/mes. Actualizar en CommonPay > Ajustes.`,
        rrule: null
      })
    );

    // 6. Actualización Alquiler IRAV (evento puntual el día 1 del mes configurado)
    const mesAlq = parseInt(alertas.mesAlquiler ?? 10);
    const alquilerNuevo =
      (appConfig.gastosFijos?.ingresoAlquiler || 0) * (1 + (alertas.tasaAlquiler || 2) / 100);
    eventos.push(
      vevent({
        uid: uid(),
        dtstart: icsDate(anio, mesAlq, 1),
        dtend: icsDate(anio, mesAlq, 2),
        summary: `📋 Actualización Alquiler IRAV — ${NOMBRES_MESES[mesAlq]} ${anio}`,
        description: `Este mes se actualiza el alquiler de la casa conforme al IRAV (${alertas.tasaAlquiler || 2}%). Nuevo importe estimado: ${formatMoneda(alquilerNuevo)} €/mes. Actualizar en CommonPay > Ajustes.`,
        rrule: null
      })
    );

    // Construir el archivo iCal
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CommonPay//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:CommonPay ${anio}`,
      'X-WR-TIMEZONE:Europe/Madrid',
      ...eventos,
      'END:VCALENDAR'
    ].join('\r\n');

    // Descargar el archivo
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CommonPay_Calendario_${anio}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Abre Google Calendar en una nueva pestaña con un evento recurrente mensual pre-rellenado.
   * @param {'olga'|'hipoteca'|'alquiler'} tipo - Tipo de evento a generar
   */
  function abrirGoogleCalendar(tipo) {
    const anio = currentAnio;
    let texto = '';
    let descripcion = '';
    let dia = '';

    if (tipo === 'olga') {
      texto = 'Ingreso Olga - Cuenta Común';
      descripcion =
        'Olga transfiere su aportación mensual (hogar + manutención + coche) a la cuenta común. Verificar que el ingreso ha llegado.';
      dia = '05';
    } else if (tipo === 'hipoteca') {
      texto = 'Cobro Hipoteca - Cuenta Común';
      descripcion = `El banco carga la cuota hipotecaria. Cuota base: ${formatMoneda(appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Revisar saldo disponible.`;
      dia = '10';
    } else if (tipo === 'alquiler') {
      texto = 'Ingreso Alquiler Casa - Cuenta Común';
      descripcion = `El inquilino transfiere el alquiler mensual: ${formatMoneda(appConfig.gastosFijos?.ingresoAlquiler || 0)} €. Día de liquidación del balance.`;
      dia = '15';
    }

    // Fecha de inicio: primer mes del año en el día indicado
    const fechaInicio = `${anio}01${dia}`;
    const fechaFin = `${anio}01${parseInt(dia) + 1 < 10 ? '0' + (parseInt(dia) + 1) : parseInt(dia) + 1}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: texto,
      dates: `${fechaInicio}/${fechaFin}`,
      details: descripcion,
      recur: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${parseInt(dia)};UNTIL=${anio}1231`
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  }

  // --- ARRANQUE DE LA APLICACIÓN ---
  init();
});
