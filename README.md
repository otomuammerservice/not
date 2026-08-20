# 🚗 OTO MUAMMER - Müşteri & Araç Takip Otomasyonu

Oto tamir servisleri, oto elektrikçiler, kaportacılar ve usta dükkanları için geliştirilmiş; müşteri, araç, usta işçilikleri ve finansal süreçleri tek bir merkezden yöneten **ücretsiz, sade, hızlı ve modern** takip sistemidir.

Herhangi bir veritabanı sunucu maliyeti olmadan tamamen **Google E-Tablolar (Google Sheets)** altyapısını veritabanı olarak kullanır. İnternet veya E-Tablo bağlantısı olmaması durumunda uygulamanın kesintisiz çalışması için **Yerel Depolama (Local Storage)** destekli yedek çalışma moduna sahiptir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 📊 Genel Durum Paneli (Dashboard)
- **Canlı Metrikler:** Kayıtlı toplam müşteri sayısı, aktif araç sayısı, tahsil edilmemiş toplam alacak/borç ve tahsil edilen gelir metrikleri.
- **Aylık İş Hacmi Grafiği:** Chart.js altyapısı ile son 6 ayın iş hacmi ve tahsilat performansının sütun grafik olarak görselleştirilmesi.
- **Tahsilat Dağılım Oranı:** Ödemelerin Nakit, Kredi/Banka Kartı, Kısmi Ödeme ve Borç durumlarına göre pasta (doughnut) grafikte dağılımı.
- **Borçlu Araçlar Bento Paneli:** Alacağı olan araçların ve müşterilerin hızlı takip kartları.

### 2. 📁 Marka Klasörlü Araçlar Sayfası
- **Otomatik Marka Klasörleri:** Kayıtlı araçlar; **Volkswagen, Fiat, Toyota, Opel, Renault, Ford, Hyundai, BMW, Mercedes-Benz, Peugeot, Citroën, Honda, Nissan, Seat, Skoda, Audi, Kia** gibi bilinen yaygın markalara göre özel klasör çiplerine ayrılır.
- **"Diğer" Markalar Klasörü:** Bilinen marka listesinde yer almayan veya özel kaydedilen tüm araçlar otomatik olarak "Diğer Markalar" klasöründe birleştirilir.
- **Hızlı Filtreleme:** Tek tıkla ilgili marka klasörüne girip o markaya ait araçların müşteri, telefon, giriş tarihi ve işlem geçmişini inceleme.

### 3. 📝 Esnek Müşteri ve Araç Kaydı
- **Müşteri Kaydı:** İsim, soyisim, telefon, referans bilgisi ve müşteri notları.
- **Esnek Marka Seçimi:** Araç eklerken yaygın markalar listeden seçilebilir. Farklı bir marka ekleneceği zaman **"+ Farklı Marka Yaz (Diğer)"** seçeneği tıklanarak yeni marka ismi yazılıp kaydedilebilir.
- **Yalın Form Yapısı:** Gereksiz karmaşıklığı önlemek adına üretim yılı alanı kaldırılmış; plaka, şasi no, giriş tarihi ve özel notlar odaklı tasarım uygulanmıştır.

### 4. 🛠️ Usta Görevlendirme ve Servis Girişi (16 Farklı İş Kolu)
- Servise giren araçlar için usta bazlı işlem ve ücret kaydı:
  - *Tamirci, Elektrikçi, Boyacı, Çıkmacı, Egzozcu, Frenci, Kapakçı, Kaportacı, Kurtarıcı, Parçacı, Pompacı, Tornacı, Turbocu, Tüpçü, Yağcı, Yıkamacı*
- Usta bazlı tutarlar otomatik toplanarak araç servis ücreti hesaplanır.

### 5. 💳 Gelişmiş Ödeme Yönetimi
- **Ödeme Şekilleri:**
  - `Ödenmedi (Borç Kaydı)`
  - `Kısmi Ödendi`
  - `Ödendi (Nakit / Havale)`
  - `Kartla Ödendi (Kredi / Banka Kartı)` *(Yeni)*
- Kartla ve Nakit yapılan ödemeler anında tahsil edilen gelire işlenir, borç listesinden çıkarılır ve özel renkli durum rozetleri ile takip edilir.

### 6. 📅 Takvim ve Borç Listesi
- **Araç Giriş Takvimi:** Günlere göre servise kabul edilen araçların takvim üzerinde listelenmesi.
- **Borç Listesi:** Ödemesi yapılmamış tüm araçların tek tıkla tahsil edilmesi veya düzenlenmesi.

---

## 🛠️ Teknoloji Altyapısı

