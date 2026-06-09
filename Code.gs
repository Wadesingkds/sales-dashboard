// Google Apps Script — Sales Input Handler
// Deploy as Web App: Execute as Me, Access: Anyone

const SHEET_NAME = 'Sheet1';
const HEADERS = ['Nama Refferal', 'Tanggal Kunjungan', 'Nama Debitur', 'Produk', 'Nama Analisis', 'Potensi Pembiayaan', 'Status Analisis', 'Timestamp'];

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'updateStatus') {
      sheet.getRange(data.rowIndex, 7).setValue(data.status);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      data.namaRefferal || '',
      data.tanggalKunjungan || '',
      data.namaDebitur || '',
      data.produk || '',
      data.namaAnalisis || '',
      data.potensipembiayaan || '',
      'Proses',
      new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data berhasil disimpan' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getData') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: 'ok', data: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const rows = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      const data = rows.map((row, i) => ({
        rowIndex: i + 2,
        namaRefferal: row[0] ? row[0].toString() : '',
        tanggalKunjungan: row[1] ? (row[1] instanceof Date ? Utilities.formatDate(row[1], 'Asia/Jakarta', 'yyyy-MM-dd') : row[1].toString()) : '',
        namaDebitur: row[2] ? row[2].toString() : '',
        produk: row[3] ? row[3].toString() : '',
        namaAnalisis: row[4] ? row[4].toString() : '',
        potensipembiayaan: row[5] ? row[5].toString() : '',
        statusAnalisis: row[6] ? row[6].toString() : 'Proses',
        timestamp: row[7] ? row[7].toString() : '',
      }));

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', data }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Sales Input API aktif' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
