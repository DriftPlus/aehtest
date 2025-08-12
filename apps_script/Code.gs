function doGet(e) {
  const lang = (e.parameter.lang || 'en').toLowerCase();
  const testName = e.parameter.test || '';
  const ss = SpreadsheetApp.openById('SHEET_ID_HERE');
  const sh = ss.getSheetByName('Questions');
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const filtered = rows.filter(r => String(r.Active).toLowerCase() === 'true' && String(r.Language).toLowerCase() === lang && (!testName || (r['Test Name']||'') === testName));
  const picked = shuffle(filtered).slice(0, 10);
  const questions = picked.map((r, i) => ({
    id: i+1,
    question: r.Question,
    options: [r['Option A'], r['Option B'], r['Option C']].filter(Boolean),
    correct: String(r['Correct Answer']||'A').toUpperCase(),
    language: r.Language,
    testName: r['Test Name']||''
  }));
  return ContentService.createTextOutput(JSON.stringify({questions})).setMimeType(ContentService.MimeType.JSON);
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
