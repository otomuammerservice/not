/**
 * Oto Tamir Servisi Takip Otomasyonu - Frontend Logic
 * Framework içermeyen saf Vanilla JavaScript
 */

// Uygulama Durumu (State)
const state = {
  customers: [],
  vehicles: [],
  serviceRecords: [],
  theme: 'light',
  apiUrl: ''
};

// Grafik Örnekleri (Chart.js)
let monthlyChart = null;
let paymentChart = null;

// Usta Tipleri Tanımı
const TECHNICIANS = [
  { id: 'tamirci', label: 'Tamirci İşçiliği', feeKey: 'mechanicFee', noteKey: 'mechanicNote', title: 'Tamirci İşlemleri' },
  { id: 'elektrikci', label: 'Elektrikçi', feeKey: 'electricianFee', noteKey: 'electricianNote', title: 'Elektrikçi İşlemleri' },
  { id: 'boyaci', label: 'Boyacı', feeKey: 'boyaciFee', noteKey: 'boyaciNote', title: 'Boyacı İşlemleri' },
  { id: 'cikmaci', label: 'Çıkma Parçacı', feeKey: 'cikmaciFee', noteKey: 'cikmaciNote', title: 'Çıkma Parçacı İşlemleri' },
  { id: 'egzozcu', label: 'Egzozcu', feeKey: 'egzozcuFee', noteKey: 'egzozcuNote', title: 'Egzozcu İşlemleri' },
  { id: 'frenci', label: 'Frenci', feeKey: 'frenciFee', noteKey: 'frenciNote', title: 'Frenci İşlemleri' },
  { id: 'kapakci', label: 'Kapakçı', feeKey: 'kapakciFee', noteKey: 'kapakciNote', title: 'Kapakçı İşlemleri' },
  { id: 'kaportaci', label: 'Kaportacı', feeKey: 'kaportaciFee', noteKey: 'kaportaciNote', title: 'Kaportacı İşlemleri' },
  { id: 'kurtarici', label: 'Kurtarıcı', feeKey: 'kurtariciFee', noteKey: 'kurtariciNote', title: 'Kurtarıcı İşlemleri' },
  { id: 'parcaci', label: 'Parçacı', feeKey: 'parcaciFee', noteKey: 'parcaciNote', title: 'Parçacı İşlemleri' },
  { id: 'pompaci', label: 'Pompacı', feeKey: 'pompaciFee', noteKey: 'pompaciNote', title: 'Pompacı İşlemleri' },
  { id: 'tornaci', label: 'Tornacı', feeKey: 'tornaciFee', noteKey: 'tornaciNote', title: 'Tornacı İşlemleri' },
  { id: 'turbocu', label: 'Turbocu', feeKey: 'turbocuFee', noteKey: 'turbocuNote', title: 'Turbocu İşlemleri' },
  { id: 'tupcu', label: 'Tüpçü', feeKey: 'tupcuFee', noteKey: 'tupcuNote', title: 'Tüpçü İşlemleri' },
  { id: 'yagci', label: 'Yağcı', feeKey: 'yagciFee', noteKey: 'yagciNote', title: 'Yağcı İşlemleri' },
  { id: 'yikamaci', label: 'Yıkamacı', feeKey: 'yikamaciFee', noteKey: 'yikamaciNote', title: 'Yıkamacı İşlemleri' }
];

// ==========================================================================
// UYGULAMA BAŞLANGICI (INIT)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Temayı yükle
  initTheme();
  
  // API URL'sini yükle (Kullanıcının canlı URL'si varsayılan olarak atandı)
  state.apiUrl = localStorage.getItem("oto_takip_api_url") || "https://script.google.com/macros/s/AKfycbwRJAuGjX9V-Q01rVuaNtRMxJqZDgGo3lF7n1Tet3o1vgZa_pi8lm_x_n4GHX5tSTUw/exec";
  updateApiStatusIndicator();

  // Tarihi üst bara yazdır
  updateCurrentDateDisplay();

  // Dinamik Usta Alanlarını Oluştur
  renderMechanicCheckboxes();
  initMechanicBoxes();

  // Verileri yükle
  fetchData();

  // Kısayol Tuş Dinleyicisi (/)
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== document.getElementById("globalSearch")) {
      e.preventDefault();
      const sInput = document.getElementById("globalSearch");
      sInput.focus();
      sInput.select();
    }
    if (e.key === "Escape") {
      closeSearchResults();
      closeSettingsModal();
    }
  });

  // Arama dışına tıklanınca sonuçları kapat
  document.addEventListener("click", (e) => {
    const searchContainer = document.querySelector(".search-container");
    if (!searchContainer.contains(e.target)) {
      closeSearchResults();
    }
  });

  // Varsayılan olarak bugünün tarihini formlara ata
  document.getElementById("v_entryDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("s_date").value = new Date().toISOString().split("T")[0];
});

// Üst bar tarih yazısı
function updateCurrentDateDisplay() {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  const today = new Date();
  document.getElementById("currentDateText").textContent = today.toLocaleDateString("tr-TR", options);
}

