/**
 * OTO MUAMMER - Müşteri & Araç Takip Otomasyonu
 * Google Apps Script Backend (code.gs)
 * 
 * BU KOD NASIL KURULUR? (ADIM ADIM REHBER)
 * -------------------------------------------------------------------------
 * 1. Google Drive'ınızda (https://drive.google.com) yeni bir Google E-Tablo oluşturun.
 * 2. E-Tablonun üst menüsünden "Uzantılar" (Extensions) > "Apps Script" seçeneğine tıklayın.
 * 3. Açılan kod editöründeki tüm içeriği silin ve bu dosyadaki tüm kodları yapıştırın.
 * 4. Sağ üstteki mavi "Dağıt" (Deploy) butonuna basın > "Yeni dağıtım" (New deployment) seçin.
 * 5. Sol çarktaki simgeden "Web uygulaması" (Web app) seçin:
 *    - Açıklama: Oto Servis API
 *    - Uygulamayı şu kişi olarak çalıştır: Ben (Me)
 *    - Erişimi olan kişiler: Herkes (Anyone)
 * 6. "Dağıt" butonuna basın ve istenen Google izinlerini onaylayın.
 * 7. Oluşturulan "Web Uygulaması URL'si"ni (Web App URL) kopyalayın.
 * 8. Web sitenizdeki "API Ayarları" modalına bu URL'yi yapıştırıp "Bağlantıyı Kaydet"e tıklayın.
 * -------------------------------------------------------------------------
 */

// HTTP GET İsteklerini Karşılar (Verileri İstemciye Döndürür)
function doGet(e) {
  return handleResponse(getData());
}

// HTTP POST İsteklerini Karşılar (Ekleme, Güncelleme, Silme)
function doPost(e) {
  try {
    var postData = e.postData.contents;
    var requestData = JSON.parse(postData);
    var action = requestData.action;
    var payload = requestData.payload;
    var result;
    
    // Tabloların ve başlıkların varlığını kontrol et/oluştur
    initSheets();
    
    if (action === 'addCustomer') {
      result = addCustomer(payload);
    } else if (action === 'updateCustomer') {
      result = updateCustomer(payload);
    } else if (action === 'deleteCustomer') {
      result = deleteCustomer(payload);
    } else if (action === 'addVehicle') {
      result = addVehicle(payload);
    } else if (action === 'updateVehicle') {
      result = updateVehicle(payload);
    } else if (action === 'deleteVehicle') {
      result = deleteVehicle(payload);
    } else if (action === 'addServiceRecord') {
      result = addServiceRecord(payload);
    } else if (action === 'updateServiceRecord') {
      result = updateServiceRecord(payload);
    } else if (action === 'deleteServiceRecord') {
      result = deleteServiceRecord(payload);
    } else {
      throw new Error('Geçersiz işlem: ' + action);
    }
    
    return handleResponse({ success: true, data: result });
  } catch (error) {
    return handleResponse({ success: false, error: error.toString() });
  }
}

// CORS Destekli JSON Yanıtı Hazırlar
function handleResponse(data) {
  var JSONString = JSON.stringify(data);
  return ContentService.createTextOutput(JSONString)
    .setMimeType(ContentService.MimeType.JSON);
}

