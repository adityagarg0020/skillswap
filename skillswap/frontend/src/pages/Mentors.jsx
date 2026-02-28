import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MentorCard from '../components/common/MentorCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Mentors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    minExp: '', maxExp: '', minPrice: '', maxPrice: '',
    minRating: '', sort: 'rank'
  });

  useEffect(() => { fetchMentors(); }, [page, filters]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, page, limit: 12 });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const { data } = await api.get(`/mentors?${params}`);
      setMentors(data.mentors || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchMentors(); }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Find Mentors</h1>
        <p className="text-white/40">{total} expert mentors ready to help</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-5">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 flex items-center gap-3 bg-dark-surface border border-dark-border rounded-xl px-4">
            <Search className="w-4 h-4 text-white/30" />
            <input className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-white/30"
              placeholder="Search by skill (React, Python, Design...)"
              value={filters.skill}
              onChange={e => setFilters(p => ({...p, skill: e.target.value}))}
              onKeyDown={handleSearch} />
          </div>
          <select className="input w-auto text-sm"
            value={filters.sort} onChange={e => { setFilters(p=>({...p, sort: e.target.value})); setPage(1); }}>
            <option value="rank">Best Match</option>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="sessions">Most Sessions</option>
          </select>
          <select className="input w-auto text-sm"
            value={filters.minRating} onChange={e => { setFilters(p=>({...p, minRating: e.target.value})); setPage(1); }}>
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
          <select className="input w-auto text-sm"
            value={filters.minExp} onChange={e => { setFilters(p=>({...p, minExp: e.target.value})); setPage(1); }}>
            <option value="">Any Experience</option>
            <option value="1">1+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="glass-card h-48 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-semibold mb-2">No mentors found</h3>
          <p className="text-white/40">Try adjusting your search filters</p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((m, i) => (
            <motion.div key={m._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              <MentorCard mentor={m} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
