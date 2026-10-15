/**
 * ECOVISION® — Environmental Intelligence Platform Controller
 * Architecture: Clean Vanilla JavaScript, Production-Quality Architectural UI,
 * Chart.js Integration, Facility Digital Twin Simulation, and Flask SQLite Integration.
 */

// ============================================================================
// Global State
// ============================================================================
const state = {
  isBackendConnected: false,
  activeSection: 'platform',
  isScanning: false,
  isStreamSimulating: false,
  simInterval: null,
  selectedPresetKey: null,
  currentUploadedFile: null,
  currentClassification: null,
  selectedStreamKey: 'plastic',
  recommendations: null,
  stats: {
    totalScans: 0,
    recyclableRate: 0,
    categoriesCount: 0,
    totalWeightKg: 0,
    carbonSavedKg: 0
  },
  streams: {
    plastic: { fill: 64, weight: 320, max: 500, name: 'Plastic Polymers', color: '#3659C9', icon: '🥤', code: 'SILO-01' },
    paper: { fill: 48, weight: 192, max: 400, name: 'Pulp & Fibre', color: '#C87952', icon: '📦', code: 'SILO-02' },
    metal: { fill: 82, weight: 492, max: 600, name: 'Metal Alloys', color: '#172333', icon: '🥫', code: 'SILO-03' },
    glass: { fill: 35, weight: 175, max: 500, name: 'Glass Cullet', color: '#9CAF98', icon: '🍾', code: 'SILO-04' },
    organic: { fill: 55, weight: 220, max: 400, name: 'Organic Biomass', color: '#8893A2', icon: '🍎', code: 'SILO-05' }
  },
  history: [],
  presets: {
    plastic_bottle: {
      id: 'plastic_bottle',
      filename: 'sample_pet_water_bottle.jpg',
      name: 'PET Water Bottle',
      category: 'Plastic',
      subCategory: 'PET-1 (Polyethylene Terephthalate)',
      confidence: 98.4,
      recyclable: true,
      decomposition: '450 Years',
      carbonOffset: '0.18 kg CO2e',
      disposalProtocol: 'Empty contents completely and rinse with cold water. Remove and separate polypropylene screw cap to prevent mixed-polymer density contamination during flotation.',
      reuseOptions: 'Reprocessable into certified recycled rPET pellet flakes, thermoformed food packaging trays, and industrial polyester yarns.',
      recyclingTips: 'Compress vertically to conserve transport volume. Do not tie inside opaque plastic shopping bags.',
      svg: `<svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0E1622"/>
        <line x1="20" y1="90" x2="220" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="120" y1="15" x2="120" y2="165" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <rect x="105" y="32" width="30" height="16" fill="#3659C9" stroke="#EEF2FD" stroke-width="1.2"/>
        <path d="M108 48 H132 L146 72 V142 C146 148 141 154 134 154 H106 C99 154 94 148 94 142 V72 L108 48 Z" fill="#172333" stroke="#3659C9" stroke-width="1.8"/>
        <path d="M96 85 H144 M96 105 H144 M96 125 H144" stroke="#3659C9" stroke-width="1.2" stroke-dasharray="2 3"/>
        <rect x="102" y="92" width="36" height="26" fill="#3659C9" rx="1"/>
        <text x="120" y="108" font-family="JetBrains Mono, monospace" font-size="9" font-weight="600" fill="#FFFFFF" text-anchor="middle">#1 PET</text>
        <circle cx="120" cy="90" r="65" stroke="#3659C9" stroke-width="0.8" stroke-dasharray="2 4"/>
      </svg>`
    },
    aluminum_can: {
      id: 'aluminum_can',
      filename: 'sample_aluminum_soda_can.png',
      name: 'Aluminum Soda Can',
      category: 'Metal',
      subCategory: 'UBC Aluminum Alloy 3104 / 5182',
      confidence: 99.1,
      recyclable: true,
      decomposition: '200 Years',
      carbonOffset: '0.35 kg CO2e',
      disposalProtocol: 'Drain fluid residues. Aluminum can be recycled infinitely with zero degradation of crystal matrix. Crush body flat to maximize bale density.',
      reuseOptions: 'Direct remelting in electric reverberatory furnace into primary ingot stock for new UBC containers within 60 days.',
      recyclingTips: 'Leave pop tab attached to container body. Do not pack can with cigarette butts or loose foil wrappers.',
      svg: `<svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0E1622"/>
        <line x1="20" y1="90" x2="220" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="120" y1="15" x2="120" y2="165" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <ellipse cx="120" cy="45" rx="36" ry="12" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
        <ellipse cx="120" cy="45" rx="16" ry="5" fill="#64748B" stroke="#CBD5E1" stroke-width="1"/>
        <rect x="84" y="45" width="72" height="92" fill="#1E293B" stroke="#94A3B8" stroke-width="1.8"/>
        <ellipse cx="120" cy="137" rx="36" ry="12" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
        <path d="M96 75 Q120 90 144 75" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
        <text x="120" y="105" font-family="JetBrains Mono, monospace" font-size="9" font-weight="600" fill="#E2E8F0" text-anchor="middle">ALU // 100%</text>
        <circle cx="120" cy="90" r="65" stroke="#94A3B8" stroke-width="0.8" stroke-dasharray="2 4"/>
      </svg>`
    },
    cardboard_box: {
      id: 'cardboard_box',
      filename: 'sample_shipping_carton.jpg',
      name: 'Corrugated Shipping Box',
      category: 'Paper',
      subCategory: 'Corrugated Unbleached Kraft',
      confidence: 97.6,
      recyclable: true,
      decomposition: '2 Months',
      carbonOffset: '0.24 kg CO2e',
      disposalProtocol: 'Peel off shipping thermal labels and tape. Flatten box completely to ensure optimal compression in automated baler cells.',
      reuseOptions: 'Repulped into testliner packaging board, egg cartons, and acoustic ceiling sound baffle panels.',
      recyclingTips: 'Ensure cardboard is free of kitchen oil and grease stains. Greasy sections must be routed to organic compost.',
      svg: `<svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0E1622"/>
        <line x1="20" y1="90" x2="220" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="120" y1="15" x2="120" y2="165" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <polygon points="120,38 180,68 120,98 60,68" fill="#C87952" stroke="#FAF2EE" stroke-width="1.5"/>
        <polygon points="60,68 120,98 120,154 60,124" fill="#A65A36" stroke="#FAF2EE" stroke-width="1.5"/>
        <polygon points="120,98 180,68 180,124 120,154" fill="#8C4726" stroke="#FAF2EE" stroke-width="1.5"/>
        <line x1="90" y1="83" x2="150" y2="53" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3 3"/>
        <text x="150" y="115" font-family="JetBrains Mono, monospace" font-size="9" font-weight="600" fill="#FFFFFF" text-anchor="middle">KRAFT</text>
        <circle cx="120" cy="90" r="65" stroke="#C87952" stroke-width="0.8" stroke-dasharray="2 4"/>
      </svg>`
    },
    glass_bottle: {
      id: 'glass_bottle',
      filename: 'sample_flint_glass_jar.jpg',
      name: 'Flint Glass Jar',
      category: 'Glass',
      subCategory: 'Container Flint Soda-Lime Glass',
      confidence: 96.1,
      recyclable: true,
      decomposition: '1 Million Years',
      carbonOffset: '0.31 kg CO2e',
      disposalProtocol: 'Rinse jar cleanly. Remove metal lids for separate eddy current sorting. Glass remelting consumes 30% less energy than virgin silica batch.',
      reuseOptions: 'Crushed into certified cullet feedstock for new beverage containers, glass bead insulation, and decorative terrazzo aggregate.',
      recyclingTips: 'Do not combine container glass with borosilicate Pyrex kitchenware, window panes, or mirrors.',
      svg: `<svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0E1622"/>
        <line x1="20" y1="90" x2="220" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="120" y1="15" x2="120" y2="165" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <rect x="106" y="38" width="28" height="14" fill="#9CAF98" stroke="#F1F5F0" stroke-width="1.2"/>
        <path d="M106 52 L92 82 V144 C92 150 97 155 104 155 H136 C143 155 148 150 148 144 V82 L134 52 Z" fill="#172333" stroke="#9CAF98" stroke-width="1.8"/>
        <path d="M100 90 C100 90 104 130 104 140" stroke="#9CAF98" stroke-width="2" stroke-linecap="round"/>
        <text x="120" y="120" font-family="JetBrains Mono, monospace" font-size="9" font-weight="600" fill="#9CAF98" text-anchor="middle">CULLET</text>
        <circle cx="120" cy="90" r="65" stroke="#9CAF98" stroke-width="0.8" stroke-dasharray="2 4"/>
      </svg>`
    },
    apple_core: {
      id: 'apple_core',
      filename: 'sample_organic_fruit_scrap.jpg',
      name: 'Organic Food Waste',
      category: 'Organic',
      subCategory: 'Biodegradable Compost Biomass',
      confidence: 98.7,
      recyclable: true,
      decomposition: '3-4 Weeks',
      carbonOffset: '0.11 kg CO2e',
      disposalProtocol: 'Route to industrial anaerobic biodigestion or municipal aerobic windrow composting. Prevents anaerobic landfill methane production.',
      reuseOptions: 'Converted to high-nutrient organic soil conditioner, certified vermicompost, and biogas electrical generation.',
      recyclingTips: 'Keep entirely free from plastic films, produce stickers, and coated composite coffee cups.',
      svg: `<svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="180" fill="#0E1622"/>
        <line x1="20" y1="90" x2="220" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="120" y1="15" x2="120" y2="165" stroke="#1E293B" stroke-width="1" stroke-dasharray="3 3"/>
        <path d="M120 40 C120 30 128 25 132 20" stroke="#8893A2" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="136" cy="27" rx="8" ry="4" fill="#9CAF98" transform="rotate(-15 136 27)"/>
        <path d="M100 50 C110 50 115 62 120 62 C125 62 130 50 140 50 C155 50 155 75 140 92 C155 110 155 136 140 136 C128 136 124 124 120 124 C116 124 112 136 100 136 C85 136 85 110 100 92 C85 75 85 50 100 50 Z" fill="#2E3C4E" stroke="#8893A2" stroke-width="1.8"/>
        <circle cx="115" cy="85" r="2.5" fill="#FFFFFF"/>
        <circle cx="125" cy="100" r="2.5" fill="#FFFFFF"/>
        <circle cx="120" cy="90" r="65" stroke="#8893A2" stroke-width="0.8" stroke-dasharray="2 4"/>
      </svg>`
    }
  }
};

