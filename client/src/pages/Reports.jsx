import React from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { BarChart2, TrendingUp, Download, Calendar } from 'lucide-react';
import Footer from '../components/Footer';

export default function Reports() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen">
        <TopNavbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Clinical Analytics &amp; Reports <BarChart2 className="w-6 h-6 text-blue-600" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Disease epidemiology, prescription metrics, patient demographics, and clinic growth.
              </p>
            </div>
            <button 
              onClick={() => alert('Exporting monthly clinic audit report...')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-400">MOST DIAGNOSED THIS MONTH</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Common Cold</h3>
              <p className="text-xs text-blue-600 mt-1 font-medium">38% of total visits</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-400">TOP PRESCRIBED MEDICINE</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Paracetamol 500mg</h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium">142 prescriptions dispensed</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-400">PATIENT RETENTION RATE</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">94.8%</h3>
              <p className="text-xs text-purple-600 mt-1 font-medium">+4.2% increase from last month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Disease Prevalence Distribution</h3>
            <div className="space-y-4">
              {[
                { name: 'Common Cold / Respiratory', pct: '38%', color: 'bg-blue-500' },
                { name: 'Fever & General Viral', pct: '24%', color: 'bg-emerald-500' },
                { name: 'Gastritis / Digestive', pct: '18%', color: 'bg-orange-500' },
                { name: 'Hypertension', pct: '12%', color: 'bg-purple-500' },
                { name: 'Diabetes', pct: '8%', color: 'bg-rose-500' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{item.name}</span>
                    <span>{item.pct}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: item.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Footer />

        </main>
      </div>
    </div>
  );
}
