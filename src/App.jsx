import { useEffect, useMemo, useState } from 'react'
import { api } from './components/api'

const categories = [
  'Civil Work','Engineering','Carpentry','Architecture','Legal','Materials','Electrical','Plumbing','HVAC'
]

function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' })
  const [verifyCode, setVerifyCode] = useState('')
  const [message, setMessage] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const register = async () => {
    setMessage('')
    const res = await api.register(form)
    setMessage(`Registered. Your verification code: ${res.verification_code}`)
    setMode('verify')
  }

  const verify = async () => {
    setMessage('')
    await api.verify({ email: form.email, code: verifyCode })
    setMessage('Email verified. You can log in now.')
    setMode('login')
  }

  const login = async () => {
    setMessage('')
    const { token } = await api.login({ email: form.email, password: form.password })
    localStorage.setItem('token', token)
    window.location.reload()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button className={`px-3 py-1 rounded ${mode==='login'?'bg-blue-600 text-white':'bg-slate-700 text-blue-200'}`} onClick={()=>setMode('login')}>Login</button>
        <button className={`px-3 py-1 rounded ${mode==='register'?'bg-blue-600 text-white':'bg-slate-700 text-blue-200'}`} onClick={()=>setMode('register')}>Register</button>
        {mode==='verify' && <span className="px-3 py-1 rounded bg-emerald-600 text-white">Verify</span>}
      </div>

      {mode==='register' && (
        <div className="space-y-2">
          <input name="name" placeholder="Name" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange} />
          <input name="email" placeholder="Email" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange} />
          <input name="password" type="password" placeholder="Password" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange} />
          <select name="role" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange}>
            <option value="developer">Developer</option>
            <option value="contractor">Contractor</option>
          </select>
          <button onClick={register} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Create account</button>
        </div>
      )}

      {mode==='verify' && (
        <div className="space-y-2">
          <input placeholder="Verification code" className="w-full p-2 rounded bg-slate-800 text-white" onChange={(e)=>setVerifyCode(e.target.value)} />
          <button onClick={verify} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded p-2">Verify Email</button>
        </div>
      )}

      {mode==='login' && (
        <div className="space-y-2">
          <input name="email" placeholder="Email" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange} />
          <input name="password" type="password" placeholder="Password" className="w-full p-2 rounded bg-slate-800 text-white" onChange={onChange} />
          <button onClick={login} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2">Login</button>
        </div>
      )}

      {!!message && <p className="text-sm text-blue-200">{message}</p>}
    </div>
  )
}