// ==========================================================================
// MOCK DATA (YEDEK / TEST VERİLERİ)
// ==========================================================================
function getMockData() {
  const mockCustomers = [
    { id: 'CST-B981C2', firstName: 'Ahmet', lastName: 'Yılmaz', phone: '05321112233', reference: 'Mehmet Usta', notes: 'Sürekli müşterimizdir. İşçilikte titizdir.' },
    { id: 'CST-A721D5', firstName: 'Mustafa', lastName: 'Kaya', phone: '05442223344', reference: 'İnternet Reklamı', notes: 'Ödemede biraz pazarlık yapmayı sever.' },
    { id: 'CST-E449A8', firstName: 'Ayşe', lastName: 'Demir', phone: '05053334455', reference: 'Referansı Yok', notes: 'Firma adına kayıtlı araçlar getiriyor.' }
  ];

  const mockVehicles = [
    { id: 'VHC-092E11', customerId: 'CST-B981C2', brand: 'Volkswagen', model: 'Golf 1.6 TDI', plate: '34ABC123', year: '2017', chassisNo: 'WVWZZZAUZHP112233', entryDate: '2026-06-10', notes: 'Periyodik bakım ve triger seti.' },
    { id: 'VHC-773C99', customerId: 'CST-B981C2', brand: 'Audi', model: 'A4 2.0 TDI', plate: '34XYZ789', year: '2019', chassisNo: 'WAUZZZ8W1K1998877', entryDate: '2026-06-20', notes: 'Fren diski ve balata yenileme.' },
    { id: 'VHC-551F02', customerId: 'CST-A721D5', brand: 'Ford', model: 'Focus 1.5 TDCi', plate: '06DEF456', year: '2015', chassisNo: 'WF0FXXWPB11443322', entryDate: '2026-06-22', notes: 'Klima üflemiyor, kompresör kontrol.' },
    { id: 'VHC-881A44', customerId: 'CST-E449A8', brand: 'Renault', model: 'Clio 1.5 dCi', plate: '35GHI901', year: '2020', chassisNo: 'VF1RJA00561122334', entryDate: '2026-06-25', notes: 'Yağ kaçağı tespiti yapılacak.' }
  ];

  const mockServices = [
    { id: 'SRV-001', vehicleId: 'VHC-092E11', entryKm: 120500, recordDate: '2026-05-12', mechanicFee: 3500, mechanicNote: '120 bin bakımı yapıldı. Yağ filtreleri değişti.', electricianFee: 500, electricianNote: 'Arıza tespit cihazı ile hata kodları temizlendi.', generalSummary: 'Yağ bakımı ve filtre değişimi yapıldı.', paymentStatus: 'Ödendi', totalAmount: 4000 },
    { id: 'SRV-002', vehicleId: 'VHC-773C99', entryKm: 85200, recordDate: '2026-06-20', mechanicFee: 4500, mechanicNote: 'Ön-arka diskler ve balatalar Brembo marka takıldı.', electricianFee: 0, electricianNote: '', generalSummary: 'Komple fren sistemi yenilendi.', paymentStatus: 'Ödenmedi', totalAmount: 4500 },
    { id: 'SRV-003', vehicleId: 'VHC-551F02', entryKm: 180000, recordDate: '2026-06-23', mechanicFee: 5000, mechanicNote: 'Klima kompresörü değiştirildi, gaz dolumu yapıldı.', electricianFee: 1500, electricianNote: 'Klima kontrol röleleri ve fan sigortası yenilendi.', generalSummary: 'Klima komple elden geçirildi, gaz basıldı.', paymentStatus: 'Kısmi Ödendi', totalAmount: 6500 },
    { id: 'SRV-004', vehicleId: 'VHC-881A44', entryKm: 42100, recordDate: '2026-06-25', mechanicFee: 1500, mechanicNote: 'Karter contası yenilendi, yağ kaçağı temizlendi.', electricianFee: 0, electricianNote: '', generalSummary: 'Karter contası değişimi ve motor yıkama.', paymentStatus: 'Ödenmedi', totalAmount: 1500 }
  ];

  return { customers: mockCustomers, vehicles: mockVehicles, serviceRecords: mockServices };
}

// ==========================================================================
// VERİ ÇEKME & GÖNDERME (FETCH & SYNC)
// ==========================================================================
async function fetchData() {
  showLoadingState();
  
  if (!state.apiUrl) {
    // API URL tanımlı değilse Local Storage veya Mock Data kullan
    console.log("API URL tanımlanmadığı için Local Storage kullanılıyor.");
    
    let localData = localStorage.getItem("oto_takip_local_db");
    if (!localData) {
      const mock = getMockData();
      localStorage.setItem("oto_takip_local_db", JSON.stringify(mock));
      localData = JSON.stringify(mock);
    }
    
    const parsed = JSON.parse(localData);
    state.customers = parsed.customers || [];
    state.vehicles = parsed.vehicles || [];
    state.serviceRecords = parsed.serviceRecords || [];
    
    updateApiStatusIndicator("local");
    renderAll();
    return;
  }

  try {
    const response = await fetch(state.apiUrl);
    const result = await response.json();
    
    if (result.success) {
      state.customers = result.customers || [];
      state.vehicles = result.vehicles || [];
      state.serviceRecords = result.serviceRecords || [];
      
      // Local cache'i de güncelle
      const localObj = { customers: state.customers, vehicles: state.vehicles, serviceRecords: state.serviceRecords };
      localStorage.setItem("oto_takip_local_db", JSON.stringify(localObj));
      
      updateApiStatusIndicator("connected");
      renderAll();
    } else {
      throw new Error(result.error || "Sunucudan hata döndü.");
    }
  } catch (error) {
    console.error("Veriler çekilirken hata oluştu, son yerel kayıtlar yükleniyor:", error);
    // Hata durumunda Local Storage cache'ine dön
    let localData = localStorage.getItem("oto_takip_local_db");
    if (localData) {
      const parsed = JSON.parse(localData);
      state.customers = parsed.customers || [];
      state.vehicles = parsed.vehicles || [];
      state.serviceRecords = parsed.serviceRecords || [];
    }
    alert("Google Sheets bağlantısı başarısız oldu. Son yerel veriler yükleniyor. Hata: " + error.message);
    updateApiStatusIndicator("local");
    renderAll();
  }
}