// Chart.js references
let compositionChartInstance = null;
let timelineChartInstance = null;

// ============================================================================
// Initialization on DOM Load
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScannerControls();
  initDigitalTwin();
  initInsightsCharts();
  initHistoryLedger();

  // Initial Health Check
  checkBackendHealth();
  loadPersonalizedRecommendations();

  // Periodic Telemetry Synchronization (every 8s)
  setInterval(() => {
    if (state.isBackendConnected) {
      syncLiveTelemetry();
    }
  }, 8000);
});

// ============================================================================
// Navigation Controller
// ============================================================================
function initNavigation() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navLinksMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // Update active link on scroll
  window.addEventListener('scroll', () => {
    const sections = ['platform', 'scanner', 'twin', 'insights'];
    const scrollPos = window.scrollY + 120;

    for (const id of sections) {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          updateActiveNav(id);
          break;
        }
      }
    }
  }, { passive: true });
}

function navigateToSection(sectionId) {
  state.activeSection = sectionId;
  updateActiveNav(sectionId);

  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const navMenu = document.getElementById('navLinksMenu');
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }
}

function updateActiveNav(sectionId) {
  document.querySelectorAll('.nav-menu-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });
}

// ============================================================================
// Backend Telemetry & Health Check
// ============================================================================
async function checkBackendHealth() {
  const indicator = document.getElementById('navStatusIndicator');
  const statusText = document.getElementById('navStatusText');
  const banner = document.getElementById('systemAlertStrip');
  const tag = document.getElementById('stripNoticeTag');
  const msg = document.getElementById('stripNoticeMsg');
  const btnRetry = document.getElementById('btnRetryConnection');

  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      state.isBackendConnected = true;

      if (indicator) {
        indicator.className = 'operational-status-tag live';
        statusText.textContent = `OPERATIONAL // PORT 5050`;
      }

      if (banner) {
        banner.className = 'system-announcement-strip live';
        if (tag) tag.textContent = '[SYSTEM // VERIFIED]';
        if (msg) msg.textContent = `Connected to SQLite database & AI model repository (${data.model || 'ViT-YOLOv8'}). Port: 5050.`;
        if (btnRetry) btnRetry.textContent = 'Synced';
      }

      // Synchronize live stats and history
      await syncLiveTelemetry();
      await fetchLiveHistory();
    } else {
      throw new Error(`API returned HTTP ${res.status}`);
    }
  } catch (err) {
    state.isBackendConnected = false;

    if (indicator) {
      indicator.className = 'operational-status-tag demo';
      statusText.textContent = `SIMULATION MODE`;
    }

    if (banner) {
      banner.className = 'system-announcement-strip demo';
      if (tag) tag.textContent = '[SIMULATION MODE]';
      if (msg) msg.textContent = 'Flask backend is offline on port 5050. Operating on client-side simulation.';
      if (btnRetry) btnRetry.textContent = 'Retry API';
    }

    renderHeroMetrics();
    renderHistoryTable();
  }
}

