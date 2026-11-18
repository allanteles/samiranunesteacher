const SHEET_NAME = 'Respostas';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = (e && e.parameter) ? e.parameter : {};
    const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || d.token !== secret) {
      return resposta({ ok: false, erro: 'unauthorized' });
    }

    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Aba "' + SHEET_NAME + '" não encontrada na planilha.');
      return resposta({ ok: false, erro: 'sheet_not_found' });
    }

    sheet.appendRow([
      new Date(),
      d.nome || '',
      d.whatsapp || '',
      d.email || '',
      d.interesse || '',
      d.objetivo || '',
      Number(d.pontos) || 0,
      d.nivel || '',
      d.respostas || '',
      'sim'
    ]);
    return resposta({ ok: true });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: 'erro interno' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

//KxQCTEmOydERjXXLSgkpT9CrtL00jRjY3JvF0VSkYl1P7PVZ5UgS7tL4FsCik3wz