async function sendRequest(action, payload) {
  showLoadingState();

  if (!state.apiUrl) {
    // Local Modda Çalışırken Kaydetme İşlemi
    let localData = localStorage.getItem("oto_takip_local_db");
    const db = localData ? JSON.parse(localData) : getMockData();
    
    let newRecord = { ...payload };
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdAt = new Date().toISOString();
    
    if (action === 'addCustomer') {
      newRecord.id = 'CST-' + randomId;
      newRecord.createdAt = createdAt;
      db.customers.push(newRecord);
    } else if (action === 'addVehicle') {
      newRecord.id = 'VHC-' + randomId;
      newRecord.createdAt = createdAt;
      db.vehicles.push(newRecord);
    } else if (action === 'addServiceRecord') {
      newRecord.id = 'SRV-' + randomId;
      newRecord.createdAt = createdAt;
      db.serviceRecords.push(newRecord);
    } else if (action === 'updateServiceRecord') {
      const idx = db.serviceRecords.findIndex(r => r.id === payload.id);
      if (idx !== -1) {
        db.serviceRecords[idx] = { ...db.serviceRecords[idx], ...payload };
      } else {
        alert("Güncellenecek kayıt bulunamadı!");
        return false;
      }
    }
    
    localStorage.setItem("oto_takip_local_db", JSON.stringify(db));
    // Eyaleti güncelle
    state.customers = db.customers;
    state.vehicles = db.vehicles;
    state.serviceRecords = db.serviceRecords;
    
    renderAll();
    return true;
  }

  // Google Sheets API ile POST
  try {
    const response = await fetch(state.apiUrl, {
      method: "POST",
      mode: "no-cors", // Google App Script CORS kısıtlamalarını aşmak için no-cors kullanılabilir
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action, payload })
    });
    
    // NOT: no-cors modunda cevap tipi opaque olacağından response.json() okunamayabilir.
    // Bu yüzden isteği gönderdikten sonra verileri yeniden GET ile tazelemek en sağlıklı yaklaşımdır.
    setTimeout(async () => {
      await fetchData();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error("İşlem gönderilemedi:", error);
    alert("Sunucuya veri gönderilirken hata oluştu: " + error.message);
    return false;
  }
}

// API Durum Göstergesini Güncelle
function updateApiStatusIndicator(status) {
  const dot = document.getElementById("apiStatusDot");
  const text = document.getElementById("apiStatusText");
  const badge = document.getElementById("apiStatusBadge");
  
  if (!state.apiUrl) {
    dot.className = "status-dot local";
    text.textContent = "Local Mock Data Aktif";
    badge.title = "Ayarlardan Google Sheets API URL tanımlayın.";
    return;
  }

  if (status === "connected") {
    dot.className = "status-dot connected";
    text.textContent = "Sheets API Bağlandı";
    badge.title = "Google Sheets ile gerçek zamanlı senkronize.";
  } else if (status === "local") {
    dot.className = "status-dot local";
    text.textContent = "Çevrimdışı / Hata";
    badge.title = "Sheets API bağlantısı kurulamadı, önbellek kullanılıyor.";
  }
}

function showLoadingState() {
  document.getElementById("apiStatusText").textContent = "Senkronize ediliyor...";
  document.getElementById("apiStatusDot").className = "status-dot";
}

// ==========================================================================
// TEMA & MENÜ YÖNETİMİ
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("oto_takip_theme") || "light";
  setTheme(savedTheme);
}

function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  state.theme = themeName;
  localStorage.setItem("oto_takip_theme", themeName);
  
  const sunIcon = document.getElementById("themeIconSun");
  const moonIcon = document.getElementById("themeIconMoon");
  const themeText = document.getElementById("themeToggleText");
  
  if (themeName === "dark") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
    themeText.textContent = "Açık Tema";
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
    themeText.textContent = "Koyu Tema";
  }
}

function toggleTheme() {
  const newTheme = state.theme === "light" ? "dark" : "light";
  setTheme(newTheme);
  // Grafikleri yeni renklere göre yeniden çiz
  renderCharts();
}

function switchView(viewName) {
  // Tüm sayfaları gizle
  document.querySelectorAll(".page-view").forEach(view => {
    view.classList.add("hidden");
  });
  
  // İlgili sayfayı aç
  const activeView = document.getElementById(`view-${viewName}`);
  if (activeView) activeView.classList.remove("hidden");
  
  // Sol menüde aktif sınıfını güncelle
  document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
    item.classList.remove("active");
  });
  
  const activeMenuItem = document.getElementById(`menu-${viewName}`);
  if (activeMenuItem) activeMenuItem.classList.add("active");

  // Mobil Sidebar'ı kapat
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Mobil overlay arkasına tıklanınca kapat
document.getElementById("sidebarOverlay").addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
});

// ==========================================================================
// RENDER FONKSİYONLARI (ARAYÜZ YENİLEME)
// ==========================================================================
function renderAll() {
  renderDashboard();
  renderCustomers();
  renderServices();
}

