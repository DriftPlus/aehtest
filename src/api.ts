import { supabase } from './lib/supabase'

export async function fetchQuestions({ lang, test, count = 10 }: { lang: string; test?: string; count?: number }) {
  const url = new URL(import.meta.env.VITE_GET_QUESTIONS_URL as string)
  url.searchParams.set('lang', lang)
  if (test) url.searchParams.set('test', test)
  url.searchParams.set('count', String(count))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load questions')
  const data = await res.json()
  return data.questions as Array<{
    id: number
    question: string
    options: string[]
    correct: 'A' | 'B' | 'C'
    language: string
    testName: string
  }>
}

export async function saveResult(payload: {
  test_name?: string
  user_identifier?: string
  language: string
  total_questions: number
  correct: number
  pass: boolean
  pass_threshold: number
  answers: Array<{ q: string; chosen: string; correct: string }>
}) {
  const { error } = await supabase.from('quiz_attempts').insert({
    test_name: payload.test_name || null,
    user_identifier: payload.user_identifier || null,
    language: payload.language,
    total_questions: payload.total_questions,
    correct: payload.correct,
    pass: payload.pass,
    pass_threshold: payload.pass_threshold,
    answers: payload.answers
  })
  if (error) throw error
}
