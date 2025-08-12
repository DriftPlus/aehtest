import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

export default function AdminDashboard() {
  const [rows, setRows] = useState<any[]>([])
  const [lang, setLang] = useState('')
  const [pass, setPass] = useState('') // '', 'pass', 'fail'
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false })
      if (error) alert(error.message)
      else setRows(data as any[])
    })()
  }, [])

  const filtered = useMemo(() => rows.filter(r => {
    if (lang && r.language !== lang) return false
    if (pass === 'pass' && !r.pass) return false
    if (pass === 'fail' && r.pass) return false
    if (from && new Date(r.created_at) < new Date(from)) return false
    if (to && new Date(r.created_at) > new Date(to)) return false
    return true
  }), [rows, lang, pass, from, to])

  function toCSV(data: any[]): string {
    const cols = ['created_at','test_name','user_identifier','language','total_questions','correct','score','pass','pass_threshold']
    const header = cols.join(',')
    const lines = data.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))
    return [header, ...lines].join('\n')
  }

  function downloadCSV() {
    const blob = new Blob([toCSV(filtered)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aeh_quiz_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h1>AEH – Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        <div>
          <label>Language</label>
          <input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="e.g. en, pl, uk" />
        </div>
        <div>
          <label>Result</label>
          <select value={pass} onChange={(e) => setPass(e.target.value)}>
            <option value=''>All</option>
            <option value='pass'>Pass</option>
            <option value='fail'>Fail</option>
          </select>
        </div>
        <div>
          <label>From</label>
          <input type='date' value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label>To</label>
          <input type='date' value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button onClick={downloadCSV}>Export CSV</button>
        </div>
      </div>

      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Test</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>User</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Language</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Score</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Pass</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td style={{ borderBottom: '1px solid #eee' }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ borderBottom: '1px solid #eee' }}>{r.test_name || '-'}</td>
              <td style={{ borderBottom: '1px solid #eee' }}>{r.user_identifier || '-'}</td>
              <td style={{ borderBottom: '1px solid #eee' }}>{r.language}</td>
              <td style={{ borderBottom: '1px solid #eee' }}>{r.score?.toFixed?.(2)}%</td>
              <td style={{ borderBottom: '1px solid #eee' }}>{r.pass ? 'PASS' : 'FAIL'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
