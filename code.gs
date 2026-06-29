/**
 * Oto Tamir Servisi Takip Otomasyonu - Google Apps Script Backend
 * 
 * Bu kodu Google E-Tablo'nuzun menüsünden Uzantılar > Apps Script kısmına yapıştırın.
 * Ardından "Yeni Dağıtım" (New Deployment) -> "Web Uygulaması" (Web App) olarak dağıtın.
 * Erişim yetkisini "Herkes" (Anyone) olarak ayarlayın.
 * Dağıtım sonrasında verilen URL'yi uygulamanın API Ayarları kısmına girin.
 */

function doGet(e) {
  return handleResponse(getData());
}

function doPost(e) {
  // CORS uçuş öncesi (preflight) ve normal POST isteklerini karşılamak için CORS başlıklarıyla döner.
  try {
    var postData = e.postData.contents;
    var requestData = JSON.parse(postData);
    var action = requestData.action;
    var payload = requestData.payload;
    var result;
    
    // Sayfaların varlığından emin ol
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
    } else {
      throw new Error('Geçersiz işlem: ' + action);
    }
    
    return handleResponse({ success: true, data: result });
  } catch (error) {
    return handleResponse({ success: false, error: error.toString() });
  }
}

// CORS başlıklarını ekleyerek JSON yanıtı döner
function handleResponse(data) {
  var JSONString = JSON.stringify(data);
  return ContentService.createTextOutput(JSONString)
    .setMimeType(ContentService.MimeType.JSON);
}

// Gerekli tabloları (sayfaları) ve başlıklarını otomatik oluşturur
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Customers Sheet
  var customerSheet = ss.getSheetByName('Customers');
  if (!customerSheet) {
    customerSheet = ss.insertSheet('Customers');
    customerSheet.appendRow(['id', 'firstName', 'lastName', 'phone', 'reference', 'notes', 'createdAt']);
    customerSheet.getRange("1:1").setFontWeight("bold");
  }
  
  // Vehicles Sheet
  var vehicleSheet = ss.getSheetByName('Vehicles');
  if (!vehicleSheet) {
    vehicleSheet = ss.insertSheet('Vehicles');
    vehicleSheet.appendRow(['id', 'customerId', 'brand', 'model', 'plate', 'year', 'chassisNo', 'entryDate', 'notes', 'createdAt']);
    vehicleSheet.getRange("1:1").setFontWeight("bold");
  }
  
  // ServiceRecords Sheet
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
    serviceSheet.getRange("1:1").setFontWeight("bold");
  } else {
    // Mevcut başlıkları tara ve eksik olanları ekle
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

// Tüm verileri okur ve JSON nesnesi olarak döndürür
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

// E-Tablodaki verileri nesne dizisine dönüştürür
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
      obj[headers[j]] = row[j];
    }
    data.push(obj);
  }
  return data;
}

// Yeni müşteri ekler
function addCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  
  var id = 'CST-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var createdAt = new Date().toISOString();
  
  sheet.appendRow([
    id,
    payload.firstName || '',
    payload.lastName || '',
    payload.phone || '',
    payload.reference || '',
    payload.notes || '',
    createdAt
  ]);
  
  return { id: id, createdAt: createdAt };
}

// Yeni araç ekler
function addVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  
  var id = 'VHC-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  var createdAt = new Date().toISOString();
  
  sheet.appendRow([
    id,
    payload.customerId || '',
    payload.brand || '',
    payload.model || '',
    payload.plate || '',
    payload.year || '',
    payload.chassisNo || '',
    payload.entryDate || new Date().toISOString().split('T')[0],
    payload.notes || '',
    createdAt
  ]);
  
  return { id: id, createdAt: createdAt };
}

// Yeni servis notu/işlem ekler
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
      // Varsayılan değerlerin atanması
      if (header === 'paymentStatus') val = 'Ödenmedi';
      else if (header === 'entryKm' || header === 'totalAmount' || header.indexOf('Fee') !== -1) val = 0;
      else val = '';
    }
    newRow.push(val);
  }
  
  sheet.appendRow(newRow);
  
  return { id: id, createdAt: createdAt };
}

// Servis notunu günceller
function updateServiceRecord(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ServiceRecords');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) {
    throw new Error('Güncelleme için ID gereklidir.');
  }
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      // Satırı bulduk, güncelleyelim. (Satır indeksi 1-tabanlıdır, başlık satırı da hesaba katılır)
      var rowIndex = i + 1;
      
      // Sütun eşleştirmesi yaparak verileri güncelle
      for (var j = 0; j < headers.length; j++) {
        var colName = headers[j];
        if (payload[colName] !== undefined && colName !== 'id' && colName !== 'createdAt') {
          sheet.getRange(rowIndex, j + 1).setValue(payload[colName]);
        }
      }
      return { id: recordId, success: true };
    }
  }
  
  throw new Error('Güncellenecek kayıt bulunamadı: ' + recordId);
}

// Müşteri bilgilerini günceller
function updateCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) {
    throw new Error('Güncelleme için ID gereklidir.');
  }
  
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
  throw new Error('Güncellenecek müşteri bulunamadı: ' + recordId);
}

// Müşteriyi siler (ilişkili araçları da siler)
function deleteCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) {
    throw new Error('Silme için ID gereklidir.');
  }
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      var rowIndex = i + 1;
      sheet.deleteRow(rowIndex);
      
      // Müşteriye ait araçları da silelim (orphan kayıt kalmaması için)
      var vehicleSheet = ss.getSheetByName('Vehicles');
      if (vehicleSheet) {
        var vRows = vehicleSheet.getDataRange().getValues();
        if (vRows.length > 1) {
          var vHeaders = vRows[0];
          var vCustIdIdx = vHeaders.indexOf('customerId');
          // Sütun kaymalarını önlemek için sondan başa doğru siliyoruz
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
  throw new Error('Silinecek müşteri bulunamadı: ' + recordId);
}

// Araç bilgilerini günceller
function updateVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) {
    throw new Error('Güncelleme için ID gereklidir.');
  }
  
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
  throw new Error('Güncellenecek araç bulunamadı: ' + recordId);
}

// Aracı siler
function deleteVehicle(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Vehicles');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIndex = headers.indexOf('id');
  var recordId = payload.id;
  
  if (!recordId) {
    throw new Error('Silme için ID gereklidir.');
  }
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === recordId) {
      var rowIndex = i + 1;
      sheet.deleteRow(rowIndex);
      return { id: recordId, success: true };
    }
  }
  throw new Error('Silinecek araç bulunamadı: ' + recordId);
}
