import { useEffect, useMemo, useState } from 'react'
import { fetchQuestions, saveResult } from './api'
import { t, type Lang } from './i18n'

const PASS_THRESHOLD = Number(import.meta.env.VITE_PASS_THRESHOLD || 70)

type Q = { id: number; question: string; options: string[]; correct: 'A'|'B'|'C'; language: string; testName: string }

const langs: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'fil', label: 'Filipino' },
  { code: 'be', label: 'Беларуская' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
]

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [testName, setTestName] = useState('EU Rules Basics')
  const [userId, setUserId] = useState('')

  const [qs, setQs] = useState<Q[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try { setQs(await fetchQuestions({ lang, test: testName, count: 10 })) }
      finally { setLoading(false) }
    })()
  }, [lang, testName])

  const total = qs.length
  const correctCount = useMemo(() => qs.reduce((acc, q) => {
    const map = {0:'A',1:'B',2:'C'} as const
    const chosenIdx = Number(answers[q.id])
    const chosenLetter = isNaN(chosenIdx) ? '' : (map[chosenIdx as 0|1|2])
    return acc + (chosenLetter === q.correct ? 1 : 0)
  }, 0), [qs, answers])

  const scorePct = total ? Math.round((correctCount / total) * 100) : 0
  const isPass = scorePct >= PASS_THRESHOLD

  async function onSubmit() {
    setSubmitted(true)
    const ans = qs.map((q) => {
      const chosenIdx = Number(answers[q.id])
      const chosen = isNaN(chosenIdx) ? '' : ['A','B','C'][chosenIdx]
      return { q: q.question, chosen, correct: q.correct }
    })
    await saveResult({
      test_name: testName,
      user_identifier: userId || undefined,
      language: lang,
      total_questions: total,
      correct: correctCount,
      pass: isPass,
      pass_threshold: PASS_THRESHOLD,
      answers: ans
    })
  }

  if (loading) return <div style={{ padding: 16 }}>{t(lang,'loading')}</div>

  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
        <h1>{t(lang,'result.title')}</h1>
        <p>{t(lang,'result.score')}: <b>{scorePct}%</b></p>
        <p>{isPass ? t(lang,'result.pass') : t(lang,'result.fail')} ({t(lang,'result.threshold')}: {PASS_THRESHOLD}%)</p>
        <h2>{t(lang,'result.review')}</h2>
        <ol>
          {qs.map((q) => {
            const chosenIdx = Number(answers[q.id])
            const chosen = isNaN(chosenIdx) ? '' : ['A','B','C'][chosenIdx]
            return (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <div><b>{q.question}</b></div>
                <div>{t(lang,'result.yourAnswer')}: {chosen || '—'}</div>
                <div>{t(lang,'result.correctAnswer')}: {q.correct}</div>
              </li>
            )
          })}
        </ol>
        <button onClick={() => { setSubmitted(false); setAnswers({}); }}>{t(lang,'actions.retry')}</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>AEH Quiz</h1>

      <label>
        {t(lang,'labels.language')}:&nbsp;
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          {langs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>

      <div style={{ marginTop: 8 }}>
        <label>
          {t(lang,'labels.testName')}:&nbsp;
          <input value={testName} onChange={(e) => setTestName(e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          {t(lang,'labels.userId')} &nbsp;
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={t(lang,'placeholders.userId')} />
        </label>
      </div>

      <ol style={{ marginTop: 16 }}>
        {qs.map((q) => (
          <li key={q.id} style={{ marginBottom: 16 }}>
            <div><b>{q.question}</b></div>
            {q.options.map((opt, i) => (
              <label key={i} style={{ display: 'block' }}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={i}
                  checked={String(answers[q.id]||'') === String(i)}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                />
                &nbsp;{String.fromCharCode(65 + i)}. {opt}
              </label>
            ))}
          </li>
        ))}
      </ol>

      <button onClick={onSubmit} disabled={!qs.length}>
        {t(lang,'actions.submit')}
      </button>
    </div>
  )
}