// Sayfaları ve Başlık Satırlarını Sıfırdan / Otomatik Oluşturur
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Customers (Müşteriler) Sekmesi
  var customerSheet = ss.getSheetByName('Customers');
  if (!customerSheet) {
    customerSheet = ss.insertSheet('Customers');
    customerSheet.appendRow(['id', 'firstName', 'lastName', 'phone', 'reference', 'notes', 'createdAt']);
    customerSheet.getRange("1:1").setFontWeight("bold").setBackground("#e8f0fe");
  }
  customerSheet.getRange('D:D').setNumberFormat('@'); // Telefon numarasının başındaki 0'ları korumak için
  
  // 2. Vehicles (Araçlar) Sekmesi
  var vehicleSheet = ss.getSheetByName('Vehicles');
  if (!vehicleSheet) {
    vehicleSheet = ss.insertSheet('Vehicles');
    vehicleSheet.appendRow(['id', 'customerId', 'brand', 'model', 'plate', 'chassisNo', 'entryDate', 'notes', 'createdAt']);
    vehicleSheet.getRange("1:1").setFontWeight("bold").setBackground("#e8f0fe");
  }
  
  // 3. ServiceRecords (Servis Kayıtları) Sekmesi
  var serviceSheet = ss.getSheetByName('ServiceRecords');
  var expectedHeaders = [
    'id', 'vehicleId', 'entryKm', 'recordDate', 
    'mechanicFee', 'mechanicNote', 'electricianFee', 'electricianNote', 
    'boyaciFee', 'boyaciNote',
    'cikmaciFee', 'cikmaciNote',
    'egzozcuFee', 'egzozcuNote',
    'frenciFee', 'frenciNote',
    'kapakciFee', 'kapakciNote',
    'kaportaciFee', 'kaportaciNote',
    'kurtariciFee', 'kurtariciNote',
    'parcaciFee', 'parcaciNote',
    'pompaciFee', 'pompaciNote',
    'tornaciFee', 'tornaciNote',
    'turbocuFee', 'turbocuNote',
    'tupcuFee', 'tupcuNote',
    'yagciFee', 'yagciNote',
    'yikamaciFee', 'yikamaciNote',
    'generalSummary', 'paymentStatus', 'totalAmount', 'createdAt'
  ];

  if (!serviceSheet) {
    serviceSheet = ss.insertSheet('ServiceRecords');
    serviceSheet.appendRow(expectedHeaders);
    serviceSheet.getRange("1:1").setFontWeight("bold").setBackground("#e8f0fe");
  } else {
    // Eksik sütunları dinamik tamamla
    var existingHeaders = serviceSheet.getRange(1, 1, 1, serviceSheet.getLastColumn()).getValues()[0];
    var missingHeaders = expectedHeaders.filter(function(h) {
      return existingHeaders.indexOf(h) === -1;
    });
    
    if (missingHeaders.length > 0) {
      var startCol = serviceSheet.getLastColumn() + 1;
      var range = serviceSheet.getRange(1, startCol, 1, missingHeaders.length);
      range.setValues([missingHeaders]);
      serviceSheet.getRange("1:1").setFontWeight("bold");
    }
  }
}

// Tüm Verileri JSON Olarak Çeker
function getData() {
  try {
    initSheets();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    return {
      success: true,
      customers: readSheetData(ss.getSheetByName('Customers')),
      vehicles: readSheetData(ss.getSheetByName('Vehicles')),
      serviceRecords: readSheetData(ss.getSheetByName('ServiceRecords'))
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Belirtilen Sekmedeki Verileri Obje Dizisine Dönüştürür
function readSheetData(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  var headers = rows[0];
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var value = row[j];
      if (headers[j] === 'phone' && value !== '') {
        value = String(value);
        if (/^\d{10}$/.test(value)) value = '0' + value;
      }
      obj[headers[j]] = value;
    }
    data.push(obj);
  }
  return data;
}

// -------------------------------------------------------------------------
// MÜŞTERİ İŞLEMLERİ (ADD, UPDATE, DELETE)
// -------------------------------------------------------------------------
function addCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  
  var id = 'CST-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var createdAt = new Date().toISOString();
  var phone = String(payload.phone || '').trim();

  sheet.getRange('D:D').setNumberFormat('@');
  
  sheet.appendRow([
    id,
    payload.firstName || '',
    payload.lastName || '',
    phone,
    payload.reference || '',
    payload.notes || '',
    createdAt
  ]);
  
  return { id: id, createdAt: createdAt };
}

function updateCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  sheet.getRange('D:D').setNumberFormat('@');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Güncelleme için Müşteri ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      var rowIndex = i + 1;
      for (var j = 0; j < headers.length; j++) {
        var colName = headers[j];
        if (payload[colName] !== undefined && colName !== 'id' && colName !== 'createdAt') {
          var value = payload[colName];
          if (colName === 'phone') value = String(value || '').trim();
          sheet.getRange(rowIndex, j + 1).setValue(value);
        }
      }
      return { id: recordId, success: true };
    }
  }
  throw new Error('Müşteri bulunamadı: ' + recordId);
}

function deleteCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Silme için Müşteri ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      sheet.deleteRow(i + 1);
      
      // Müşteriye ait araçları da temizle
      var vehicleSheet = ss.getSheetByName('Vehicles');
      if (vehicleSheet) {
        var vRows = vehicleSheet.getDataRange().getValues();
        if (vRows.length > 1) {
          var vCustIdIdx = vRows[0].indexOf('customerId');
          for (var k = vRows.length - 1; k >= 1; k--) {
            if (vRows[k][vCustIdIdx] === recordId) {
              vehicleSheet.deleteRow(k + 1);
            }
          }
        }
      }
      return { id: recordId, success: true };
    }
  }
  throw new Error('Müşteri bulunamadı: ' + recordId);
}

// -------------------------------------------------------------------------
// ARAÇ İŞLEMLERİ (ADD, UPDATE, DELETE)
// -------------------------------------------------------------------------
function addVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  
  var id = 'VHC-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var createdAt = new Date().toISOString();
  
  var headers = sheet.getDataRange().getValues()[0];
  var newRow = [];
  
  payload.id = id;
  payload.createdAt = createdAt;
  payload.entryDate = payload.entryDate || new Date().toISOString().split('T')[0];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    newRow.push(payload[header] !== undefined ? payload[header] : '');
  }

  sheet.appendRow(newRow);
  return { id: id, createdAt: createdAt };
}

function updateVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Güncelleme için Araç ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      var rowIndex = i + 1;
      for (var j = 0; j < headers.length; j++) {
        var colName = headers[j];
        if (payload[colName] !== undefined && colName !== 'id' && colName !== 'createdAt') {
          sheet.getRange(rowIndex, j + 1).setValue(payload[colName]);
        }
      }
      return { id: recordId, success: true };
    }
  }
  throw new Error('Araç bulunamadı: ' + recordId);
}

function deleteVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Silme için Araç ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      sheet.deleteRow(i + 1);
      return { id: recordId, success: true };
    }
  }
  throw new Error('Araç bulunamadı: ' + recordId);
}

// -------------------------------------------------------------------------
// SERVİS KAYDI İŞLEMLERİ (ADD, UPDATE, DELETE)
// -------------------------------------------------------------------------
function addServiceRecord(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ServiceRecords');
  
  var id = 'SRV-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var createdAt = new Date().toISOString();
  
  var headers = sheet.getDataRange().getValues()[0];
  var newRow = [];
  
  payload.id = id;
  payload.createdAt = createdAt;
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var val = payload[header];
    if (val === undefined) {
      if (header === 'paymentStatus') val = 'Ödenmedi';
      else if (header === 'entryKm' || header === 'totalAmount' || header.indexOf('Fee') !== -1) val = 0;
      else val = '';
    }
    newRow.push(val);
  }
  
  sheet.appendRow(newRow);
  return { id: id, createdAt: createdAt };
}

function updateServiceRecord(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ServiceRecords');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Güncelleme için Servis Kayıt ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      var rowIndex = i + 1;
      for (var j = 0; j < headers.length; j++) {
        var colName = headers[j];
        if (payload[colName] !== undefined && colName !== 'id' && colName !== 'createdAt') {
          sheet.getRange(rowIndex, j + 1).setValue(payload[colName]);
        }
      }
      return { id: recordId, success: true };
    }
  }
  throw new Error('Servis kaydı bulunamadı: ' + recordId);
}

function deleteServiceRecord(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ServiceRecords');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) throw new Error('Silme için Servis Kayıt ID gereklidir.');
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      sheet.deleteRow(i + 1);
      return { id: recordId, success: true };
    }
  }
  throw new Error('Servis kaydı bulunamadı: ' + recordId);
}