async function syncLiveTelemetry() {
  try {
    const [statsRes, twinRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/digital-twin')
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      state.stats = {
        totalScans: stats.total_scans ?? 0,
        recyclableRate: stats.recyclable_rate ?? 0,
        categoriesCount: stats.categories_count ?? 0,
        totalWeightKg: stats.total_weight_kg ?? 0,
        carbonSavedKg: stats.carbon_saved_kg ?? 0
      };
      renderHeroMetrics();
      updateInsightsCharts();
    }

    if (twinRes.ok) {
      const twin = await twinRes.json();
      if (twin.bins) {
        Object.keys(twin.bins).forEach(k => {
          if (state.streams[k]) {
            state.streams[k].fill = Math.round(twin.bins[k].fill_percentage);
            state.streams[k].weight = Math.round(twin.bins[k].current_kg);
            state.streams[k].max = Math.round(twin.bins[k].max_kg);
          }
        });
        updateTwinDisplay();
      }
    }
  } catch (err) {
    console.warn('Telemetry synchronization note:', err);
  }
}

function renderHeroMetrics() {
  const elScans = document.getElementById('heroStatScans');
  const elRate = document.getElementById('heroStatRate');
  const elCats = document.getElementById('heroStatCategories');
  const elWeight = document.getElementById('heroStatWeight');

  if (elScans) elScans.textContent = state.stats.totalScans;
  if (elRate) elRate.textContent = `${state.stats.recyclableRate}%`;
  if (elCats) elCats.textContent = state.stats.categoriesCount;
  if (elWeight) elWeight.innerHTML = `${Number(state.stats.totalWeightKg).toFixed(1)} <abbr title="Kilograms">kg</abbr>`;
}

// ============================================================================
// Scanner Workspace (Area 1, 2, 3)
// ============================================================================
function initScannerControls() {
  const dropzone = document.getElementById('specimenDropzone');
  const fileInput = document.getElementById('specimenFileInput');
  const btnTrigger = document.getElementById('btnRunInference');
  const btnReplace = document.getElementById('btnReplaceImage');
  const btnClear = document.getElementById('btnClearImage');
  const presetBtns = document.querySelectorAll('.specimen-preset-card');

  // Preset Selection
  presetBtns.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-preset');
      selectPreset(key);
    });
  });

  // Dropzone & File Input Handlers
  if (fileInput) {
    fileInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleImageUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleImageUpload(fileInput.files[0]);
      }
    });
  }

  // Optical Stage Actions
  if (btnReplace && fileInput) {
    btnReplace.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      fileInput.click();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => resetScannerStage());
  }

  // Run Inference Trigger
  if (btnTrigger) {
    btnTrigger.addEventListener('click', () => executeAnalysisWorkflow());
  }

  // Route to Silo Trigger
  const btnDispatch = document.getElementById('btnDispatchToSilo');
  if (btnDispatch) {
    btnDispatch.addEventListener('click', () => dispatchToDigitalTwin());
  }
}

function selectPreset(presetKey) {
  const preset = state.presets[presetKey];
  if (!preset) return;

  state.selectedPresetKey = presetKey;
  state.currentUploadedFile = null;

  // Clear file input
  const fileInput = document.getElementById('specimenFileInput');
  if (fileInput) fileInput.value = '';

  // Reset Dropzone UI
  const dropzone = document.getElementById('specimenDropzone');
  const dropzonePrimary = document.getElementById('dropzonePrimaryCaption');
  const dropzoneSecondary = document.getElementById('dropzoneSecondaryCaption');
  const dropzoneInfo = document.getElementById('dropzoneSelectedInfo');
  if (dropzone) dropzone.classList.remove('has-file');
  if (dropzonePrimary) dropzonePrimary.textContent = 'Drop specimen image here';
  if (dropzoneSecondary) dropzoneSecondary.textContent = 'or click to browse files (JPEG, PNG, WEBP < 16MB)';
  if (dropzoneInfo) {
    dropzoneInfo.textContent = '';
    dropzoneInfo.style.display = 'none';
  }

  // Highlight card
  document.querySelectorAll('.specimen-preset-card').forEach(el => {
    el.classList.toggle('selected', el.getAttribute('data-preset') === presetKey);
  });

  // Display SVG Preview in Viewfinder
  const img = document.getElementById('viewfinderImg');
  const standby = document.getElementById('viewfinderStandby');
  const btnTrigger = document.getElementById('btnRunInference');

  const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(preset.svg);
  if (img) {
    img.src = encoded;
    img.style.display = 'block';
  }
  if (standby) standby.style.display = 'none';
  if (btnTrigger) btnTrigger.removeAttribute('disabled');

  triggerSystemToast(`Loaded preset specimen: ${preset.name}`, 'info');
}