// --- 1. DASHBOARD PANELİ RENDER ---
function renderDashboard() {
  // Metrikleri Hesapla
  const totalCustomers = state.customers.length;
  const totalVehicles = state.vehicles.length;
  
  let totalDebt = 0;
  let totalRevenue = 0;
  
  state.serviceRecords.forEach(rec => {
    const total = parseFloat(rec.totalAmount) || 0;
    const status = rec.paymentStatus;
    
    if (status === "Ödendi") {
      totalRevenue += total;
    } else if (status === "Ödenmedi") {
      totalDebt += total;
    } else if (status === "Kısmi Ödendi") {
      // Kısmi ödemede yarısını tahsil edilmiş yarısını borç sayalım
      totalRevenue += total * 0.5;
      totalDebt += total * 0.5;
    }
  });

  // Metrikleri ekrana yaz
  document.getElementById("metric-total-customers").textContent = totalCustomers;
  document.getElementById("metric-total-vehicles").textContent = totalVehicles;
  document.getElementById("metric-total-debt").textContent = totalDebt.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
  document.getElementById("metric-total-revenue").textContent = totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";

  // Grafik çizimleri
  renderCharts();

  // Borçlu Araçlar Bento Paneli
  const debtorListContainer = document.getElementById("debtorVehiclesList");
  debtorListContainer.innerHTML = "";
  
  // Ödenmedi veya Kısmi Ödendi olan kayıtları filtrele
  const debtorRecords = state.serviceRecords.filter(rec => rec.paymentStatus === "Ödenmedi" || rec.paymentStatus === "Kısmi Ödendi");
  
  if (debtorRecords.length === 0) {
    debtorListContainer.innerHTML = `<div class="bento-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">Borçlu araç bulunmamaktadır. Tebrikler!</div>`;
    return;
  }

  debtorRecords.forEach(rec => {
    // İlgili aracı ve müşteriyi bul
    const vehicle = state.vehicles.find(v => v.id === rec.vehicleId);
    if (!vehicle) return;
    
    const customer = state.customers.find(c => c.id === vehicle.customerId);
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : "Bilinmeyen Müşteri";
    
    // Kısmi ödeme durumunda gösterilecek borç miktarını ayarla
    const debtAmount = rec.paymentStatus === "Kısmi Ödendi" ? (parseFloat(rec.totalAmount) * 0.5) : parseFloat(rec.totalAmount);

    const card = document.createElement("div");
    card.className = "debtor-card";
    card.innerHTML = `
      <div class="debtor-header">
        <div class="debtor-customer">${customerName}</div>
        <div class="debtor-plate">${vehicle.plate}</div>
      </div>
      <div class="debtor-vehicle">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        ${vehicle.brand} ${vehicle.model}
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        İşlem Tarihi: ${formatDate(rec.recordDate)}
      </div>
      <div class="debtor-footer">
        <div>
          <div class="debtor-amount-label">Borç Tutarı</div>
          <div class="debtor-amount-val">${debtAmount.toLocaleString("tr-TR")} ₺</div>
        </div>
        <button class="btn btn-secondary btn-mini" onclick="editServiceRecord('${rec.id}')" title="İşlemi Düzenle / Tahsil Et">
          Detay/Düzenle
        </button>
      </div>
    `;
    debtorListContainer.appendChild(card);
  });
}

// --- 2. GRAFİKLER RENDER (CHART.JS) ---
function renderCharts() {
  const isDark = state.theme === "dark";
  const gridColor = isDark ? "#30363d" : "#d0d7de";
  const textColor = isDark ? "#8b949e" : "#57606a";
  
  // 2.1. AYLIK GELİR GRAFİĞİ (Bar/Line Chart)
  const monthlyCanvas = document.getElementById("monthlyEarningsChart");
  if (!monthlyCanvas) return;

  // Son 6 ayın verilerini grupla
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const currentMonthIdx = new Date().getMonth();
  
  // Son 6 ayı hesapla
  const last6Months = [];
  const totalVolumeData = [0, 0, 0, 0, 0, 0];
  const collectedData = [0, 0, 0, 0, 0, 0];

  for (let i = 5; i >= 0; i--) {
    let m = currentMonthIdx - i;
    if (m < 0) m += 12;
    last6Months.push(months[m]);
  }

  // Servis kayıtlarını son 6 aya göre dağıt
  state.serviceRecords.forEach(rec => {
    const date = new Date(rec.recordDate);
    const recMonth = date.getMonth();
    const total = parseFloat(rec.totalAmount) || 0;
    
    // Bu ay son 6 ayın içinde mi?
    const monthPos = last6Months.indexOf(months[recMonth]);
    if (monthPos !== -1) {
      totalVolumeData[monthPos] += total;
      
      if (rec.paymentStatus === "Ödendi") {
        collectedData[monthPos] += total;
      } else if (rec.paymentStatus === "Kısmi Ödendi") {
        collectedData[monthPos] += total * 0.5; // Yarısı ödenmiş sayılıyor
      }
    }
  });

  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(monthlyCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: last6Months,
      datasets: [
        {
          label: "Toplam İş Hacmi",
          data: totalVolumeData,
          backgroundColor: isDark ? "#388bfd88" : "#0969da88",
          borderColor: isDark ? "#58a6ff" : "#0969da",
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: "Tahsil Edilen",
          data: collectedData,
          backgroundColor: isDark ? "#2ea04388" : "#1a7f3788",
          borderColor: isDark ? "#3fb950" : "#1a7f37",
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      },
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    }
  });

  // 2.2. TAHSİLAT DAĞILIM GRAFİĞİ (Doughnut)
  const paymentCanvas = document.getElementById("paymentStatusChart");
  if (!paymentCanvas) return;

  let paidSum = 0;
  let unpaidSum = 0;
  let partialSum = 0;

  state.serviceRecords.forEach(rec => {
    const total = parseFloat(rec.totalAmount) || 0;
    if (rec.paymentStatus === "Ödendi") paidSum += total;
    else if (rec.paymentStatus === "Ödenmedi") unpaidSum += total;
    else if (rec.paymentStatus === "Kısmi Ödendi") partialSum += total;
  });

  if (paymentChart) paymentChart.destroy();
  paymentChart = new Chart(paymentCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Ödenen", "Ödenmeyen", "Kısmi Ödenen"],
      datasets: [{
        data: [paidSum, unpaidSum, partialSum],
        backgroundColor: [
          isDark ? "#2ea043aa" : "#1a7f37aa",
          isDark ? "#da3633aa" : "#cf222eaa",
          isDark ? "#bb8009aa" : "#9a6700aa"
        ],
        borderColor: [
          isDark ? "#3fb950" : "#1a7f37",
          isDark ? "#f85149" : "#cf222e",
          isDark ? "#d29922" : "#9a6700"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: textColor }
        }
      }
    }
  });
}

