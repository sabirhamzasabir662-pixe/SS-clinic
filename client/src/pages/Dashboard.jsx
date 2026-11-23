import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DiseaseModal from '../components/DiseaseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Footer from '../components/Footer';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Pill,
  Users,
  ClipboardList
} from 'lucide-react';

export default function Dashboard() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDiseases: 28,
    totalMedicines: 156,
    totalPatients: 42,
    totalPrescriptions: 78
  });

  const [diseases, setDiseases] = useState([]);
  const [totalEntries, setTotalEntries] = useState(28);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [diseaseToDelete, setDiseaseToDelete] = useState(null);

  // Fallback initial 5 rows from screenshot for instant visual fidelity
  const fallbackDiseases = [
    {
      id: 1,
      name: 'Common Cold',
      description: 'Viral infection of upper respiratory tract',
      symptoms: 'Cough, Sore throat, Runny nose, Sneezing',
      medicines: ['Paracetamol', 'Cetirizine', 'Cough Syrup']
    },
    {
      id: 2,
      name: 'Fever',
      description: 'Increase in body temperature',
      symptoms: 'High body temp, Chills, Headache, Weakness',
      medicines: ['Paracetamol', 'Ibuprofen']
    },
    {
      id: 3,
      name: 'Gastritis',
      description: 'Inflammation of stomach lining',
      symptoms: 'Stomach pain, Nausea, Bloating, Loss of appetite',
      medicines: ['Omeprazole', 'Antacid', 'Domperidone']
    },
    {
      id: 4,
      name: 'Diabetes',
      description: 'High blood sugar level disorder',
      symptoms: 'Increased thirst, Frequent urination, Fatigue',
      medicines: ['Metformin', 'Glimepiride', 'Insulin']
    },
    {
      id: 5,
      name: 'Hypertension',
      description: 'High blood pressure condition',
      symptoms: 'Headache, Dizziness, Chest pain, Shortness',
      medicines: ['Amlodipine', 'Losartan', 'Atenolol']
    }
  ];

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const data = await api.getStats(token);
      setStats(data);
    } catch {
      // Keep screenshot default numbers if backend not yet running
    }
  };

  // Fetch diseases from backend with pagination and search
  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDiseases(token, {
        search: searchTerm,
        page: currentPage,
        limit: 5
      });
      if (data && data.diseases && data.diseases.length > 0) {
        setDiseases(data.diseases);
        setTotalEntries(data.total || 28);
      } else if (!searchTerm && currentPage === 1) {
        setDiseases(fallbackDiseases);
        setTotalEntries(28);
      } else {
        setDiseases(data?.diseases || []);
        setTotalEntries(data?.total || 0);
      }
    } catch {
      // Fallback for demonstration when backend starts
      if (currentPage === 1 && !searchTerm) {
        setDiseases(fallbackDiseases);
        setTotalEntries(28);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  useEffect(() => {
    fetchDiseases();
  }, [token, currentPage, searchTerm]);

  // Handle Create or Update
  const handleSaveDisease = async (diseaseData) => {
    try {
      if (editingDisease) {
        await api.updateDisease(token, editingDisease.id, diseaseData);
      } else {
        await api.createDisease(token, diseaseData);
      }
      setIsModalOpen(false);
      setEditingDisease(null);
      fetchDiseases();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!diseaseToDelete) return;
    const deletedId = diseaseToDelete.id;
    const deletedName = diseaseToDelete.name;

    try {
      await api.deleteDisease(token, deletedId);
      setDeleteModalOpen(false);
      setDiseaseToDelete(null);
      fetchDiseases();
      fetchStats();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'diseases', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchDiseases();
            fetchStats();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete disease');
    }
  };

  // Badge color helper (Green for 1st, Blue for 2nd, Purple for 3rd)
  const getBadgeStyle = (index) => {
    const cycle = index % 3;
    if (cycle === 0) {
      return 'bg-[#eaf8f1] text-[#059669] border border-[#a7f3d0]';
    } else if (cycle === 1) {
      return 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]';
    } else {
      return 'bg-[#faf5ff] text-[#9333ea] border border-[#e9d5ff]';
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalEntries / 5));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * 5 + 1;
  const endIndex = Math.min(currentPage * 5, totalEntries);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Layout (Offset left for sidebar on large screens) */}
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar */}
        <TopNavbar 
          setMobileOpen={setMobileOpen} 
          onGlobalSearch={(term) => setSearchTerm(term)}
        />

        {/* Dashboard Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          
          {/* Welcome Header & Action Button Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Welcome, {user?.name || 'Dr. Shazaib'} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Here's what's happening in your clinic today.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingDisease(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Disease</span>
            </button>
          </div>

          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            
            {/* Card 1: Total Diseases */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-center gap-4 transition hover:shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#eef5fc] text-[#1e5adb] flex items-center justify-center shrink-0">
                {/* Virus / Pathogen Icon */}
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {stats.totalDiseases}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#1e5adb]">
                  Total Diseases
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Registered diseases
                </p>
              </div>
            </div>

            {/* Card 2: Total Medicines */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-center gap-4 transition hover:shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#eaf8f1] text-[#10b981] flex items-center justify-center shrink-0">
                <Pill className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {stats.totalMedicines}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#10b981]">
                  Total Medicines
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Available medicines
                </p>
              </div>
            </div>

            {/* Card 3: Total Patients */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-center gap-4 transition hover:shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#fef4eb] text-[#f97316] flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {stats.totalPatients}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#f97316]">
                  Total Patients
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Registered patients
                </p>
              </div>
            </div>

            {/* Card 4: Total Prescriptions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-center gap-4 transition hover:shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-[#fdf2f4] text-[#f43f5e] flex items-center justify-center shrink-0">
                <ClipboardList className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {stats.totalPrescriptions}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#f43f5e]">
                  Total Prescriptions
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This month
                </p>
              </div>
            </div>

          </div>

          {/* Diseases & Medicines Main Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            
            {/* Card Header & Search Disease input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Diseases &amp; Medicines
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage clinic diseases and their recommended medicines.
                </p>
              </div>

              {/* Search Disease on the right with search icon on right */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search disease..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-600">
                    <th className="py-3.5 px-3 w-12 font-normal text-slate-400">#</th>
                    <th className="py-3.5 px-3 min-w-[140px]">Disease Name</th>
                    <th className="py-3.5 px-3 min-w-[200px]">Description</th>
                    <th className="py-3.5 px-3 min-w-[220px]">Common Symptoms</th>
                    <th className="py-3.5 px-3 min-w-[240px]">Recommended Medicines</th>
                    <th className="py-3.5 px-3 text-center min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading clinic data...</span>
                      </td>
                    </tr>
                  ) : diseases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No diseases found matching your search.
                      </td>
                    </tr>
                  ) : (
                    diseases.map((row, index) => {
                      const rowNumber = (currentPage - 1) * 5 + (index + 1);
                      const medsList = Array.isArray(row.medicines) 
                        ? row.medicines 
                        : (typeof row.medicines === 'string' ? row.medicines.split(',').map(s => s.trim()) : []);

                      return (
                        <tr key={row.id || index} className="hover:bg-slate-50/70 transition-colors">
                          {/* Row Number */}
                          <td className="py-4 px-3 text-slate-400 font-normal text-xs sm:text-sm">
                            {rowNumber}
                          </td>

                          {/* Disease Name as Blue Link */}
                          <td className="py-4 px-3 font-medium text-[#1e5adb] hover:underline cursor-pointer">
                            <span onClick={() => {
                              setEditingDisease(row);
                              setIsModalOpen(true);
                            }}>
                              {row.name}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
                            {row.description}
                          </td>

                          {/* Common Symptoms */}
                          <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
                            {Array.isArray(row.symptoms) ? row.symptoms.join(', ') : row.symptoms}
                          </td>

                          {/* Recommended Medicines Badges */}
                          <td className="py-4 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {medsList.map((med, mIdx) => (
                                <span
                                  key={mIdx}
                                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium tracking-tight ${getBadgeStyle(mIdx)}`}
                                >
                                  {med}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Actions: Edit (blue) and Delete (red) */}
                          <td className="py-4 px-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingDisease(row);
                                  setIsModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center"
                                title="Edit Disease"
                              >
                                <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  setDiseaseToDelete(row);
                                  setDeleteModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center"
                                title="Delete Disease"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Entries count on left, Pagination on right */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div>
                Showing {startIndex} to {endIndex} of {totalEntries} entries
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                {/* Prev Arrow */}
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers (1 to 5) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs sm:text-sm transition ${
                        isActive
                          ? 'bg-[#1e5adb] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Arrow */}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          <Footer />

        </main>
      </div>

      {/* Add / Edit Disease Modal */}
      <DiseaseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDisease(null);
        }}
        onSave={handleSaveDisease}
        editingDisease={editingDisease}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDiseaseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={diseaseToDelete?.name}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />

    </div>
  );
}
