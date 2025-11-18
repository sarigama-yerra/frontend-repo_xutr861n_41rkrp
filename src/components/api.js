const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...authHeaders(),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  baseUrl: BASE_URL,
  async register(data) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(data) })
  },
  async verify(data) {
    return request('/auth/verify', { method: 'POST', body: JSON.stringify(data) })
  },
  async login(data) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(data) })
  },
  async me() {
    return request('/auth/me')
  },
  async getProfile() { return request('/profile') },
  async updateProfile(data) { return request('/profile', { method: 'PUT', body: JSON.stringify(data) }) },
  async upload(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', headers: { ...authHeaders() }, body: form })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
  async createOpportunity(data) { return request('/opportunities', { method: 'POST', body: JSON.stringify(data) }) },
  async listOpportunities(params = {}) {
    const q = new URLSearchParams()
    if (params.category) q.set('category', params.category)
    if (params.location) q.set('location', params.location)
    const qs = q.toString()
    return request(`/opportunities${qs ? `?${qs}` : ''}`)
  },
  async getOpportunity(id) { return request(`/opportunities/${id}`) },
  async submitProposal(id, data) { return request(`/opportunities/${id}/proposals`, { method: 'POST', body: JSON.stringify(data) }) },
  async myProposals() { return request('/proposals/mine') },
  async receivedProposals() { return request('/proposals/for-me') },
  async updateProposalStatus(id, status) { return request(`/proposals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }) },
  async devDashboard() { return request('/dashboard/developer') },
  async contractorDashboard() { return request('/dashboard/contractor') },
}