function handleImageUpload(file) {
  if (!file) return;

  const isImageMime = file.type && (file.type.startsWith('image/') || file.type === 'application/octet-stream');
  const isImageExt = /\.(jpe?g|png|webp|heic|bmp|tiff|gif|svg)$/i.test(file.name);

  if (!isImageMime && !isImageExt && file.type) {
    triggerSystemToast('Please provide an image file (JPEG, PNG, WEBP).', 'error');
    return;
  }

  if (file.size > 16 * 1024 * 1024) {
    triggerSystemToast('File size exceeds the 16MB limit.', 'error');
    return;
  }

  state.currentUploadedFile = file;
  state.selectedPresetKey = null;

  // Deselect preset items
  document.querySelectorAll('.specimen-preset-card').forEach(el => el.classList.remove('selected'));

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('viewfinderImg');
    const standby = document.getElementById('viewfinderStandby');
    const btnTrigger = document.getElementById('btnRunInference');
    const dropzone = document.getElementById('specimenDropzone');
    const dropzonePrimary = document.getElementById('dropzonePrimaryCaption');
    const dropzoneSecondary = document.getElementById('dropzoneSecondaryCaption');
    const dropzoneInfo = document.getElementById('dropzoneSelectedInfo');

    if (img) {
      img.src = e.target.result;
      img.style.display = 'block';
    }
    if (standby) standby.style.display = 'none';
    if (btnTrigger) btnTrigger.removeAttribute('disabled');

    // Update dropzone feedback
    if (dropzone) dropzone.classList.add('has-file');
    if (dropzonePrimary) dropzonePrimary.textContent = `Selected: ${file.name}`;
    if (dropzoneSecondary) dropzoneSecondary.textContent = `${Math.round(file.size / 1024)} KB · Ready for neural inference`;
    if (dropzoneInfo) {
      dropzoneInfo.textContent = '✓ Optical feed active in viewfinder stage';
      dropzoneInfo.style.display = 'block';
    }

    triggerSystemToast(`Image ingested: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
  };
  reader.readAsDataURL(file);
}

function resetScannerStage() {
  state.selectedPresetKey = null;
  state.currentUploadedFile = null;
  state.currentClassification = null;

  const fileInput = document.getElementById('specimenFileInput');
  if (fileInput) fileInput.value = '';

  const dropzone = document.getElementById('specimenDropzone');
  const dropzonePrimary = document.getElementById('dropzonePrimaryCaption');
  const dropzoneSecondary = document.getElementById('dropzoneSecondaryCaption');
  const dropzoneInfo = document.getElementById('dropzoneSelectedInfo');

  if (dropzone) dropzone.classList.remove('has-file');
  if (dropzonePrimary) dropzonePrimary.textContent = 'Drop specimen image here';
  if (dropzoneSecondary) dropzoneSecondary.textContent = 'or click to browse files (JPEG, PNG, WEBP < 16MB)';
  if (dropzoneInfo) {
    dropzoneInfo.textContent = '';
    dropzoneInfo.style.display = 'none';
  }

  const img = document.getElementById('viewfinderImg');
  const standby = document.getElementById('viewfinderStandby');
  const btnTrigger = document.getElementById('btnRunInference');

  document.querySelectorAll('.specimen-preset-card').forEach(el => el.classList.remove('selected'));

  if (img) {
    img.src = '';
    img.style.display = 'none';
  }
  if (standby) standby.style.display = 'flex';
  if (btnTrigger) btnTrigger.setAttribute('disabled', 'true');

  // Reset Results and Guidance areas
  const resEmpty = document.getElementById('classificationEmptyState');
  const resActive = document.getElementById('classificationActiveBody');
  const guideEmpty = document.getElementById('guidanceEmptyState');
  const guideActive = document.getElementById('guidanceActiveBody');
  const stepper = document.getElementById('scanningStepper');

  if (resEmpty) resEmpty.style.display = 'flex';
  if (resActive) resActive.classList.remove('active');
  if (guideEmpty) guideEmpty.style.display = 'flex';
  if (guideActive) guideActive.classList.remove('active');
  if (stepper) stepper.classList.remove('active');

  triggerSystemToast('Optical viewfinder cleared.', 'info');
}

// ============================================================================
// Neural Inference Execution
// ============================================================================
async function executeAnalysisWorkflow() {
  if (state.isScanning) return;
  if (!state.currentUploadedFile && !state.selectedPresetKey) {
    triggerSystemToast('Ingest an image or select a preset first.', 'error');
    return;
  }

  state.isScanning = true;
  const stage = document.getElementById('viewfinderStage');
  const btnTrigger = document.getElementById('btnRunInference');
  const stepper = document.getElementById('scanningStepper');
  const stepperLabel = document.getElementById('stepperTaskLabel');
  const stepperPct = document.getElementById('stepperTaskPct');
  const stepperBar = document.getElementById('stepperProgressBar');
  const stepperSub = document.getElementById('stepperTaskSub');

  if (stage) stage.classList.add('scanning');
  if (btnTrigger) btnTrigger.setAttribute('disabled', 'true');
  if (stepper) stepper.classList.add('active');

  const updateProgress = (pct, label, sub) => {
    if (stepperPct) stepperPct.textContent = `${pct}%`;
    if (stepperBar) stepperBar.style.width = `${pct}%`;
    if (stepperLabel) stepperLabel.textContent = label;
    if (stepperSub) stepperSub.textContent = sub;
  };

  updateProgress(25, 'Optical feature extraction...', 'ViT patch embedding & spatial bounding');
  await new Promise(r => setTimeout(r, 350));

  updateProgress(60, 'Spectrometric tensor conversion...', 'Evaluating polymer/alloy density vs. material ontology');
  await new Promise(r => setTimeout(r, 450));

  updateProgress(85, 'Formulating circular disposal route...', 'Calculating decomposition bounds & energy savings');
  await new Promise(r => setTimeout(r, 300));

  let scanResult = null;

  try {
    const formData = new FormData();
    if (state.currentUploadedFile) {
      formData.append('image', state.currentUploadedFile);
    } else if (state.selectedPresetKey) {
      const preset = state.presets[state.selectedPresetKey];
      const blob = new Blob([preset.svg], { type: 'image/svg+xml' });
      formData.append('image', blob, preset.filename);
    }

    const response = await fetch('/api/scan', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      scanResult = await response.json();
    } else {
      throw new Error(`Inference API returned HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('Live API unavailable. Using verified deterministic fallback:', err);
    const fallbackPreset = state.presets[state.selectedPresetKey] || state.presets.plastic_bottle;
    scanResult = {
      id: `scan-${Date.now()}`,
      filename: state.currentUploadedFile ? state.currentUploadedFile.name : fallbackPreset.filename,
      category: fallbackPreset.category,
      sub_category: fallbackPreset.subCategory,
      confidence: fallbackPreset.confidence,
      recyclable: fallbackPreset.recyclable,
      decomposition: fallbackPreset.decomposition,
      carbon_saved: fallbackPreset.carbonOffset,
      disposal_steps: fallbackPreset.disposalProtocol,
      is_demo: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  updateProgress(100, 'Classification verified.', 'Neural confidence confirmed');
  await new Promise(r => setTimeout(r, 200));

  // Teardown scanning UI
  if (stage) stage.classList.remove('scanning');
  if (stepper) stepper.classList.remove('active');
  if (btnTrigger) btnTrigger.removeAttribute('disabled');
  state.isScanning = false;

  state.currentClassification = scanResult;
  displayClassification(scanResult);

  // Sync telemetry so hero metrics update immediately from SQLite
  await syncLiveTelemetry();
  await fetchLiveHistory();
  loadPersonalizedRecommendations(false);

  triggerSystemToast(`Classified: ${scanResult.category} (${scanResult.confidence}%)`, 'success');
}

function displayClassification(result) {
  const resEmpty = document.getElementById('classificationEmptyState');
  const resActive = document.getElementById('classificationActiveBody');
  const guideEmpty = document.getElementById('guidanceEmptyState');
  const guideActive = document.getElementById('guidanceActiveBody');

  if (resEmpty) resEmpty.style.display = 'none';
  if (resActive) resActive.classList.add('active');
  if (guideEmpty) guideEmpty.style.display = 'none';
  if (guideActive) guideActive.classList.add('active');

  // Area 2: Classification Data
  const badge = document.getElementById('resultSourceBadge');
  const badgeLabel = document.getElementById('resultSourceLabel');
  const elCategory = document.getElementById('resCategoryDisplay');
  const elSub = document.getElementById('resSubCategoryDisplay');
  const elConf = document.getElementById('resConfidenceDisplay');
  const elCirc = document.getElementById('resCircularityDisplay');
  const elDecomp = document.getElementById('resDecompositionDisplay');
  const elCarbon = document.getElementById('resCarbonDisplay');
  const elStream = document.getElementById('resStreamDisplay');

  if (badge && badgeLabel) {
    if (result.is_demo) {
      badge.className = 'verification-badge-pill demo';
      badgeLabel.textContent = 'SIMULATED DEMO RECORD';
    } else {
      badge.className = 'verification-badge-pill';
      badgeLabel.textContent = 'VERIFIED INFERENCE (FLASK)';
    }
  }

  if (elCategory) elCategory.textContent = result.category.toUpperCase();
  if (elSub) elSub.textContent = result.sub_category || 'Commercial Specification';
  if (elConf) elConf.textContent = `${Number(result.confidence).toFixed(1)}%`;

  if (elCirc) {
    const isRecyc = Boolean(result.recyclable);
    elCirc.textContent = isRecyc ? 'Recyclable' : 'Non-Recyclable';
    elCirc.style.color = isRecyc ? 'var(--color-sage-dark)' : 'var(--color-orange)';
  }

  if (elDecomp) elDecomp.textContent = result.decomposition || '450 Years';
  if (elCarbon) elCarbon.textContent = result.carbon_saved || '0.18 kg CO2e';

  const streamNames = {
    'Plastic': 'Stream 01 // Polymers',
    'Paper': 'Stream 02 // Pulp & Fibre',
    'Metal': 'Stream 03 // Alloys',
    'Glass': 'Stream 04 // Cullet',
    'Organic': 'Stream 05 // Biomass'
  };
  if (elStream) elStream.textContent = streamNames[result.category] || 'Stream 01';

  // Area 3: Recommendations Data
  const elProto = document.getElementById('resDisposalProtocol');
  const elReuse = document.getElementById('resReuseOptions');
  const elTips = document.getElementById('resRecyclingTips');

  const presetMatch = Object.values(state.presets).find(p => p.category.toLowerCase() === result.category.toLowerCase());
  
  if (elProto) elProto.textContent = result.disposal_steps || presetMatch?.disposalProtocol || 'Rinse container thoroughly and place in designated recycling silo.';
  if (elReuse) elReuse.textContent = presetMatch?.reuseOptions || 'Secondary utilization in industrial re-compounding and durable applications.';
  if (elTips) elTips.textContent = presetMatch?.recyclingTips || 'Ensure material is clean, dry, and not mixed with non-recyclable composite layers.';

  // Specimen-Specific Personalized Circular Roadmap
  const specimenCard = document.getElementById('specimenCircularCard');
  const specimenContent = document.getElementById('specimenCircularContent');
  if (specimenCard && specimenContent) {
    specimenCard.style.display = 'block';
    const cat = result.category || 'General';
    const sub = result.sub_category || '';
    
    let circularIdea = '';
    if (cat === 'Plastic') {
      circularIdea = `<strong>Upstream Circular Target:</strong> Replace single-use ${sub} with deposit-return systems or durable passivated steel. When recycling, detach caps to preserve polymer batch purity for food-grade rPET flakes.`;
    } else if (cat === 'Organic') {
      circularIdea = `<strong>Closed-Loop Biomass Target:</strong> Divert directly to high-temperature aerobic composting or anaerobic biodigesters. Yields high-nitrogen humus soil conditioner, sequestering carbon and eliminating landfill methane.`;
    } else if (cat === 'Paper') {
      circularIdea = `<strong>Fiber Loop Retention:</strong> Ensure zero grease contamination. Clean paper fibers can cycle through up to 7 re-pulping turns before downcycling into insulation or moulded pulp egg cartons.`;
    } else if (cat === 'Metal') {
      circularIdea = `<strong>Infinite Metallurgy Loop:</strong> Aluminum and steel retain 100% of their crystalline matrix across infinite remelt cycles, consuming 95% less energy than virgin bauxite smelting.`;
    } else if (cat === 'Glass') {
      circularIdea = `<strong>Closed-Loop Cullet:</strong> Container glass melts at 30% lower furnace temperature when fed with cullet, directly reducing fuel consumption and grid peak loads.`;
    } else {
      circularIdea = `<strong>Landfill Avoidance Target:</strong> Assess if multi-material composite parts can be disassembled. Route residual unrecyclable fractions to certified waste-to-energy recovery.`;
    }

    specimenContent.innerHTML = `
      <p style="margin-bottom: 0.4rem;">${circularIdea}</p>
      <button class="stage-mini-btn" style="margin-top: 0.35rem; color: var(--color-primary); border-color: var(--color-primary);" onclick="navigateToSection('insights')">
        View Full Personalized Circular Roadmap →
      </button>
    `;
  }
}

// ============================================================================
// Dispatch to Digital Twin Silo
// ============================================================================
async function dispatchToDigitalTwin() {
  if (!state.currentClassification) {
    triggerSystemToast('No active classification to route.', 'error');
    return;
  }

  const category = (state.currentClassification.category || 'plastic').toLowerCase();
  const weight = 15.0; // standard container weight increment (kg)

  try {
    const res = await fetch('/api/digital-twin/inflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, weight_kg: weight })
    });

    if (res.ok) {
      triggerSystemToast(`Routed specimen to ${category.toUpperCase()} Silo (+${weight} kg).`, 'success');
      await syncLiveTelemetry();
    } else {
      throw new Error('API routing failed');
    }
  } catch (err) {
    // Client-side fallback
    if (state.streams[category]) {
      const s = state.streams[category];
      s.weight = Math.min(s.max, s.weight + weight);
      s.fill = Math.round((s.weight / s.max) * 100);
      updateTwinDisplay();
      triggerSystemToast(`[Client] Routed to ${category.toUpperCase()} Silo (+${weight} kg).`, 'info');
    }
  }
}

// ============================================================================
// AI Circular Assistant Query
// ============================================================================
async function handleQuerySubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const input = document.getElementById('aiQueryInputField');
  const box = document.getElementById('aiQueryResponseBox');
  if (!input) return;

  const query = input.value.trim();
  if (!query) return;

  if (box) {
    box.style.display = 'block';
    box.innerHTML = `<span style="color: var(--color-primary); font-weight: 500;">Querying Circular Intelligence Kernel...</span>`;
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query })
    });

    if (res.ok) {
      const data = await res.json();
      if (box) {
        box.innerHTML = `<strong>Circular Intelligence Response:</strong><br>${escapeHtml(data.response)}`;
      }
    } else {
      throw new Error('Chat API error');
    }
  } catch (err) {
    if (box) {
      box.innerHTML = `<strong>Circular Economy Guidance:</strong><br>Ensure items are cleanly rinsed of food residue. Separate mixed materials (such as aluminum tear foils or plastic film seals) before curbside disposal.`;
    }
  }
}

