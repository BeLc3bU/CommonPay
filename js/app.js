/**
 * Controlador Principal de la Aplicación (CommonPay)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- VARIABLES DE ESTADO ---
  let appConfig = {};
  let fianzaAcumulado = 0.0;
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
  const monthSelectorContainer = document.getElementById('month-selector-container');
  const themeCheckbox = document.getElementById('theme-checkbox');

  // Vista Dashboard
  const totalOlgaEl = document.getElementById('total-olga');
  const totalPedroEl = document.getElementById('total-pedro');
  const conceptosOlgaEl = document.getElementById('conceptos-olga');
  const conceptosPedroEl = document.getElementById('conceptos-pedro');
  const btnCompletarMes = document.getElementById('btn-completar-mes');
  const btnExportarPdfMes = document.getElementById('btn-exportar-pdf-mes');
  const btnReporteAnualOlga = document.getElementById('btn-reporte-anual-olga');
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
  const authTextEl = document.getElementById('auth-text');
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
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // --- INICIALIZACIÓN ---
  async function init() {
    // 1. Inicializar Supabase si está disponible en Vercel
    await window.StorageModule.inicializarSupabase();

    // 2. Verificar estado de autenticación de Pedro
    const user = await window.StorageModule.obtenerUsuarioActivo();
    isPedroEditor = (user !== null);

    // 3. Cargar datos desde la nube o LocalStorage (asíncrono)
    appConfig = await window.StorageModule.getConfiguration();
    fianzaAcumulado = await window.StorageModule.getFianzaAcumulado();
    historialTransferencias = await window.StorageModule.getHistorial();
    conciliaciones = await window.StorageModule.getConciliaciones();

    // 4. Establecer mes por defecto
    selectorMesGlobal.value = currentMonthIndex;

    // 5. Inicializar tema visual
    const savedTheme = window.StorageModule.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeCheckbox.checked = (savedTheme === 'dark');

    // 6. Registrar Eventos
    setupEventListeners();

    // 7. Renderizar interfaz inicial y aplicar seguridad visual
    actualizarEstadoAuthVisual();
    actualizarInterfaz();
    
    // Crear iconos
    lucide.createIcons();
  }

  // --- CONTROL DE PERMISOS DE EDICIÓN (ROLES) ---
  function actualizarEstadoAuthVisual() {
    if (isPedroEditor) {
      authStatusEl.className = 'auth-status editor-active';
      authStatusEl.innerHTML = `<i data-lucide="user-check" style="width:14px; height:14px;"></i> <span id="auth-text">Pedro (Editor)</span>`;
      btnAuthAction.innerHTML = `<i data-lucide="log-out" style="width:14px; height:14px;"></i> Cerrar Sesión`;
    } else {
      authStatusEl.className = 'auth-status read-only';
      authStatusEl.innerHTML = `<i data-lucide="eye" style="width:14px; height:14px;"></i> <span id="auth-text">Solo Lectura</span>`;
      btnAuthAction.innerHTML = `<i data-lucide="log-in" style="width:14px; height:14px;"></i> Acceso Editor`;
    }
    
    // Mostrar u ocultar pestañas exclusivas del editor (Liquidación y Ajustes)
    const editorNavs = document.querySelectorAll('.editor-only-nav');
    editorNavs.forEach(nav => {
      nav.style.display = isPedroEditor ? 'block' : 'none';
    });

    // Redirección si un invitado intenta estar en una vista restringida
    if (!isPedroEditor) {
      const activeView = document.querySelector('.view-section.active');
      if (activeView && (activeView.id === 'conciliacion-view' || activeView.id === 'config-view')) {
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
      cfgHipotecaCuota, cfgHipotecaAlquiler, cfgComunidad, 
      cfgFianzaObjetivo, cfgFianzaMensual, cfgOlgaCoche, 
      cfgOlgaManutencion, cfgExtraIbi, cfgExtraSeguro,
      cfgAlertaHipoteca, cfgAlertaManutencion, cfgAlertaAlquiler,
      cfgHipotecaNueva, cfgIpcTasa, cfgIravTasa,
      inputAportacionExtra, conSaldoReal
    ];

    // Botones de acción del sistema
    const btnCalcularBalance = document.getElementById('btn-calcular-balance');
    const botonesEdicion = [
      btnCompletarMes, btnAportarManual, btnRetirarManual,
      btnConfigReset, btnConfigGuardar, btnCalcularBalance
    ];

    // Habilitar o deshabilitar inputs
    inputsAjustes.forEach(input => {
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
    botonesEdicion.forEach(btn => {
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
    deleteButtons.forEach(btn => {
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
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-target');
        cambiarVista(targetView, link);
      });
    });

    // Selector de mes
    selectorMesGlobal.addEventListener('change', (e) => {
      currentMonthIndex = parseInt(e.target.value);
      actualizarDashboardMes();
      
      // Si la sección de conciliación está activa, actualizarla
      const activeView = document.querySelector('.view-section.active');
      if (activeView && activeView.id === 'conciliacion-view') {
        actualizarVistaConciliacion();
      }
    });

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

    // Generar calendario anual para Olga
    btnReporteAnualOlga.addEventListener('click', generarReporteAnualOlga);

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

    const btnGcalOlga = document.getElementById('btn-gcal-olga');
    if (btnGcalOlga) btnGcalOlga.addEventListener('click', () => abrirGoogleCalendar('olga'));

    const btnGcalHipoteca = document.getElementById('btn-gcal-hipoteca');
    if (btnGcalHipoteca) btnGcalHipoteca.addEventListener('click', () => abrirGoogleCalendar('hipoteca'));

    const btnGcalAlquiler = document.getElementById('btn-gcal-alquiler');
    if (btnGcalAlquiler) btnGcalAlquiler.addEventListener('click', () => abrirGoogleCalendar('alquiler'));

    // Guardar ajustes
    btnConfigGuardar.addEventListener('click', guardarAjustes);

    // Restaurar ajustes por defecto
    btnConfigReset.addEventListener('click', restaurarAjustesPorDefecto);

    // Eventos de Autenticación
    btnAuthAction.addEventListener('click', manejarAccionAuth);
    btnCloseLogin.addEventListener('click', () => cerrarModalLogin());
    btnCancelLogin.addEventListener('click', () => cerrarModalLogin());
    loginForm.addEventListener('submit', procesarLogin);

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        cerrarModalLogin();
      }
    });
  }

  // --- LÓGICA DE INICIO Y CIERRE DE SESIÓN ---
  async function manejarAccionAuth() {
    if (isPedroEditor) {
      if (confirm("¿Estás seguro de que deseas cerrar la sesión de editor? La aplicación regresará al modo de solo lectura.")) {
        try {
          await window.StorageModule.logout();
          isPedroEditor = false;
          
          // Re-cargar la base de datos pública actualizada
          appConfig = await window.StorageModule.getConfiguration();
          fianzaAcumulado = await window.StorageModule.getFianzaAcumulado();
          historialTransferencias = await window.StorageModule.getHistorial();

          actualizarEstadoAuthVisual();
          actualizarInterfaz();
          alert("Sesión de editor cerrada. Modo solo lectura activado.");
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
          alert("Error al cerrar sesión de editor.");
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
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width: 14px; height: 14px;"></i> Conectando...';
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
      alert("¡Acceso de editor autorizado con éxito!");
    } catch (error) {
      console.error("Error de autenticación:", error);
      loginErrorText.innerText = "Error: " + (error.message || "Credenciales incorrectas.");
      loginErrorEl.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  }

  // --- NAVEGACIÓN ---
  function cambiarVista(viewId, activeLink) {
    // Validar acceso restringido a vistas de editor (Liquidación y Ajustes)
    if ((viewId === 'conciliacion-view' || viewId === 'config-view') && !isPedroEditor) {
      alert("Acceso restringido. Debes iniciar sesión como Editor para acceder a esta sección.");
      const dashboardLink = document.getElementById('nav-dashboard');
      if (dashboardLink) {
        cambiarVista('dashboard-view', dashboardLink);
      }
      return;
    }

    // Desactivar todos los enlaces y secciones
    navLinks.forEach(link => link.classList.remove('active'));
    viewSections.forEach(sec => sec.classList.remove('active'));

    // Activar sección y enlace actual
    activeLink.classList.add('active');
    const targetSection = document.getElementById(viewId);
    targetSection.classList.add('active');

    // Adaptar cabecera y selector de mes según la sección
    if (viewId === 'dashboard-view') {
      pageTitle.innerText = "Mes Actual";
      pageSubtitle.innerText = "Calcula las transferencias del mes e incrementa tus ahorros.";
      monthSelectorContainer.style.display = 'flex';
      actualizarDashboardMes();
    } else if (viewId === 'fianza-view') {
      pageTitle.innerText = "Fondo de Fianza";
      pageSubtitle.innerText = "Monitorea el progreso de reposición y añade ahorros adicionales.";
      monthSelectorContainer.style.display = 'none';
      actualizarVistaFianza();
    } else if (viewId === 'stats-view') {
      pageTitle.innerText = "Estadísticas Anuales";
      pageSubtitle.innerText = "Previsión y desglose anual de los gastos del hogar.";
      monthSelectorContainer.style.display = 'none';
      renderizarGraficoAnual();
      actualizarEstadisticasResumen();
    } else if (viewId === 'historial-view') {
      pageTitle.innerText = "Historial";
      pageSubtitle.innerText = "Revisa los registros guardados de las transferencias realizadas.";
      monthSelectorContainer.style.display = 'none';
      actualizarVistaHistorial();
    } else if (viewId === 'config-view') {
      pageTitle.innerText = "Configuración";
      pageSubtitle.innerText = "Edita los importes y gastos del sistema sin tocar código.";
      monthSelectorContainer.style.display = 'none';
      cargarInputsConfiguracion();
    } else if (viewId === 'conciliacion-view') {
      pageTitle.innerText = "Liquidación y Conciliación";
      pageSubtitle.innerText = "Controla el saldo del día 15, salvaguarda la fianza y liquida diferencias.";
      monthSelectorContainer.style.display = 'flex';
      actualizarVistaConciliacion();
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

    // Verificar si el mes actual está marcado como completado
    const yaRegistrado = historialTransferencias.some(
      t => t.mesIndex === currentMonthIndex && t.anio === currentAnio
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
    conceptos.forEach(c => {
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
    const alertas = appConfig.alertas || { mesHipoteca: 8, mesManutencion: 5, mesAlquiler: 10 };

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
  function actualizarVistaFianza() {
    const objetivo = appConfig.fianza.objective || appConfig.fianza.objetivo || 450.00;
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
      fianzaEstadoDescEl.innerText = 'El fondo de la fianza de 450 € ha sido repuesto por completo. ¡Buen trabajo!';
      btnAportarManual.disabled = true;
      btnRetirarManual.disabled = !isPedroEditor || (actual <= 0);
      inputAportacionExtra.disabled = !isPedroEditor;
    } else {
      fianzaEstadoIconEl.className = 'fianza-status-icon text-primary';
      fianzaEstadoIconEl.innerHTML = '<i data-lucide="piggy-bank"></i>';
      fianzaEstadoTituloEl.innerText = 'Ahorrando...';
      fianzaEstadoDescEl.innerText = `Lleváis acumulados ${formatMoneda(actual)} € de los ${formatMoneda(objetivo)} € necesarios. Falta por ahorrar ${formatMoneda(pendiente)} €.`;
      btnAportarManual.disabled = !isPedroEditor;
      btnRetirarManual.disabled = !isPedroEditor || (actual <= 0);
      inputAportacionExtra.disabled = !isPedroEditor;
    }
    
    // Aplicar opacidades según rol
    actualizarControlesEdicion(isPedroEditor);
    lucide.createIcons();
  }

  async function aportarManualFianza() {
    if (!isPedroEditor) return;
    const valor = parseFloat(inputAportacionExtra.value);
    if (isNaN(valor) || valor <= 0) {
      alert("Por favor, introduce un importe de aportación válido superior a 0 €.");
      return;
    }

    const objetivo = appConfig.fianza.objetivo;
    const pendiente = objetivo - fianzaAcumulado;

    if (pendiente <= 0) {
      alert("El objetivo de la fianza ya ha sido alcanzado.");
      return;
    }

    let aportacionReal = valor;
    if (valor > pendiente) {
      aportacionReal = pendiente;
      alert(`La aportación excede el límite del objetivo. Se ha ajustado la aportación a ${formatMoneda(pendiente)} €.`);
    }

    fianzaAcumulado = window.CalculationsModule.round(fianzaAcumulado + aportacionReal);
    
    try {
      await window.StorageModule.saveFianzaAcumulado(fianzaAcumulado);
      inputAportacionExtra.value = '';
      actualizarInterfaz();
      alert(`Se han añadido ${formatMoneda(aportacionReal)} € al fondo de la fianza con éxito.`);
    } catch (e) {
      alert("Error al intentar guardar el acumulado de fianza en la base de datos.");
    }
  }

  async function retirarManualFianza() {
    if (!isPedroEditor) return;
    const valor = parseFloat(inputAportacionExtra.value);
    if (isNaN(valor) || valor <= 0) {
      alert("Por favor, introduce un importe a retirar válido superior a 0 €.");
      return;
    }

    if (fianzaAcumulado <= 0) {
      alert("No hay fondos acumulados en la fianza para retirar.");
      return;
    }

    let retiroReal = valor;
    if (valor > fianzaAcumulado) {
      retiroReal = fianzaAcumulado;
      alert(`El importe excede el acumulado actual. Se ha ajustado el retiro al total disponible de ${formatMoneda(fianzaAcumulado)} €.`);
    }

    fianzaAcumulado = window.CalculationsModule.round(fianzaAcumulado - retiroReal);
    
    try {
      await window.StorageModule.saveFianzaAcumulado(fianzaAcumulado);
      inputAportacionExtra.value = '';
      actualizarInterfaz();
      alert(`Se han retirado ${formatMoneda(retiroReal)} € del fondo de la fianza con éxito.`);
    } catch (e) {
      alert("Error al intentar retirar fondos de la fianza de la base de datos.");
    }
  }

  // --- ACCIÓN COMPLETAR MES ---
  async function completarMesActual() {
    if (!isPedroEditor) return;
    const desglose = window.CalculationsModule.calcularDesgloseMes(currentMonthIndex, appConfig);
    const yaRegistrado = historialTransferencias.some(
      t => t.mesIndex === currentMonthIndex && t.anio === currentAnio
    );

    if (yaRegistrado) {
      alert("Este mes ya se encuentra completado y registrado en el historial.");
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
      } catch (err) {
        console.error("Error al registrar fianza acumulada en base de datos. Continuando registro de mes:", err);
      }
    }

    // 2. Registrar en el historial
    const registro = {
      mesIndex: currentMonthIndex,
      mesNombre: NOMBRES_MESES[currentMonthIndex],
      anio: currentAnio,
      fechaCompletado: new Date().toISOString(),
      transferenciaOlga: desglose.desgloseOlga.total,
      transferenciaPedro: desglose.desglosePedro.total,
      fianzaAlMomento: fianzaAcumulado,
      desglose: desglose
    };

    try {
      const exito = await window.StorageModule.addTransferenciaAlHistorial(registro);
      if (exito) {
        historialTransferencias = await window.StorageModule.getHistorial();
        actualizarInterfaz();
        
        let mensaje = `¡Excelente! El mes de ${NOMBRES_MESES[currentMonthIndex]} se ha guardado como completado.`;
        if (aportacionRealizada > 0) {
          mensaje += ` Se han sumado ${formatMoneda(aportacionRealizada)} € al fondo de la fianza.`;
        } else {
          mensaje += ` El fondo de fianza ya estaba al máximo, por lo que no se han añadido importes adicionales.`;
        }
        alert(mensaje);
      } else {
        alert("Hubo un error al registrar la transferencia. Inténtalo de nuevo.");
      }
    } catch (e) {
      alert("Error al intentar conectar con la base de datos remota para registrar la transferencia.");
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

    historialOrdenado.forEach(t => {
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
        if (confirm(`¿Estás seguro de que deseas eliminar el registro de ${t.mesNombre}? Esto no modificará el acumulado actual de la fianza automáticamente, pero permitirá volver a registrar este mes.`)) {
          try {
            await window.StorageModule.deleteTransferenciaDelHistorial(t.mesIndex, t.anio);
            historialTransferencias = await window.StorageModule.getHistorial();
            actualizarInterfaz();
          } catch (e) {
            alert("Error al intentar eliminar el registro de la base de datos.");
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
      const extraordinariosDelMes = desg.desgloseOlga.conceptos
        .filter(c => c.tipo === 'extraordinario')
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
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
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
              callback: function(value) {
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

    // Buscar extraordinarios
    const ibi = appConfig.gastosExtraordinarios.find(e => e.id === 'ibi');
    const seguro = appConfig.gastosExtraordinarios.find(e => e.id === 'seguro_hogar');

    cfgExtraIbi.value = ibi ? ibi.importeTotal : 0;
    cfgExtraSeguro.value = seguro ? seguro.importeTotal : 0;

    // Cargar meses de regularización y alertas
    const alertas = appConfig.alertas || {
      mesHipoteca: 8,
      mesManutencion: 5,
      mesAlquiler: 10,
      tasaManutencion: 2.0,
      tasaAlquiler: 2.0,
      cuotaHipotecaNueva: appConfig.gastosFijos.cuotaHipoteca
    };
    cfgAlertaHipoteca.value = alertas.mesHipoteca;
    cfgAlertaManutencion.value = alertas.mesManutencion;
    cfgAlertaAlquiler.value = alertas.mesAlquiler;
    cfgHipotecaNueva.value = alertas.cuotaHipotecaNueva !== undefined ? alertas.cuotaHipotecaNueva : appConfig.gastosFijos.cuotaHipoteca;
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
    const ibiTotal = parseFloat(cfgExtraIbi.value);
    const seguroTotal = parseFloat(cfgExtraSeguro.value);

    // Validaciones
    const cuotaHipNueva = parseFloat(cfgHipotecaNueva.value);
    const ipcTasa = parseFloat(cfgIpcTasa.value);
    const iravTasa = parseFloat(cfgIravTasa.value);

    if ([cuotaHip, alqHip, com, fiaObj, fiaMen, cocheO, manO, ibiTotal, seguroTotal, cuotaHipNueva, ipcTasa, iravTasa].some(v => isNaN(v) || v < 0)) {
      alert("Por favor, asegúrate de que todos los campos son valores numéricos válidos iguales o superiores a 0.");
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

    // Modificar extraordinarios
    const ibi = appConfig.gastosExtraordinarios.find(e => e.id === 'ibi');
    if (ibi) ibi.importeTotal = ibiTotal;

    const seguro = appConfig.gastosExtraordinarios.find(e => e.id === 'seguro_hogar');
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
      alert("¡Ajustes guardados con éxito en la base de datos de la nube!");
    } catch (err) {
      alert("Error al intentar guardar los ajustes en la base de datos.");
    }
  }

  async function restaurarAjustesPorDefecto() {
    if (!isPedroEditor) return;
    if (confirm("¿Estás seguro de que deseas restablecer los importes a los valores por defecto del problema de negocio? Se perderán las modificaciones de la base de datos.")) {
      try {
        appConfig = await window.StorageModule.resetConfiguration();
        cargarInputsConfiguracion();
        actualizarInterfaz();
        alert("Valores restablecidos por defecto.");
      } catch (err) {
        alert("Error al intentar restablecer los ajustes.");
      }
    }
  }

  // --- EXPORTACIONES ---
  
  // EXPORTAR MES EN CURSO A PDF
  function exportarPdfMes() {
    const mesNombre = NOMBRES_MESES[currentMonthIndex];
    const element = document.getElementById('pdf-printable-area');
    
    // Configuración estética del PDF
    const opt = {
      margin:       10,
      filename:     `CommonPay_Desglose_${mesNombre}_2026.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#090d16' : '#f5f7fb'
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  }

  function generarReporteAnualOlga() {
    const alertas = appConfig.alertas || { mesHipoteca: 8, mesManutencion: 5, mesAlquiler: 10 };
    
    // Contenedor temporal para renderizar el PDF
    const printContainer = document.createElement('div');
    printContainer.style.padding = '25px';
    printContainer.style.fontFamily = "'Inter', sans-serif";
    printContainer.style.color = '#1e293b';
    printContainer.style.backgroundColor = '#ffffff';

    // Generamos las filas de la tabla
    let tablaHTML = '';
    let totalAcumuladoOlga = 0;

    for (let m = 0; m < 12; m++) {
      const desg = window.CalculationsModule.calcularDesgloseMes(m, appConfig);
      const conceptos = desg.desgloseOlga.conceptos;
      totalAcumuladoOlga += desg.desgloseOlga.total;

      // Extraer importes
      const hipoteca = conceptos.find(c => c.nombre.includes('Hipoteca'))?.valor || 0;
      const comunidad = conceptos.find(c => c.nombre.includes('Comunidad'))?.valor || 0;
      const coche = conceptos.find(c => c.nombre.includes('Coche'))?.valor || 0;
      const manutencion = conceptos.find(c => c.nombre.includes('Manutención'))?.valor || 0;
      const fianza = conceptos.find(c => c.nombre.includes('Fianza') || c.nombre.includes('Fondo'))?.valor || 0;
      
      // Sumar extraordinarios
      const extraordinarios = conceptos
        .filter(c => c.tipo === 'extraordinario')
        .reduce((sum, c) => sum + c.valor, 0);

      // Indicadores estacionales
      let notaMes = '';
      if (m === parseInt(alertas.mesHipoteca)) {
        notaMes += '<span style="font-size:0.75rem; color:#d97706; font-weight:600; display:block;">(Rev. Hipoteca)</span>';
      }
      if (m === parseInt(alertas.mesManutencion)) {
        notaMes += '<span style="font-size:0.75rem; color:#d97706; font-weight:600; display:block;">(IPC Manutención)</span>';
      }
      if (m === parseInt(alertas.mesAlquiler)) {
        notaMes += '<span style="font-size:0.75rem; color:#d97706; font-weight:600; display:block;">(Rev. Alquiler IRAV)</span>';
      }

      tablaHTML += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">${NOMBRES_MESES[m]} ${notaMes}</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(hipoteca)} €</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(comunidad)} €</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(fianza)} €</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(coche)} €</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(manutencion)} €</td>
          <td style="padding: 10px; text-align: right;">${formatMoneda(extraordinarios)} €</td>
          <td style="padding: 10px; text-align: right; font-weight: 700; color: #4f46e5;">${formatMoneda(desg.desgloseOlga.total)} €</td>
        </tr>
      `;
    }

    printContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 0; color: #4f46e5;">CommonPay</h1>
          <p style="font-size: 0.85rem; color: #64748b; margin: 2px 0 0 0;">Planificación Anual de Pagos 2026</p>
        </div>
        <div style="text-align: right; padding-top: 5px;">
          <span style="font-weight: 700; color: #1e293b; font-size: 1.05rem;">Destinatario: Olga</span>
        </div>
      </div>

      <div style="margin-bottom: 20px; display: flex; gap: 15px;">
        <div style="flex: 2; font-size: 0.9rem; line-height: 1.5; color: #334155; background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 0;">
          <strong>Información de Contexto de Gastos Comunes:</strong><br>
          Este calendario detalla las aportaciones mensuales correspondientes a Olga para el año 2026. Los gastos comunes (Hipoteca Neta y Comunidad) se calculan al 50%. Los gastos extraordinarios del IBI (306,63 €) se prorratean en Ene/Feb/Mar y el Seguro de Hogar (108,20 €) se imputa en Abril. Las aportaciones al fondo de fianza de 10 €/mes se incluyen hasta reponer el objetivo acumulado de 450 €. 
          Las fechas marcadas indican los meses de regularización contractual.
        </div>
        <div style="flex: 1; font-size: 0.85rem; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; justify-content: center;">
          <strong>Estado del Fondo de Fianza:</strong>
          <div style="margin-top: 5px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 5px;">
            <span>Objetivo Fianza:</span><strong style="text-align: right;">${formatMoneda(appConfig.fianza.objetivo)} €</strong>
            <span>Fondo Acumulado:</span><strong style="text-align: right; color: #16a34a;">${formatMoneda(fianzaAcumulado)} €</strong>
            <span>Saldo Pendiente:</span><strong style="text-align: right; color: #b45309;">${formatMoneda(Math.max(0, window.CalculationsModule.round(appConfig.fianza.objetivo - fianzaAcumulado)))} €</strong>
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 25px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px; text-align: left; font-weight: 600;">Mes</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Hipoteca (50%)</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Comunidad (50%)</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Fianza</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Coche</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Manutención</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Extraordinarios</th>
            <th style="padding: 10px; text-align: right; font-weight: 600; background-color: #e0e7ff; color: #4338ca;">Total Olga</th>
          </tr>
        </thead>
        <tbody>
          ${tablaHTML}
          <tr style="background-color: #f8fafc; border-top: 2px solid #cbd5e1; font-weight: 700; font-size: 0.95rem;">
            <td style="padding: 15px 10px;" colspan="7">Total Previsión Anual Acumulada:</td>
            <td style="padding: 15px 10px; text-align: right; color: #4f46e5; background-color: #e0e7ff;">${formatMoneda(totalAcumuladoOlga)} €</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 0.75rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
        <span>Generado automáticamente por CommonPay</span>
        <span>Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}</span>
      </div>
    `;

    // Configuración de descarga PDF
    const opt = {
      margin:       15,
      filename:     `CommonPay_Prevision_Anual_Olga_2026.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(printContainer).save();
  }

  // EXPORTAR HISTORIAL A EXCEL (XLSX)
  function exportarExcelHistorial() {
    if (historialTransferencias.length === 0) {
      alert("No hay datos en el historial para exportar.");
      return;
    }

    const rows = historialTransferencias.map(t => {
      const fecha = new Date(t.fechaCompletado);
      const fechaFormateada = `${agregarCero(fecha.getDate())}/${agregarCero(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
      
      return {
        'Mes': t.mesNombre,
        'Año': t.anio,
        'Transferencia Olga (€)': t.transferenciaOlga,
        'Transferencia Pedro (€)': t.transferenciaPedro,
        'Total Aportado en el Mes (€)': window.CalculationsModule.round(t.transferenciaOlga + t.transferenciaPedro),
        'Fondo Fianza al Momento (€)': t.fianzaAlMomento,
        'Fecha de Registro': fechaFormateada,
        'Estado': 'Completado'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial de Transferencias");

    const maxKeys = Object.keys(rows[0]);
    const wscols = maxKeys.map(key => {
      return { wch: Math.max(key.length + 3, 15) };
    });
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `CommonPay_Historial_Gastos_2026.xlsx`);
  }

  // --- LÓGICA VISTA: LIQUIDACIÓN Y CONCILIACIÓN (DÍA 15 - FASE 3) ---

  function obtenerFianzaAcumuladaParaMes(mesIndex, anio) {
    const registro = historialTransferencias.find(t => t.mesIndex === mesIndex && t.anio === anio);
    if (registro) {
      return registro.fianzaAlMomento;
    }
    return fianzaAcumulado;
  }

  function actualizarVistaConciliacion() {
    const fianzaEsp = obtenerFianzaAcumuladaParaMes(currentMonthIndex, currentAnio);
    document.getElementById('con-mes-nombre').innerText = `${NOMBRES_MESES[currentMonthIndex]} / ${currentAnio}`;
    document.getElementById('con-fianza-esperada').innerText = `${formatMoneda(fianzaEsp)} €`;
    
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

    listaOrdenada.forEach(c => {
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

      const diffColorClass = c.diferencia > 0 ? 'text-success' : (c.diferencia < 0 ? 'text-danger' : 'text-primary');

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
        if (confirm(`¿Estás seguro de que deseas eliminar el registro de liquidación de ${c.mesNombre} / ${c.anio}?`)) {
          try {
            await window.StorageModule.deleteConciliacion(c.id, c.mesIndex, c.anio);
            conciliaciones = await window.StorageModule.getConciliaciones();
            actualizarVistaConciliacion();
            alert("Liquidación eliminada correctamente.");
          } catch (e) {
            alert("Error al eliminar la liquidación de la base de datos.");
          }
        }
      });

      tbody.appendChild(row);
    });

    // Controlar visibilidad del botón de eliminación en la tabla de conciliaciones
    const deleteButtons = tbody.querySelectorAll('.delete-conciliacion-btn');
    deleteButtons.forEach(btn => {
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
      alert("Por favor, introduce un saldo real válido igual o superior a 0 €.");
      return;
    }

    const fianzaEsp = obtenerFianzaAcumuladaParaMes(currentMonthIndex, currentAnio);
    const fianzaEspCents = Math.round(fianzaEsp * 100);
    const saldoRealCents = Math.round(saldoRealVal * 100);
    const diferenciaCents = saldoRealCents - fianzaEspCents;
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
      instrucciones = `El saldo en el banco es superior a la fianza acumulada que debe protegerse. <br><br><strong>Pedro debe retirar ${formatMoneda(diferencia)} €</strong> de la cuenta común y transferirlos a su cuenta personal (recaudando a su favor la manutención de Olga y otros sobrantes). Tras este retiro, el saldo de la cuenta común quedará exactamente nivelado con el ahorro de la fianza (<strong>${formatMoneda(fianzaEsp)} €</strong>).`;
    } else if (diferencia < 0) {
      cardClass = 'deficit';
      iconName = 'alert-triangle';
      titulo = 'Liquidación del día 15: Déficit Detectado';
      difSimbolo = '';
      tipo = 'deficit_repuesto';
      instrucciones = `El saldo en el banco está por debajo del ahorro de la fianza comprometido. <br><br><strong>Pedro debe aportar ${formatMoneda(Math.abs(diferencia))} €</strong> de su propio dinero particular a la cuenta común para reponer la fianza. Tras este ingreso, el saldo de la cuenta común volverá a garantizar el fondo de la fianza (<strong>${formatMoneda(fianzaEsp)} €</strong>).`;
    } else {
      cardClass = 'equilibrado';
      iconName = 'scale';
      titulo = 'Liquidación del día 15: Cuenta Equilibrada';
      difSimbolo = '';
      tipo = 'equilibrado';
      instrucciones = `El saldo bancario actual coincide exactamente con el ahorro de la fianza acumulada de <strong>${formatMoneda(fianzaEsp)} €</strong>. No hay acciones de liquidación pendientes para Pedro.`;
    }

    panelResultado.className = `glass-card balance-card ${cardClass}`;
    
    // Crear el HTML interno
    let registrarBtnHTML = '';
    
    // Comprobar si ya existe registro para este mes y año
    const yaRegistrado = conciliaciones.some(
      c => c.mesIndex === currentMonthIndex && c.anio === currentAnio
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
        alert(`Liquidación del mes de ${NOMBRES_MESES[currentMonthIndex]} registrada correctamente.`);
      } else {
        alert("Esta liquidación ya había sido registrada anteriormente.");
      }
    } catch (e) {
      alert("Error al intentar guardar la liquidación en la base de datos.");
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
      mesHipoteca: 8,
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
      bloque += `\r\nBEGIN:VALARM\r\nTRIGGER:-PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:Recordatorio CommonPay\r\nEND:VALARM\r\nEND:VEVENT`;
      return bloque;
    };

    // 1. Ingreso de Olga — recurrente cada día 5
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, 0, 5),
      dtend: icsDate(anio, 0, 6),
      summary: '💸 Ingreso Olga — Cuenta Común',
      description: 'Olga transfiere su aportación mensual a la cuenta común (gastos de hogar + manutención + coche). Verificar que el ingreso ha llegado.',
      rrule: `FREQ=MONTHLY;BYMONTHDAY=5;UNTIL=${anio}1231`
    }));

    // 2. Cobro Hipoteca — recurrente cada día 10
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, 0, 10),
      dtend: icsDate(anio, 0, 11),
      summary: '🏠 Cobro Hipoteca — Cuenta Común',
      description: `El banco cargará la cuota hipotecaria en torno al día 10. Cuota base: ${formatMoneda(appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Revisar el saldo de la cuenta.`,
      rrule: `FREQ=MONTHLY;BYMONTHDAY=10;UNTIL=${anio}1231`
    }));

    // 3. Ingreso Alquiler Casa — recurrente cada día 15
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, 0, 15),
      dtend: icsDate(anio, 0, 16),
      summary: '🏡 Ingreso Alquiler Casa — Cuenta Común',
      description: `El inquilino transfiere el alquiler de la casa. Importe mensual: ${formatMoneda(appConfig.gastosFijos?.ingresoAlquiler || 0)} €. Comprobar el ingreso en cuenta y liquidar diferencias del día 15.`,
      rrule: `FREQ=MONTHLY;BYMONTHDAY=15;UNTIL=${anio}1231`
    }));

    // 4. Revisión Hipoteca Variable (evento puntual el día 1 del mes configurado)
    const mesHip = parseInt(alertas.mesHipoteca ?? 8);
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, mesHip, 1),
      dtend: icsDate(anio, mesHip, 2),
      summary: `⚠️ Revisión Hipoteca Variable — ${NOMBRES_MESES[mesHip]} ${anio}`,
      description: `Este mes se revisa la cuota de la hipoteca variable. Nueva cuota estimada: ${formatMoneda(alertas.cuotaHipotecaNueva || appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Actualizar el importe en CommonPay > Ajustes.`,
      rrule: null
    }));

    // 5. Actualización Manutención IPC (evento puntual el día 1 del mes configurado)
    const mesMant = parseInt(alertas.mesManutencion ?? 5);
    const manutencionNueva = (appConfig.gastosPersonales?.olga?.manutencion || 0) * (1 + (alertas.tasaManutencion || 2) / 100);
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, mesMant, 1),
      dtend: icsDate(anio, mesMant, 2),
      summary: `📈 Actualización Manutención IPC — ${NOMBRES_MESES[mesMant]} ${anio}`,
      description: `Este mes se actualiza la cuota de manutención conforme al IPC (${alertas.tasaManutencion || 2}%). Nuevo importe estimado: ${formatMoneda(manutencionNueva)} €/mes. Actualizar en CommonPay > Ajustes.`,
      rrule: null
    }));

    // 6. Actualización Alquiler IRAV (evento puntual el día 1 del mes configurado)
    const mesAlq = parseInt(alertas.mesAlquiler ?? 10);
    const alquilerNuevo = (appConfig.gastosFijos?.ingresoAlquiler || 0) * (1 + (alertas.tasaAlquiler || 2) / 100);
    eventos.push(vevent({
      uid: uid(),
      dtstart: icsDate(anio, mesAlq, 1),
      dtend: icsDate(anio, mesAlq, 2),
      summary: `📋 Actualización Alquiler IRAV — ${NOMBRES_MESES[mesAlq]} ${anio}`,
      description: `Este mes se actualiza el alquiler de la casa conforme al IRAV (${alertas.tasaAlquiler || 2}%). Nuevo importe estimado: ${formatMoneda(alquilerNuevo)} €/mes. Actualizar en CommonPay > Ajustes.`,
      rrule: null
    }));

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
      texto = `Ingreso Olga - Cuenta Común`;
      descripcion = `Olga transfiere su aportación mensual (hogar + manutención + coche) a la cuenta común. Verificar que el ingreso ha llegado.`;
      dia = '05';
    } else if (tipo === 'hipoteca') {
      texto = `Cobro Hipoteca - Cuenta Común`;
      descripcion = `El banco carga la cuota hipotecaria. Cuota base: ${formatMoneda(appConfig.gastosFijos?.cuotaHipoteca || 0)} €. Revisar saldo disponible.`;
      dia = '10';
    } else if (tipo === 'alquiler') {
      texto = `Ingreso Alquiler Casa - Cuenta Común`;
      descripcion = `El inquilino transfiere el alquiler mensual: ${formatMoneda(appConfig.gastosFijos?.ingresoAlquiler || 0)} €. Día de liquidación del balance.`;
      dia = '15';
    }

    // Fecha de inicio: primer mes del año en el día indicado
    const fechaInicio = `${anio}01${dia}`;
    const fechaFin = `${anio}01${parseInt(dia) + 1 < 10 ? '0' + (parseInt(dia) + 1) : (parseInt(dia) + 1)}`;

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