- **Ön Yüz (Frontend):** HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom CSS Properties, Modern Grid & Flexbox Layout).
- **Grafik Motoru:** [Chart.js](https://www.chartjs.org/) (Responsive finansal grafikler).
- **Arka Yüz (Backend & Veritabanı):** Google Apps Script (`code.gs`) ve Google E-Tablolar (Google Sheets).
- **Çevrimdışı / Test Modu:** HTML5 LocalStorage API.

---

## 📂 Dosya Yapısı

```
not 2/
├── index.html       # Uygulama HTML arayüzü, modaller ve sayfa görünümleri
├── style.css        # Tema, renk değişkenleri, responsive grid ve bileşen stilleri
├── app.js           # Uygulama mantığı, veri yönetimi, grafikler ve API istekleri
├── code.gs          # Google Apps Script veritabanı arka yüz kodları
└── README.md        # Proje tanıtımı ve kurulum kılavuzu
```

---

## 🚀 Google E-Tablo ve Apps Script Sıfırdan Kurulum Rehberi

Sitenizdeki verilerin kendi Google Drive hesabınızdaki bir E-Tabloya kaydedilmesi için aşağıdaki adımları sırasıyla uygulayın:

### Adım 1: Yeni E-Tablo Oluşturma
1. [Google Drive](https://drive.google.com) hesabınızı açın.
2. Sol üstteki **Yeni** > **Google E-Tablolar** butonuna tıklayarak boş bir tablo oluşturun.
3. Tablonun adını örneğin **"Oto Muammer Servis Veritabanı"** olarak değiştirin.

### Adım 2: Apps Script Kod Editörünü Açma
1. E-Tablo üst menüsünden **Uzantılar (Extensions)** > **Apps Script** seçeneğine tıklayın.
2. Açılan kod editöründeki mevcut `function myFunction() {...}` kodlarını tamamen silin.

### Adım 3: `code.gs` Kodunu Yapıştırma
1. Bu projedeki **`code.gs`** dosyasının tüm içeriğini kopyalayın.
2. Google Apps Script editörüne yapıştırın ve üstteki **Kaydet (Disket simgesi)** butonuna basın.

### Adım 4: Web Uygulaması Olarak Dağıtma (Deploy)
1. Sağ üst köşedeki mavi **Dağıt (Deploy)** butonuna tıklayın ve **Yeni dağıtım (New deployment)** seçeneğini seçin.
2. Sol taraftaki çark simgesine tıklayıp **Web uygulaması (Web app)** seçeneğini işaretleyin.
3. Ayarları şu şekilde yapın:
   - **Açıklama:** Oto Servis API
   - **Uygulamayı şu kişi olarak çalıştır:** `Ben (E-posta adresiniz)`
   - **Erişimi olan kişiler:** `Herkes (Anyone)` *(Bu seçenek uygulamanızın şifresiz ve sorunsuz veri okuyup yazabilmesi için şarttır).*
4. **Dağıt** butonuna tıklayın.
5. Google hesabınız için izin penceresi açılacaktır:
   - **Erişime İzin Ver (Review permissions)** seçeneğine tıklayın.
   - Hesabınızı seçin.
   - Gelişmiş (Advanced) > **... adresine git (güvenli değil)** bağlantısına tıklayıp **İzin Ver (Allow)** diyerek onaylayın.

### Adım 5: API URL'sini Siteye Bağlama
1. Dağıtım tamamlandığında ekranda gösterilen **Web Uygulaması URL'si (Web App URL)** değerini kopyalayın (URL `https://script.google.com/macros/s/.../exec` şeklinde biter).
2. Oto Muammer web uygulamasını tarayıcınızda açın.
3. Sol alt menüdeki **API Ayarları** butonuna tıklayın.
4. Kopyaladığınız URL'yi kutucuğa yapıştırın ve **Bağlantıyı Kaydet** butonuna basın.
5. Sistem otomatik olarak Google E-Tablonuzda `Customers`, `Vehicles` ve `ServiceRecords` sayfalarını oluşturacak ve verileriniz E-Tablonuza yazılmaya başlayacaktır!

---

## 🌐 Siteyi İnternette Yayınlama (Deployment)

Sitenizi tamamen ücretsiz olarak internette yayınlayabilirsiniz:

### Option A: GitHub Pages
1. Kodlarınızı bir GitHub deposuna (repository) yükleyin.
2. Depo ayarlarından **Settings** > **Pages** sekmesine gidin.
3. Branch olarak `main` veya `master` seçip **Save** deyin. Siteniz saniyeler içinde yayınlanacaktır.

### Option B: Netlify veya Vercel
1. Netlify / Vercel hesabınıza giriş yapın.
2. Proje klasörünü sürükleyip bırakın (Drag & Drop). Siteniz anında canlıya alınacaktır.

---

## 📄 Lisans ve Kullanım

Bu proje açık kaynaklı olup tüm oto tamir servisleri ve ustalar tarafından ücretsiz olarak kullanılabilir.