// ============================================================================
// Digital Twin Facility Simulation
// ============================================================================
function initDigitalTwin() {
  const btnToggle = document.getElementById('btnToggleStreamSim');
  const btnFlushAll = document.getElementById('btnFlushAllStreams');

  if (btnToggle) {
    btnToggle.addEventListener('click', toggleConveyorSimulation);
  }

  if (btnFlushAll) {
    btnFlushAll.addEventListener('click', flushAllStreams);
  }

  updateTwinDisplay();
}

function selectFacilityStation(streamKey) {
  state.selectedStreamKey = streamKey;

  document.querySelectorAll('.silo-telemetry-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-stream') === streamKey);
  });

  const stream = state.streams[streamKey];
  if (stream) {
    triggerSystemToast(`Focus: ${stream.name} (${stream.fill}% Fill)`, 'info');
  }
}

async function flushStationSilo(streamKey) {
  try {
    const res = await fetch(`/api/digital-twin/empty/${streamKey}`, { method: 'POST' });
    if (res.ok) {
      if (state.streams[streamKey]) {
        state.streams[streamKey].fill = 0;
        state.streams[streamKey].weight = 0;
      }
      updateTwinDisplay();
      triggerSystemToast(`Flushed ${streamKey.toUpperCase()} Silo (0 kg).`, 'success');
      await syncLiveTelemetry();
      return;
    }
  } catch (err) {
    console.warn('Flush API note:', err);
  }

  if (state.streams[streamKey]) {
    state.streams[streamKey].fill = 0;
    state.streams[streamKey].weight = 0;
    updateTwinDisplay();
    triggerSystemToast(`[Client] Flushed ${streamKey.toUpperCase()} Silo.`, 'info');
  }
}

