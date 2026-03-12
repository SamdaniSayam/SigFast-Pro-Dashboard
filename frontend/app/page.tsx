'use client';

import { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UploadCloud, Activity, Zap } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send file to your FastAPI backend
      const response = await axios.post('https://sigfast-api.onrender.com/api/analyze', formData);
      setData(response.data.data);
    } catch (error) {
      console.error("Error uploading file", error);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white p-8 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400" size={32} />
          <h1 className="text-3xl font-bold tracking-tight">SigFast <span className="text-cyan-400 font-light">Pro</span></h1>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-semibold transition shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          Upgrade to Premium
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 bg-[#161b22] p-6 rounded-2xl border border-gray-800 h-fit shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-gray-400" size={20} /> Data Import
          </h2>
          
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-cyan-500 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="text-gray-400 mb-3" size={32} />
              <p className="text-sm text-gray-400"><span className="font-semibold text-cyan-400">Click to upload</span> a CSV file</p>
              <p className="text-xs text-gray-500 mt-1">Date & Price columns only</p>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>

          {loading && <p className="text-cyan-400 mt-6 text-center animate-pulse font-medium">⚡ Processing with SigFast JIT...</p>}
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3 bg-[#161b22] p-6 rounded-2xl border border-gray-800 h-[600px] shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Market Analysis & Anomaly Detection</h2>
          
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                <XAxis dataKey="date" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} />
                <YAxis domain={['auto', 'auto']} stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '8px' }}
                  itemStyle={{ color: '#c9d1d9' }}
                />
                <Legend />
                {/* The actual price line */}
                <Line type="monotone" dataKey="price" stroke="#8b949e" strokeWidth={2} dot={false} name="Raw Price" />
                {/* The SigFast EMA line */}
                <Line type="monotone" dataKey="ema" stroke="#22d3ee" strokeWidth={2} dot={false} name="SigFast EMA (20)" />
                {/* The Red Dots for Anomalies! */}
                <Line type="monotone" dataKey="anomaly" stroke="none" dot={{ r: 6, fill: '#ff7b72' }} name="Anomaly Detected!" activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-4">
              <Activity size={48} className="opacity-20" />
              <p>Upload a CSV dataset to visualize anomalies.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}