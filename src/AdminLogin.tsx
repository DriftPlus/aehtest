import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else setSent(true)
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Admin Login</h1>
      {sent ? (
        <p>Check your email for the magic link.</p>
      ) : (
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button onClick={signIn}>Send magic link</button>
        </div>
      )}
    </div>
  )
}
