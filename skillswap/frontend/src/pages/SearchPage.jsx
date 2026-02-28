import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, Users, ChevronDown, X, Sliders } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import api from '../services/api'
import debounce from '../utils/debounce'

const SORT_OPTIONS = [
  { value: 'rankScore', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'sessions', label: 'Most Sessions' },
]

export default function SearchPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [filters, setFilters] = useState({
    skill: '', minPrice: '', maxPrice: '', minRating: '',
    minExperience: '', maxExperience: '', sortBy: 'rankScore', availability: ''
  })

  const fetchMentors = useCallback(async (f = filters, p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 12 })
      Object.entries(f).forEach(([k, v]) => { if (v) params.append(k, v) })
      const { data } = await api.get(`/search/mentors?${params}`)
      setMentors(data.mentors)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMentors(filters, page) }, [page])

  const handleSearch = () => { setPage(1); fetchMentors(filters, 1) }

  const debouncedSkillSearch = useCallback(debounce(async (q) => {
    if (q.length < 2) return setSkillSuggestions([])
    const { data } = await api.get(`/search/skills?q=${q}`)
    setSkillSuggestions(data.skills)
    setShowSuggestions(true)
  }, 300), [])

  const handleSkillInput = (val) => {
    setFilters(p => ({ ...p, skill: val }))
    debouncedSkillSearch(val)
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Find Mentors</h1>
          <p className="text-slate-500 text-sm mt-1">{total} expert mentors available</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className="input pl-11"
              placeholder="Search by skill (e.g. React.js, Python, Machine Learning...)"
              value={filters.skill}
              onChange={e => handleSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && skillSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-10"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
                {skillSuggestions.map((s, i) => (
                  <button key={i} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center justify-between"
                    onMouseDown={() => { setFilters(p => ({ ...p, skill: s.name })); setShowSuggestions(false) }}>
                    <span>{s.name}</span>
                    <span className="text-xs text-slate-500">{s.count} mentors</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2">
            <Sliders size={16} /> Filters
          </button>
          
          <button onClick={handleSearch} className="btn-primary px-6">Search</button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="glass p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Min Price (₹/min)</label>
              <input className="input text-sm" type="number" placeholder="e.g. 5"
                value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Max Price (₹/min)</label>
              <input className="input text-sm" type="number" placeholder="e.g. 20"
                value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Min Rating</label>
              <select className="input text-sm" value={filters.minRating}
                onChange={e => setFilters(p => ({ ...p, minRating: e.target.value }))}>
                <option value="">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Min Experience (years)</label>
              <input className="input text-sm" type="number" placeholder="e.g. 2"
                value={filters.minExperience} onChange={e => setFilters(p => ({ ...p, minExperience: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Sort By</label>
              <select className="input text-sm" value={filters.sortBy}
                onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))}>
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Available On</label>
              <select className="input text-sm" value={filters.availability}
                onChange={e => setFilters(p => ({ ...p, availability: e.target.value }))}>
                <option value="">Any day</option>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button onClick={handleSearch} className="btn-primary flex-1 text-sm py-2.5">Apply Filters</button>
              <button onClick={() => { setFilters({ skill:'',minPrice:'',maxPrice:'',minRating:'',minExperience:'',maxExperience:'',sortBy:'rankScore',availability:'' }); fetchMentors({}, 1) }}
                className="btn-secondary text-sm py-2.5 px-4">Clear</button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass p-5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold mb-2">No mentors found</h3>
            <p className="text-slate-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {mentors.map(mentor => <MentorCard key={mentor._id} mentor={mentor} />)}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && <button onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-4 py-2">← Previous</button>}
            <span className="flex items-center text-sm text-slate-400 px-4">Page {page} of {Math.ceil(total / 12)}</span>
            {page < Math.ceil(total / 12) && <button onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-4 py-2">Next →</button>}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function MentorCard({ mentor }) {
  return (
    <Link to={`/mentor/${mentor._id}`} className="glass glass-hover p-5 block">
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          {mentor.avatar ? (
            <img src={mentor.avatar} className="w-14 h-14 rounded-full object-cover" alt={mentor.name} />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
              {mentor.name?.[0]}
            </div>
          )}
          {mentor.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold truncate">{mentor.name}</span>
            {mentor.isVerified && <span>✅</span>}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{mentor.title || mentor.bio?.substring(0, 60)}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={10} fill="currentColor" />
              {mentor.averageRating > 0 ? mentor.averageRating.toFixed(1) : 'New'}
              <span className="text-slate-500">({mentor.totalRatings || 0})</span>
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Users size={10} /> {mentor.totalSessions} sessions
            </span>
          </div>
        </div>
      </div>
      
      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {mentor.skillsToTeach?.slice(0, 3).map((skill, i) => (
          <span key={i} className="px-2 py-0.5 text-xs rounded-lg"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
            {skill.name}
          </span>
        ))}
        {mentor.skillsToTeach?.length > 3 && (
          <span className="text-xs text-slate-500">+{mentor.skillsToTeach.length - 3} more</span>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <div className="font-bold" style={{ color: '#00ff87' }}>₹{mentor.pricePerMinute}/min</div>
          <div className="text-xs text-slate-500">{mentor.yearsOfExperience}+ years exp</div>
        </div>
        <div className="btn-primary text-xs py-2 px-4">Book Now</div>
      </div>
    </Link>
  )
}