async function flushAllStreams() {
  const keys = Object.keys(state.streams);
  for (const k of keys) {
    await flushStationSilo(k);
  }
  triggerSystemToast('All facility silo streams flushed.', 'success');
}

function toggleConveyorSimulation() {
  state.isStreamSimulating = !state.isStreamSimulating;
  const label = document.getElementById('labelStreamSim');
  const viewport = document.querySelector('.facility-schematic-viewport');

  if (state.isStreamSimulating) {
    if (label) label.textContent = 'Pause Flow Simulation';
    if (viewport) viewport.classList.add('simulating');
    triggerSystemToast('Conveyor stream simulation active.', 'info');

    state.simInterval = setInterval(() => {
      const keys = Object.keys(state.streams);
      const randKey = keys[Math.floor(Math.random() * keys.length)];
      const stream = state.streams[randKey];

      if (stream.fill < 95) {
        stream.weight = Math.min(stream.max, stream.weight + Math.floor(Math.random() * 8) + 2);
        stream.fill = Math.round((stream.weight / stream.max) * 100);
        updateTwinDisplay();
      }
    }, 3500);
  } else {
    if (label) label.textContent = 'Simulate Material Flow';
    if (viewport) viewport.classList.remove('simulating');
    clearInterval(state.simInterval);
    state.simInterval = null;
    triggerSystemToast('Conveyor stream simulation paused.', 'info');
  }
}

function updateTwinDisplay() {
  // SVG Text Elements
  const mapSvg = {
    plastic: document.getElementById('bpValPlastic'),
    paper: document.getElementById('bpValPaper'),
    metal: document.getElementById('bpValMetal'),
    glass: document.getElementById('bpValGlass'),
    organic: document.getElementById('bpValOrganic')
  };

  Object.keys(mapSvg).forEach(k => {
    const el = mapSvg[k];
    const stream = state.streams[k];
    if (el && stream) {
      el.textContent = `${stream.fill}% • ${stream.weight} kg`;
    }
  });

  // Cards below SVG
  const mapCards = {
    plastic: { pct: 'cardPctPlastic', fill: 'cardFillPlastic', weight: 'cardWeightPlastic' },
    paper: { pct: 'cardPctPaper', fill: 'cardFillPaper', weight: 'cardWeightPaper' },
    metal: { pct: 'cardPctMetal', fill: 'cardFillMetal', weight: 'cardWeightMetal' },
    glass: { pct: 'cardPctGlass', fill: 'cardFillGlass', weight: 'cardWeightGlass' },
    organic: { pct: 'cardPctOrganic', fill: 'cardFillOrganic', weight: 'cardWeightOrganic' }
  };

  Object.keys(mapCards).forEach(k => {
    const stream = state.streams[k];
    const elIds = mapCards[k];
    if (!stream) return;

    const elPct = document.getElementById(elIds.pct);
    const elFill = document.getElementById(elIds.fill);
    const elWeight = document.getElementById(elIds.weight);

    if (elPct) elPct.textContent = `${stream.fill}%`;
    if (elFill) elFill.style.width = `${stream.fill}%`;
    if (elWeight) elWeight.textContent = `${stream.weight} / ${stream.max} kg`;
  });
}

// ============================================================================
// Insights Visualizations (Chart.js)
// ============================================================================
function initInsightsCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
  Chart.defaults.color = '#5C6779';

  // 1. Material Composition Chart
  const donutCtx = document.getElementById('materialCompositionChart');
  if (donutCtx) {
    compositionChartInstance = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Polymers (Plastic)', 'Pulp & Fibre (Paper)', 'Alloys (Metal)', 'Cullet (Glass)', 'Biomass (Organic)'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: ['#3659C9', '#C87952', '#172333', '#9CAF98', '#8893A2'],
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8,
              usePointStyle: true,
              font: { size: 11, weight: '500' },
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#172333',
            titleFont: { size: 12, weight: '600' },
            bodyFont: { size: 11 },
            padding: 8,
            cornerRadius: 2
          }
        }
      }
    });
  }

  // 2. Processing Activity Timeline
  const timeCtx = document.getElementById('processingTimelineChart');
  if (timeCtx) {
    timelineChartInstance = new Chart(timeCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Recovered (kg)',
            data: [42, 65, 50, 88, 76, 102, 94],
            backgroundColor: '#3659C9',
            borderRadius: 2,
            borderSkipped: false
          },
          {
            label: 'Diverted (kg)',
            data: [38, 58, 46, 82, 70, 95, 87],
            backgroundColor: '#FAF2EE',
            borderColor: '#C87952',
            borderWidth: 1.2,
            borderRadius: 2,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: '500' } }
          },
          y: {
            grid: { color: 'rgba(23, 35, 51, 0.05)' },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8,
              usePointStyle: true,
              font: { size: 11, weight: '500' },
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#172333',
            padding: 8,
            cornerRadius: 2
          }
        }
      }
    });
  }
}