function DeveloperPanel({ me }) {
  const [form, setForm] = useState({ title: '', category: categories[0], description: '', deadline: '', budget: '', location: '' })
  const [market, setMarket] = useState([])
  const [received, setReceived] = useState([])

  const load = async () => {
    const dash = await api.devDashboard()
    setMarket(dash.my_opportunities)
    setReceived(dash.proposals_received)
  }
  useEffect(()=>{ load() },[])

  const onCreate = async () => {
    const payload = { ...form, budget: form.budget? Number(form.budget): undefined, deadline: form.deadline? new Date(form.deadline).toISOString() : undefined }
    await api.createOpportunity(payload)
    setForm({ title: '', category: categories[0], description: '', deadline: '', budget: '', location: '' })
    await load()
  }

  const updateStatus = async (id, status) => {
    await api.updateProposalStatus(id, status)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">Post Opportunity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input placeholder="Title" className="p-2 rounded bg-slate-900 text-white" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
          <select className="p-2 rounded bg-slate-900 text-white" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Location" className="p-2 rounded bg-slate-900 text-white" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
          <input type="date" className="p-2 rounded bg-slate-900 text-white" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} />
          <input placeholder="Budget (optional)" className="p-2 rounded bg-slate-900 text-white" value={form.budget} onChange={e=>setForm({...form, budget: e.target.value})} />
          <textarea placeholder="Description" className="p-2 rounded bg-slate-900 text-white col-span-1 md:col-span-2" rows={3} value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
        </div>
        <button onClick={onCreate} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Publish</button>
      </div>

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">My Opportunities</h3>
        <div className="space-y-2">
          {market.map(m => (
            <div key={m.id} className="p-3 rounded bg-slate-900 text-blue-100">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-white">{m.title}</p>
                  <p className="text-xs text-blue-300">{m.category} • {m.location || 'N/A'}</p>
                </div>
                <div className="text-xs text-blue-300">{new Date(m.created_at).toLocaleDateString()}</div>
              </div>
              <p className="text-sm mt-2">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">Proposals Received</h3>
        <div className="space-y-2">
          {received.map(p => (
            <div key={p.id} className="p-3 rounded bg-slate-900 text-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">Proposal for {p.opportunity_id}</p>
                  <p className="text-xs text-blue-300">Amount: {p.amount ?? '—'} • Timeline: {p.timeline_weeks ?? '—'} weeks</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-slate-700">{p.status}</span>
                  <button onClick={()=>updateStatus(p.id,'viewed')} className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">Mark viewed</button>
                  <button onClick={()=>updateStatus(p.id,'selected')} className="text-xs bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded text-white">Select</button>
                </div>
              </div>
              <p className="text-sm mt-2">{p.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContractorPanel({ me }) {
  const [filters, setFilters] = useState({ category: '', location: '' })
  const [market, setMarket] = useState([])
  const [myProps, setMyProps] = useState([])
  const [selected, setSelected] = useState(null)
  const [proposal, setProposal] = useState({ amount: '', message: '', timeline_weeks: '' })

  const load = async () => {
    const dash = await api.contractorDashboard()
    setMarket(dash.opportunities)
    setMyProps(dash.my_proposals)
  }
  useEffect(()=>{ load() },[])

  const applyFilters = async () => {
    const ops = await api.listOpportunities(filters)
    setMarket(ops)
  }

  const open = (op) => { setSelected(op); setProposal({ amount: '', message: '', timeline_weeks: '' }) }

  const submitProposal = async () => {
    await api.submitProposal(selected.id, { 
      amount: proposal.amount? Number(proposal.amount): undefined,
      message: proposal.message,
      timeline_weeks: proposal.timeline_weeks? Number(proposal.timeline_weeks) : undefined,
      attachments: [],
    })
    setSelected(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">Opportunity Marketplace</h3>
        <div className="flex gap-2 mb-3">
          <select className="p-2 rounded bg-slate-900 text-white" value={filters.category} onChange={e=>setFilters({...filters, category: e.target.value})}>
            <option value="">All categories</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Location" className="p-2 rounded bg-slate-900 text-white" value={filters.location} onChange={e=>setFilters({...filters, location: e.target.value})} />
          <button onClick={applyFilters} className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded">Filter</button>
        </div>
        <div className="space-y-2">
          {market.map(m => (
            <div key={m.id} className="p-3 rounded bg-slate-900 text-blue-100">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-white">{m.title}</p>
                  <p className="text-xs text-blue-300">{m.category} • {m.location || 'N/A'}</p>
                </div>
                <div className="text-xs text-blue-300">Deadline: {m.deadline ? new Date(m.deadline).toLocaleDateString() : '—'}</div>
              </div>
              <p className="text-sm mt-2">{m.description}</p>
              <button onClick={()=>open(m)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1">Submit Proposal</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">My Proposals</h3>
        <div className="space-y-2">
          {myProps.map(p => (
            <div key={p.id} className="p-3 rounded bg-slate-900 text-blue-100">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-white">To Opportunity {p.opportunity_id}</p>
                  <p className="text-xs text-blue-300">Amount: {p.amount ?? '—'} • Timeline: {p.timeline_weeks ?? '—'} weeks</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-slate-700">{p.status}</span>
              </div>
              <p className="text-sm mt-2">{p.message}</p>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 max-w-lg w-full">
            <h3 className="text-white font-semibold mb-2">Submit Proposal - {selected.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="Amount (optional)" className="p-2 rounded bg-slate-900 text-white" value={proposal.amount} onChange={e=>setProposal({...proposal, amount: e.target.value})} />
              <input placeholder="Timeline (weeks)" className="p-2 rounded bg-slate-900 text-white" value={proposal.timeline_weeks} onChange={e=>setProposal({...proposal, timeline_weeks: e.target.value})} />
              <textarea placeholder="Message" className="p-2 rounded bg-slate-900 text-white col-span-1 md:col-span-2" rows={3} value={proposal.message} onChange={e=>setProposal({...proposal, message: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={()=>setSelected(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded">Cancel</button>
              <button onClick={submitProposal} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  const loadMe = async () => {
    setError('')
    try {
      const user = await api.me()
      setMe(user)
    } catch (e) {
      setMe(null)
    }
  }
  useEffect(()=>{ loadMe() },[])

  const logout = () => { localStorage.removeItem('token'); window.location.reload() }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-white tracking-tight">NODO</h1>
          </div>
          <div className="text-blue-200">
            {me ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">{me.name} • {me.role}</span>
                <button onClick={logout} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1 rounded">Logout</button>
              </div>
            ) : (
              <span className="text-sm">Welcome</span>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-5 shadow-xl">
            <h2 className="text-white font-semibold mb-3">Get Started</h2>
            {me ? (
              <div className="space-y-2 text-blue-100 text-sm">
                <p>You're logged in as <span className="font-semibold text-white">{me.role}</span>.</p>
                <p>Use the panel on the right to manage your work.</p>
              </div>
            ) : (
              <Auth />
            )}

            <div className="mt-6 text-blue-300/70 text-xs">
              <p>Backend: {api.baseUrl}</p>
            </div>
          </section>

          <section className="md:col-span-2">
            {!me && (
              <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6 text-blue-100">
                <h3 className="text-white font-semibold mb-2">What is NODO?</h3>
                <p className="text-sm">A minimal marketplace connecting developers with contractors and suppliers. Create an account, post opportunities, and submit proposals. Built to be simple, fast, and extensible.</p>
              </div>
            )}

            {me && me.role === 'developer' && <DeveloperPanel me={me} />}
            {me && me.role === 'contractor' && <ContractorPanel me={me} />}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