// --- 3. MÜŞTERİ & ARAÇ LİSTESİ RENDER ---
function renderCustomers() {
  const container = document.getElementById("customersContainer");
  container.innerHTML = "";
  
  // Dropdown listelerini temizle ve doldur
  const vCustomerSelect = document.getElementById("v_customerId");
  vCustomerSelect.innerHTML = `<option value="">-- Müşteri Seçin --</option>`;
  
  if (state.customers.length === 0) {
    container.innerHTML = `<div class="search-no-results">Sistemde kayıtlı müşteri bulunmuyor. Sol taraftan ekleyin.</div>`;
    return;
  }

  // Müşterileri isim sırasına göre diz
  const sortedCustomers = [...state.customers].sort((a, b) => 
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );

  sortedCustomers.forEach(customer => {
    // Müşterinin araçlarını bul
    const customerVehicles = state.vehicles.filter(v => v.customerId === customer.id);
    
    // Müşteri seç dropdown'ını doldur
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = `${customer.firstName} ${customer.lastName} (${customer.phone})`;
    vCustomerSelect.appendChild(option);

    // Müşteri Kartı Oluştur
    const item = document.createElement("div");
    item.className = "customer-item";
    item.id = `customer-card-${customer.id}`;
    
    let vehiclesHtml = "";
    if (customerVehicles.length === 0) {
      vehiclesHtml = `<div style="font-size: 12px; color: var(--text-muted); text-align: center;">Müşteriye ait araç kaydı yok.</div>`;
    } else {
      customerVehicles.forEach(veh => {
        vehiclesHtml += `
          <div class="customer-vehicle-row" onclick="event.stopPropagation();">
            <span class="customer-vehicle-info"><strong>${veh.brand}</strong> ${veh.model}</span>
            <div class="customer-vehicle-actions">
              <span class="customer-vehicle-plate">${veh.plate}</span>
              <button class="btn btn-secondary btn-mini" onclick="quickCreateServiceRecord('${veh.id}')">
                İşlem Yap
              </button>
            </div>
          </div>
        `;
      });
    }

    item.innerHTML = `
      <div class="customer-item-header" onclick="toggleCustomerExpand('${customer.id}')">
        <div>
          <span class="customer-name">
            ${customer.firstName} ${customer.lastName}
            ${customer.reference ? `<span class="customer-reference-badge">Ref: ${customer.reference}</span>` : ''}
          </span>
          <span class="customer-meta">Tel: ${customer.phone}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; color: var(--text-muted);">${customerVehicles.length} Araç</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-arrow" style="transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="customer-vehicles-container">
        ${customer.notes ? `<div style="font-size: 12px; color: var(--text-secondary); background: var(--bg-subtle); padding: 8px; border-radius: 4px; border-left: 3px solid var(--accent); margin-bottom: 8px;"><strong>Not:</strong> ${customer.notes}</div>` : ''}
        ${vehiclesHtml}
      </div>
    `;
    
    container.appendChild(item);
  });
}

function toggleCustomerExpand(customerId) {
  const card = document.getElementById(`customer-card-${customerId}`);
  if (!card) return;
  
  const isExpanded = card.classList.contains("expanded");
  
  // Tümünü kapat (isteğe bağlı, sade bir deneyim için sadece tıklananı aç-kapat yapıyoruz)
  // document.querySelectorAll('.customer-item').forEach(c => c.classList.remove('expanded'));
  
  if (!isExpanded) {
    card.classList.add("expanded");
    card.querySelector(".expand-arrow").style.transform = "rotate(180deg)";
  } else {
    card.classList.remove("expanded");
    card.querySelector(".expand-arrow").style.transform = "rotate(0deg)";
  }
}