function updateInsightsCharts() {
  if (!compositionChartInstance) return;

  // If items have been scanned, update composition dynamically
  const counts = { Plastic: 0, Paper: 0, Metal: 0, Glass: 0, Organic: 0 };
  state.history.forEach(h => {
    if (counts[h.category] !== undefined) {
      counts[h.category]++;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total > 0) {
    compositionChartInstance.data.datasets[0].data = [
      counts.Plastic,
      counts.Paper,
      counts.Metal,
      counts.Glass,
      counts.Organic
    ];
    compositionChartInstance.update();
  }
}

// ============================================================================
// Specimen Field Log Ledger
// ============================================================================
function initHistoryLedger() {
  const searchInput = document.getElementById('ledgerSearchInput');
  const catSelect = document.getElementById('ledgerCategorySelect');
  const btnExport = document.getElementById('btnExportCSV');
  const btnRefresh = document.getElementById('btnRefreshLedger');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderHistoryTable());
  }
  if (catSelect) {
    catSelect.addEventListener('change', () => renderHistoryTable());
  }
  if (btnExport) {
    btnExport.addEventListener('click', () => exportLedgerCSV());
  }
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      fetchLiveHistory();
      triggerSystemToast('Refreshing ledger from database...', 'info');
    });
  }
}

async function fetchLiveHistory() {
  try {
    const res = await fetch('/api/history');
    if (res.ok) {
      const data = await res.json();
      state.history = data.history || [];
      renderHistoryTable();
      updateInsightsCharts();
    }
  } catch (err) {
    console.warn('History API fetch note:', err);
  }
}

