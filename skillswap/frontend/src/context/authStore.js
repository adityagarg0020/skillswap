import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('skillswap_token') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('skillswap_token'),
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('skillswap_token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  },
  
  signup: async (formData) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/signup', formData)
      localStorage.setItem('skillswap_token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Signup failed' }
    }
  },
  
  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('skillswap_token')
    delete api.defaults.headers.common['Authorization']
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  fetchMe: async () => {
    const token = localStorage.getItem('skillswap_token')
    if (!token) return
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('skillswap_token')
      set({ user: null, isAuthenticated: false })
    }
  },
  
  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
}))

export default useAuthStore