// Müşteri listesi içi filtreleme
function filterCustomerList() {
  const query = document.getElementById("customerListSearch").value.toLowerCase();
  document.querySelectorAll(".customer-item").forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(query)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

// --- 4. SERVİS NOTLARI GÜNLÜĞÜ RENDER ---
function renderServices() {
  const container = document.getElementById("servicesLogContainer");
  container.innerHTML = "";

  // Servis Sayfasındaki Araç Seçim Dropdown'ını doldur
  const sVehicleSelect = document.getElementById("s_vehicleId");
  sVehicleSelect.innerHTML = `<option value="">-- Araç Seçin (Plaka ile) --</option>`;
  
  state.vehicles.forEach(veh => {
    const customer = state.customers.find(c => c.id === veh.customerId);
    const ownerName = customer ? `${customer.firstName} ${customer.lastName}` : "Bilinmeyen";
    
    const option = document.createElement("option");
    option.value = veh.id;
    option.textContent = `${veh.plate} - ${veh.brand} ${veh.model} (${ownerName})`;
    sVehicleSelect.appendChild(option);
  });

  if (state.serviceRecords.length === 0) {
    container.innerHTML = `<div class="search-no-results">Geçmiş servis işlemi bulunmuyor.</div>`;
    return;
  }

  // Servisleri tarihe göre yeniden eskiye diz
  const sortedServices = [...state.serviceRecords].sort((a, b) => 
    new Date(b.recordDate) - new Date(a.recordDate)
  );

  sortedServices.forEach(rec => {
    const vehicle = state.vehicles.find(v => v.id === rec.vehicleId);
    if (!vehicle) return;
    
    const customer = state.customers.find(c => c.id === vehicle.customerId);
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : "Bilinmeyen Müşteri";

    // Ödeme durumuna göre rozet ayarla
    let badgeClass = "badge-unpaid";
    if (rec.paymentStatus === "Ödendi") badgeClass = "badge-paid";
    else if (rec.paymentStatus === "Kısmi Ödendi") badgeClass = "badge-partial";

    // Usta detaylarını hazırla
    let techDetailHtml = "";
    TECHNICIANS.forEach(tech => {
      const fee = parseFloat(rec[tech.feeKey]) || 0;
      const note = rec[tech.noteKey];
      if (fee > 0 || note) {
        techDetailHtml += `
          <div class="sub-op-row">
            <span class="sub-op-name">${tech.label}:</span>
            <span>${fee.toLocaleString("tr-TR")} ₺</span>
          </div>
          ${note ? `<div class="sub-op-note">${note}</div>` : ""}
        `;
      }
    });

    const card = document.createElement("div");
    card.className = "service-log-card";
    card.id = `service-log-card-${rec.id}`;
    card.innerHTML = `
      <div class="service-log-header">
        <div>
          <span class="service-log-title">${customerName}</span>
          <span style="font-size:12px; margin-left:8px; color:var(--text-secondary);">${vehicle.brand} ${vehicle.model} - <strong>${vehicle.plate}</strong></span>
        </div>
        <span class="badge ${badgeClass}">${rec.paymentStatus}</span>
      </div>
      <div class="service-log-meta">
        <span>Tarih: <strong>${formatDate(rec.recordDate)}</strong></span>
        <span>KM: <strong>${parseFloat(rec.entryKm).toLocaleString("tr-TR")} km</strong></span>
      </div>
      
      <div class="service-log-sub-ops">
        ${techDetailHtml}
      </div>

      ${rec.generalSummary ? `<div class="service-log-summary"><strong>İşlem Özeti:</strong> ${rec.generalSummary}</div>` : ""}

      <div class="service-log-footer">
        <span style="font-weight: 700; font-size:15px;">Toplam: ${parseFloat(rec.totalAmount).toLocaleString("tr-TR")} ₺</span>
        <button class="btn btn-secondary btn-mini" onclick="editServiceRecord('${rec.id}')">Düzenle</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================================================
// MÜŞTERİ & ARAÇ FORM GÖNDERİMLERİ (SUBMIT HANDLERS)
// ==========================================================================
async function handleCustomerSubmit(e) {
  e.preventDefault();
  
  const payload = {
    firstName: document.getElementById("c_firstName").value.trim(),
    lastName: document.getElementById("c_lastName").value.trim(),
    phone: document.getElementById("c_phone").value.trim(),
    reference: document.getElementById("c_reference").value.trim(),
    notes: document.getElementById("c_notes").value.trim()
  };

  const btn = document.getElementById("btnSaveCustomer");
  btn.disabled = true;
  btn.textContent = "Kaydediliyor...";

  const success = await sendRequest("addCustomer", payload);
  
  if (success) {
    document.getElementById("customerForm").reset();
    alert("Müşteri kaydı başarıyla oluşturuldu.");
  }
  
  btn.disabled = false;
  btn.textContent = "Müşteriyi Kaydet";
}

async function handleVehicleSubmit(e) {
  e.preventDefault();

  const payload = {
    customerId: document.getElementById("v_customerId").value,
    brand: document.getElementById("v_brand").value.trim(),
    model: document.getElementById("v_model").value.trim(),
    plate: document.getElementById("v_plate").value.trim().replace(/\s+/g, ""), // Boşlukları sil
    year: document.getElementById("v_year").value,
    chassisNo: document.getElementById("v_chassis").value.trim(),
    entryDate: document.getElementById("v_entryDate").value,
    notes: document.getElementById("v_notes").value.trim()
  };

  const btn = document.getElementById("btnSaveVehicle");
  btn.disabled = true;
  btn.textContent = "Kaydediliyor...";

  const success = await sendRequest("addVehicle", payload);

  if (success) {
    document.getElementById("vehicleForm").reset();
    document.getElementById("v_entryDate").value = new Date().toISOString().split("T")[0];
    alert("Araç kaydı başarıyla oluşturuldu.");
  }

  btn.disabled = false;
  btn.textContent = "Aracı Kaydet";
}

// ==========================================================================
// SERVİS İŞLEMLERİ FORM VE MANTIK YÖNETİMİ
// ==========================================================================

// Dinamik usta onay kutularını ekleme
function renderMechanicCheckboxes() {
  const container = document.getElementById("mechanicsCheckboxes");
  if (!container) return;
  
  container.innerHTML = "";
  TECHNICIANS.forEach(tech => {
    const label = document.createElement("label");
    label.className = "checkbox-label";
    label.innerHTML = `
      <input type="checkbox" id="chk-${tech.id}" class="checkbox-input" onchange="toggleTechFields('${tech.id}')">
      ${tech.label}
    `;
    container.appendChild(label);
  });
}

// Dinamik usta giriş panellerini oluşturma
function initMechanicBoxes() {
  const container = document.getElementById("dynamicMechanicBoxes");
  if (!container) return;
  
  container.innerHTML = "";
  TECHNICIANS.forEach(tech => {
    const box = document.createElement("div");
    box.id = `box-${tech.id}`;
    box.className = "dynamic-mechanic-box hidden";
    box.innerHTML = `
      <div class="mechanic-box-header">${tech.title}</div>
      <div class="form-group">
        <label class="form-label" for="s_${tech.id}Fee">${tech.label} İşlem Ücreti (₺) *</label>
        <input type="number" id="s_${tech.id}Fee" class="form-control" placeholder="0" oninput="calculateTotalFee()">
      </div>
      <div class="form-group">
        <label class="form-label" for="s_${tech.id}Note">${tech.label} İşlem Notu</label>
        <textarea id="s_${tech.id}Note" class="form-control" placeholder="Yapılan işlemleri yazın..."></textarea>
      </div>
    `;
    container.appendChild(box);
  });
}

function toggleTechFields(techId) {
  const tech = TECHNICIANS.find(t => t.id === techId);
  if (!tech) return;
  
  const isChecked = document.getElementById(`chk-${techId}`).checked;
  const box = document.getElementById(`box-${techId}`);
  const feeInput = document.getElementById(`s_${techId}Fee`);
  const noteInput = document.getElementById(`s_${techId}Note`);
  
  if (isChecked) {
    box.classList.remove("hidden");
    feeInput.required = true;
  } else {
    box.classList.add("hidden");
    feeInput.required = false;
    feeInput.value = "";
    noteInput.value = "";
  }
  calculateTotalFee();
}

function calculateTotalFee() {
  let total = 0;
  TECHNICIANS.forEach(tech => {
    const feeInput = document.getElementById(`s_${tech.id}Fee`);
    if (feeInput) {
      const val = parseFloat(feeInput.value) || 0;
      total += val;
    }
  });
  document.getElementById("s_totalFee").value = total;
}

// Araç detaylarından hızlıca servis açma
function quickCreateServiceRecord(vehicleId) {
  switchView("services");
  resetServiceForm();
  document.getElementById("s_vehicleId").value = vehicleId;
}

// Kayıtlı Servis Notunu Düzenlemek / Düzenleme Modu
function editServiceRecord(recordId) {
  const rec = state.serviceRecords.find(r => r.id === recordId);
  if (!rec) return;

  switchView("services");

  document.getElementById("serviceFormTitle").textContent = "Servis Notunu Güncelle";
  document.getElementById("btnSaveService").textContent = "Kaydı Güncelle";
  
  document.getElementById("s_recordId").value = rec.id;
  document.getElementById("s_vehicleId").value = rec.vehicleId;
  document.getElementById("s_km").value = rec.entryKm;
  document.getElementById("s_date").value = rec.recordDate.split("T")[0];
  
  // Tüm ustalar için alanları doldur
  TECHNICIANS.forEach(tech => {
    const feeVal = rec[tech.feeKey];
    const noteVal = rec[tech.noteKey];
    
    const chk = document.getElementById(`chk-${tech.id}`);
    const box = document.getElementById(`box-${tech.id}`);
    const feeInput = document.getElementById(`s_${tech.id}Fee`);
    const noteInput = document.getElementById(`s_${tech.id}Note`);
    
    if (parseFloat(feeVal) > 0 || noteVal) {
      if (chk) chk.checked = true;
      if (box) box.classList.remove("hidden");
      if (feeInput) {
        feeInput.value = feeVal || "";
        feeInput.required = true;
      }
      if (noteInput) noteInput.value = noteVal || "";
    } else {
      if (chk) chk.checked = false;
      if (box) box.classList.add("hidden");
      if (feeInput) {
        feeInput.value = "";
        feeInput.required = false;
      }
      if (noteInput) noteInput.value = "";
    }
  });
  
  document.getElementById("s_summary").value = rec.generalSummary || "";
  document.getElementById("s_paymentStatus").value = rec.paymentStatus;
  document.getElementById("s_totalFee").value = rec.totalAmount;
}

function resetServiceForm() {
  document.getElementById("serviceForm").reset();
  document.getElementById("s_recordId").value = "";
  document.getElementById("s_date").value = new Date().toISOString().split("T")[0];
  document.getElementById("serviceFormTitle").textContent = "Yeni Servis Notu Ekle";
  document.getElementById("btnSaveService").textContent = "Kaydı Kaydet";
  
  TECHNICIANS.forEach(tech => {
    const box = document.getElementById(`box-${tech.id}`);
    const chk = document.getElementById(`chk-${tech.id}`);
    if (box) box.classList.add("hidden");
    if (chk) chk.checked = false;
  });
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  
  const recordId = document.getElementById("s_recordId").value;
  
  const payload = {
    vehicleId: document.getElementById("s_vehicleId").value,
    entryKm: document.getElementById("s_km").value,
    recordDate: document.getElementById("s_date").value,
    generalSummary: document.getElementById("s_summary").value.trim(),
    paymentStatus: document.getElementById("s_paymentStatus").value,
    totalAmount: parseFloat(document.getElementById("s_totalFee").value) || 0
  };

  // Tüm usta ücretlerini ve notlarını payload'a ekle
  TECHNICIANS.forEach(tech => {
    const feeInput = document.getElementById(`s_${tech.id}Fee`);
    const noteInput = document.getElementById(`s_${tech.id}Note`);
    
    payload[tech.feeKey] = feeInput ? (parseFloat(feeInput.value) || 0) : 0;
    payload[tech.noteKey] = noteInput ? noteInput.value.trim() : "";
  });

  const btn = document.getElementById("btnSaveService");
  btn.disabled = true;
  btn.textContent = "Kaydediliyor...";

  let success = false;
  
  if (recordId) {
    // Güncelleme işlemi
    payload.id = recordId;
    success = await sendRequest("updateServiceRecord", payload);
  } else {
    // Ekleme işlemi
    success = await sendRequest("addServiceRecord", payload);
  }

  if (success) {
    resetServiceForm();
    alert(recordId ? "Servis kaydı başarıyla güncellendi." : "Servis kaydı başarıyla eklendi.");
  }

  btn.disabled = false;
  btn.textContent = recordId ? "Kaydı Güncelle" : "Kaydı Kaydet";
}

// ==========================================================================
// GELİŞMİŞ GLOBAL ARAMA (SEARCH ENGINE)
// ==========================================================================
function handleGlobalSearch() {
  const query = document.getElementById("globalSearch").value.trim().toLowerCase();
  const panel = document.getElementById("searchResultsPanel");

  if (!query) {
    closeSearchResults();
    return;
  }

  panel.innerHTML = "";
  let resultsFound = false;

  // Kategori 1: Sayfa Geçişleri
  const pages = [
    { title: "Ana Sayfa (Panel)", view: "dashboard", keywords: ["anasayfa", "dashboard", "grafik", "borç", "gelir", "panel"] },
    { title: "Müşteri & Araç Kayıt", view: "customers", keywords: ["müşteri", "araç", "plaka", "tel", "telefon", "kayıt"] },
    { title: "Servis Notları & İşlemler", view: "services", keywords: ["servis", "işlem", "usta", "tamir", "ücret", "fatura"] }
  ];
  
  const matchedPages = pages.filter(p => 
    p.title.toLowerCase().includes(query) || p.keywords.some(k => k.includes(query))
  );

  if (matchedPages.length > 0) {
    resultsFound = true;
    appendSearchCategoryHeader("SİSTEM SAYFALARI");
    matchedPages.forEach(p => {
      appendSearchResultItem(p.title, "Uygulama Sayfası", "SAYFA", () => {
        switchView(p.view);
        closeSearchResults();
        document.getElementById("globalSearch").value = "";
      });
    });
  }

  // Kategori 2: Müşteriler
  const matchedCustomers = state.customers.filter(c => 
    c.firstName.toLowerCase().includes(query) ||
    c.lastName.toLowerCase().includes(query) ||
    c.phone.includes(query) ||
    (c.reference && c.reference.toLowerCase().includes(query))
  );

  if (matchedCustomers.length > 0) {
    resultsFound = true;
    appendSearchCategoryHeader("MÜŞTERİLER");
    matchedCustomers.forEach(c => {
      appendSearchResultItem(`${c.firstName} ${c.lastName}`, `Telefon: ${c.phone}`, "MÜŞTERİ", () => {
        switchView("customers");
        
        // Müşteri kartını bul ve aç
        setTimeout(() => {
          const card = document.getElementById(`customer-card-${c.id}`);
          if (card) {
            if (!card.classList.contains("expanded")) {
              toggleCustomerExpand(c.id);
            }
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Parlama efekti ekle
            card.style.borderColor = "var(--accent)";
            setTimeout(() => card.style.borderColor = "", 2000);
          }
        }, 150);
        
        closeSearchResults();
        document.getElementById("globalSearch").value = "";
      });
    });
  }

  // Kategori 3: Araçlar & Plakalar
  const matchedVehicles = state.vehicles.filter(v => 
    v.plate.toLowerCase().includes(query) ||
    v.brand.toLowerCase().includes(query) ||
    v.model.toLowerCase().includes(query) ||
    (v.chassisNo && v.chassisNo.toLowerCase().includes(query))
  );

  if (matchedVehicles.length > 0) {
    resultsFound = true;
    appendSearchCategoryHeader("ARAÇLAR & PLAKALAR");
    matchedVehicles.forEach(v => {
      const owner = state.customers.find(c => c.id === v.customerId);
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : "Bilinmiyor";
      
      appendSearchResultItem(`${v.plate} - ${v.brand} ${v.model}`, `Sahibi: ${ownerName}`, "ARAÇ", () => {
        switchView("customers");
        
        // Müşteri kartını aç
        setTimeout(() => {
          const card = document.getElementById(`customer-card-${v.customerId}`);
          if (card) {
            if (!card.classList.contains("expanded")) {
              toggleCustomerExpand(v.customerId);
            }
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.style.borderColor = "var(--accent)";
            setTimeout(() => card.style.borderColor = "", 2000);
          }
        }, 150);

        closeSearchResults();
        document.getElementById("globalSearch").value = "";
      });
    });
  }

  // Kategori 4: Servis Kayıtları
  const matchedRecords = state.serviceRecords.filter(rec => {
    // İlgili plakayı kontrol et
    const vehicle = state.vehicles.find(v => v.id === rec.vehicleId);
    const plateMatches = vehicle ? vehicle.plate.toLowerCase().includes(query) : false;
    
    return plateMatches ||
      rec.generalSummary.toLowerCase().includes(query) ||
      (rec.mechanicNote && rec.mechanicNote.toLowerCase().includes(query)) ||
      (rec.electricianNote && rec.electricianNote.toLowerCase().includes(query));
  });

  if (matchedRecords.length > 0) {
    resultsFound = true;
    appendSearchCategoryHeader("SERVİS KAYITLARI");
    matchedRecords.forEach(rec => {
      const vehicle = state.vehicles.find(v => v.id === rec.vehicleId);
      const plate = vehicle ? vehicle.plate : "Plakasız";
      const desc = rec.generalSummary || rec.mechanicNote || "Detay belirtilmemiş.";
      
      appendSearchResultItem(`${plate} - ${formatDate(rec.recordDate)}`, desc, "SERVİS", () => {
        editServiceRecord(rec.id);
        closeSearchResults();
        document.getElementById("globalSearch").value = "";
      });
    });
  }

  if (!resultsFound) {
    panel.innerHTML = `<div class="search-no-results">"${query}" ile eşleşen sonuç bulunamadı.</div>`;
  }

  panel.classList.add("active");
}

function appendSearchCategoryHeader(title) {
  const panel = document.getElementById("searchResultsPanel");
  const header = document.createElement("div");
  header.className = "search-category-title";
  header.textContent = title;
  panel.appendChild(header);
}

function appendSearchResultItem(title, subtitle, badgeText, clickCallback) {
  const panel = document.getElementById("searchResultsPanel");
  const item = document.createElement("div");
  item.className = "search-item";
  item.onclick = clickCallback;
  
  item.innerHTML = `
    <div>
      <div class="search-item-title">${title}</div>
      <div class="search-item-subtitle">${subtitle}</div>
    </div>
    <span class="search-item-badge">${badgeText}</span>
  `;
  panel.appendChild(item);
}

function closeSearchResults() {
  const panel = document.getElementById("searchResultsPanel");
  panel.classList.remove("active");
}

// ==========================================================================
// MODAL AYARLARI & BAĞLANTI (SETTINGS MODAL)
// ==========================================================================
function openSettingsModal() {
  document.getElementById("settingsApiUrl").value = state.apiUrl;
  document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}

function saveSettings() {
  const urlInput = document.getElementById("settingsApiUrl").value.trim();
  
  if (urlInput && !urlInput.startsWith("https://script.google.com/")) {
    alert("Geçersiz URL. Lütfen geçerli bir Google Apps Script Web App adresi girin.");
    return;
  }

  state.apiUrl = urlInput;
  localStorage.setItem("oto_takip_api_url", urlInput);
  
  closeSettingsModal();
  updateApiStatusIndicator();
  
  // Yeni API ile verileri tazele
  fetchData();
}

// ==========================================================================
// DİĞER YARDIMCI FONKSİYONLAR (HELPERS)
// ==========================================================================
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR");
}

function triggerCall() {
  const phone = document.getElementById("c_phone").value.trim();
  if (!phone) {
    alert("Lütfen önce aranacak telefon numarasını girin.");
    return;
  }
  window.location.href = `tel:${phone}`;
}