function renderHistoryTable() {
  const tbody = document.getElementById('ledgerTableBody');
  if (!tbody) return;

  const query = (document.getElementById('ledgerSearchInput')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('ledgerCategorySelect')?.value || 'all';

  const filtered = state.history.filter(item => {
    const matchQuery = !query ||
      item.filename.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.sub_category && item.sub_category.toLowerCase().includes(query));

    const matchCat = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchQuery && matchCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">
          <div style="font-size: 1.4rem; margin-bottom: 0.5rem; opacity: 0.5;">✦</div>
          <div style="font-weight: 600; color: var(--color-text-primary);">No Specimen Records Logged</div>
          <div style="font-size: 0.8rem; margin-top: 0.2rem;">Drop a specimen into Module 01 (Material Scanner) to generate initial audit record.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const catClass = item.category.toLowerCase();
    const isLive = !item.is_demo;

    return `
      <tr>
        <td>
          <div style="width: 32px; height: 32px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); display: flex; align-items: center; justify-content: center; font-size: 0.95rem;">
            ${getStreamIcon(item.category)}
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--color-text-primary);">${escapeHtml(item.filename)}</div>
          <div style="font-size: 0.74rem; color: var(--color-text-secondary); font-family: var(--font-mono);">${escapeHtml(item.sub_category || 'Industrial Grade')}</div>
        </td>
        <td>
          <span class="stream-pill-tag ${catClass}">
            ${escapeHtml(item.category.toUpperCase())}
          </span>
        </td>
        <td>
          <strong class="font-mono" style="font-size: 0.84rem; color: ${item.confidence > 90 ? 'var(--color-sage-dark)' : 'var(--color-primary)'};">
            ${Number(item.confidence).toFixed(1)}%
          </strong>
        </td>
        <td>
          <span class="verification-badge-pill ${item.is_demo ? 'demo' : ''}" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">
            ${isLive ? 'LIVE' : 'DEMO'}
          </span>
        </td>
        <td class="font-mono" style="font-size: 0.76rem; color: var(--color-text-muted);">
          ${escapeHtml(item.timestamp || 'Today')}
        </td>
        <td style="text-align: right;">
          <button class="btn-secondary-action small" onclick="openSpecimenDetails('${item.id}')">Inspect</button>
          <button class="btn-secondary-action small" style="margin-left: 0.25rem; color: #DC2626;" onclick="deleteSpecimenRecord('${item.id}')">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function getStreamIcon(cat) {
  const icons = {
    'Plastic': '🥤',
    'Paper': '📦',
    'Metal': '🥫',
    'Glass': '🍾',
    'Organic': '🍎'
  };
  return icons[cat] || '✦';
}

function openSpecimenDetails(scanId) {
  const item = state.history.find(h => h.id === scanId);
  if (!item) return;

  const modal = document.getElementById('specimenModal');
  const title = document.getElementById('modalSpecimenTitle');
  const details = document.getElementById('modalSpecimenDetails');

  if (title) title.textContent = `Specimen Inspection: ${item.filename}`;
  if (details) {
    details.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="background: var(--bg-canvas); padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-xs);">
          <span style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Category Stream</span>
          <div style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--color-primary);">${item.category}</div>
          <div style="font-size: 0.76rem; color: var(--color-text-secondary); font-family: var(--font-mono);">${item.sub_category || 'N/A'}</div>
        </div>
        <div style="background: var(--bg-canvas); padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-xs);">
          <span style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Inference Confidence</span>
          <div style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--color-sage-dark);">${Number(item.confidence).toFixed(1)}%</div>
          <div style="font-size: 0.76rem; color: var(--color-text-secondary);">Circularity: ${item.recyclable ? 'Recyclable' : 'Non-Recyclable'}</div>
        </div>
      </div>

      <div style="background: var(--bg-canvas); padding: 0.9rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); margin-bottom: 1.25rem;">
        <span style="font-size: 0.72rem; font-weight: 600; color: var(--color-text-primary); display: block; margin-bottom: 0.25rem;">Disposal & Processing Protocol:</span>
        <p style="font-size: 0.82rem; line-height: 1.5; color: var(--color-text-secondary); margin: 0;">${item.disposal_steps || 'Standard municipal diversion.'}</p>
      </div>

      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted);">
        <span>RECORD-UID: ${item.id}</span>
        <span>OFFSET: ${item.carbon_saved || '0.18 kg CO2e'}</span>
      </div>
    `;
  }

  if (modal) modal.classList.add('open');
}

function closeSpecimenModal() {
  const modal = document.getElementById('specimenModal');
  if (modal) modal.classList.remove('open');
}

async function deleteSpecimenRecord(scanId) {
  try {
    const res = await fetch(`/api/history/${scanId}`, { method: 'DELETE' });
    if (res.ok) {
      state.history = state.history.filter(h => h.id !== scanId);
      renderHistoryTable();
      await syncLiveTelemetry();
      triggerSystemToast('Record removed from ledger.', 'info');
    }
  } catch (err) {
    console.warn('Delete error:', err);
  }
}

function exportLedgerCSV() {
  if (state.history.length === 0) {
    triggerSystemToast('Ledger is empty. No records to export.', 'error');
    return;
  }

  const headers = ['UID', 'Filename', 'Category', 'SubCategory', 'Confidence', 'Recyclable', 'Decomposition', 'CarbonOffset', 'Timestamp', 'IsDemo'];
  const rows = state.history.map(item => [
    `"${item.id}"`,
    `"${item.filename}"`,
    `"${item.category}"`,
    `"${item.sub_category || ''}"`,
    item.confidence,
    item.recyclable ? 'TRUE' : 'FALSE',
    `"${item.decomposition || ''}"`,
    `"${item.carbon_saved || ''}"`,
    `"${item.timestamp || ''}"`,
    item.is_demo ? 'TRUE' : 'FALSE'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ecovision_specimen_ledger_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  triggerSystemToast('Specimen ledger exported to CSV.', 'success');
}

// ============================================================================
// Toast Notification Utility
// ============================================================================
function triggerSystemToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `system-toast-card ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : '✦';
  toast.innerHTML = `
    <span style="font-weight: 700; color: ${type === 'success' ? 'var(--color-sage)' : type === 'error' ? 'var(--color-orange)' : 'var(--color-primary)'};">${icon}</span>
    <span style="flex: 1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// Generative AI Circular Economy & Recycling Advisor
// ============================================================================
async function loadPersonalizedRecommendations(forceRefresh = false) {
  const loadingEl = document.getElementById('aiAdvisorLoading');
  const bodyEl = document.getElementById('aiAdvisorBody');
  const btnSpinner = document.getElementById('btnRecsSpinner');
  const btnLabel = document.getElementById('btnRecsLabel');

  if (loadingEl && forceRefresh) loadingEl.style.display = 'flex';
  if (bodyEl && forceRefresh) bodyEl.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'inline-block';
  if (btnLabel) btnLabel.textContent = 'Synthesizing...';

  try {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.recommendations = data;
    renderPersonalizedRecommendations(data);
  } catch (err) {
    console.warn('Failed to load personalized AI recommendations:', err);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    if (bodyEl) bodyEl.style.display = 'grid';
    if (btnSpinner) btnSpinner.style.display = 'none';
    if (btnLabel) btnLabel.textContent = 'Refresh AI Roadmap';
  }
}

function renderPersonalizedRecommendations(data) {
  if (!data) return;

  // 1. Score & Headline
  const scoreEl = document.getElementById('aiCircularityScore');
  const tierBadge = document.getElementById('aiScoreTierBadge');
  const headlineEl = document.getElementById('aiAssessmentHeadline');
  const summaryEl = document.getElementById('aiProfileSummary');

  const score = Number(data.circularity_score) || 70;
  if (scoreEl) {
    animateScoreCounter(scoreEl, 0, score, 700);
  }

  if (tierBadge) {
    if (score >= 80) {
      tierBadge.textContent = 'CIRCULAR PIONEER';
      tierBadge.className = 'score-tier-badge font-mono tier-high';
    } else if (score >= 65) {
      tierBadge.textContent = 'RESOURCE ADVOCATE';
      tierBadge.className = 'score-tier-badge font-mono tier-medium';
    } else {
      tierBadge.textContent = 'REDUCTION OPPORTUNITY';
      tierBadge.className = 'score-tier-badge font-mono tier-low';
    }
  }

  if (headlineEl) headlineEl.textContent = data.headline || 'Circular Economy Strategic Assessment';
  if (summaryEl) summaryEl.textContent = data.profile_summary || 'Analysis of your empirical material streams indicates strong closed-loop opportunities.';

  // 2. Primary Actions Stack
  const actionsContainer = document.getElementById('aiActionsCardsContainer');
  if (actionsContainer) {
    actionsContainer.innerHTML = '';
    const actions = data.primary_actions || [];
    actions.forEach(action => {
      const card = document.createElement('div');
      card.className = 'action-recommendation-card';
      const impactClass = (action.impact || 'medium').toLowerCase();
      card.innerHTML = `
        <div class="action-card-header">
          <h5 class="action-card-title">${escapeHtml(action.title || 'Circular Initiative')}</h5>
          <div class="action-meta-tags">
            <span class="impact-badge ${impactClass}">${escapeHtml(action.impact || 'Medium')} Impact</span>
            <span class="savings-pill">${escapeHtml(action.co2_savings_potential || 'Carbon Savings')}</span>
          </div>
        </div>
        <p class="action-body-text">${escapeHtml(action.recommendation || '')}</p>
        <span class="strategy-foot-tag font-mono">Strategy: ${escapeHtml(action.circular_strategy || 'Closed-Loop Optimization')} · Target: ${escapeHtml(action.target_material || 'Stream')}</span>
      `;
      actionsContainer.appendChild(card);
    });
  }

  // 3. Material Swaps Grid
  const swapsContainer = document.getElementById('aiSwapsContainer');
  if (swapsContainer) {
    swapsContainer.innerHTML = '';
    const swaps = data.material_swaps || [];
    swaps.forEach(swap => {
      const card = document.createElement('div');
      card.className = 'swap-comparison-card';
      card.innerHTML = `
        <div class="swap-flow-row">
          <span class="swap-from-item">${escapeHtml(swap.current_item || 'Current Product')}</span>
          <span class="swap-arrow-glyph">→</span>
          <span class="swap-to-item">${escapeHtml(swap.circular_alternative || 'Circular Alternative')}</span>
        </div>
        <p class="swap-benefit-text">${escapeHtml(swap.lifecycle_benefit || '')}</p>
      `;
      swapsContainer.appendChild(card);
    });
  }

  // 4. Contamination Prevention List
  const contamList = document.getElementById('aiContaminationList');
  if (contamList) {
    contamList.innerHTML = '';
    const rules = data.contamination_prevention || [];
    rules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule;
      contamList.appendChild(li);
    });
  }

  // 5. Milestones Checklist
  const milestonesList = document.getElementById('aiMilestonesList');
  if (milestonesList) {
    milestonesList.innerHTML = '';
    const goals = data.milestone_goals || [];
    goals.forEach((goal, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" class="milestone-check" id="milestoneCheck_${i}">
        <label for="milestoneCheck_${i}" style="cursor: pointer;">${escapeHtml(goal)}</label>
      `;
      milestonesList.appendChild(li);
    });
  }
}

function animateScoreCounter(element, start, end, duration) {
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    element.textContent = current;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end;
    }
  };
  window.requestAnimationFrame(step);
}

