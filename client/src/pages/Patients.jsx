import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import AddPrescriptionModal from '../components/AddPrescriptionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { 
  Users, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Activity,
  FilePlus,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function Patients() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(42);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Patient Create/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    age: 30, 
    gender: 'Male', 
    phone: '', 
    address: '', 
    allergies: 'None', 
    bloodGroup: 'B+' 
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Add Prescription modal state
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPatients(token, { 
        search: searchTerm, 
        page: currentPage, 
        limit: 5 // 5 per page as specified
      });
      setPatients(data.patients || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token, currentPage, searchTerm]);

  // Badge colors matching Diseases table (Green, Blue, Purple cycle)
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

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({ 
      name: '', 
      age: 30, 
      gender: 'Male', 
      phone: '', 
      address: '', 
      allergies: 'None', 
      bloodGroup: 'B+' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setFormData({
      name: p.name || '',
      age: p.age || 30,
      gender: p.gender || 'Male',
      phone: p.phone || '',
      address: p.address || '',
      allergies: p.allergies || 'None',
      bloodGroup: p.bloodGroup || 'B+'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingPatient) {
        await api.updatePatient(token, editingPatient.id, formData);
      } else {
        await api.createPatient(token, formData);
      }
      setModalOpen(false);
      fetchPatients();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    const deletedId = patientToDelete.id;
    const deletedName = patientToDelete.name;

    try {
      await api.deletePatient(token, deletedId);
      setDeleteModalOpen(false);
      setPatientToDelete(null);
      fetchPatients();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'patients', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchPatients();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete patient');
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / 5));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * 5 + 1;
  const endIndex = Math.min(currentPage * 5, total);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Layout */}
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar with live patient search */}
        <TopNavbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          
          {/* Header & Register Patient Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Patient Records <Users className="w-6 h-6 text-orange-500" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage registered clinic patients, diagnoses, and medication history.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register Patient</span>
            </button>
          </div>

          {/* Patients Main Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            
            {/* Header & Search patient name... input */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Total Patients: {total}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any patient name to view full medical history and prescribed medicines.
                </p>
              </div>

              {/* Search patient name... on right matching Diseases search style */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search patient name..."
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
                    <th className="py-3.5 px-3 min-w-[170px]">Patient Name</th>
                    <th className="py-3.5 px-3 min-w-[90px]">Age</th>
                    <th className="py-3.5 px-3 min-w-[140px]">Phone</th>
                    <th className="py-3.5 px-3 min-w-[160px]">Last Disease</th>
                    <th className="py-3.5 px-3 min-w-[240px]">Last Medicines Given</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading patients...</span>
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No patients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p, index) => {
                      const rowNumber = (currentPage - 1) * 5 + (index + 1);

                      return (
                        <tr key={p.id || index} className="hover:bg-slate-50/70 transition-colors">
                          {/* Row Number */}
                          <td className="py-4 px-3 text-slate-400 font-normal text-xs sm:text-sm">
                            {rowNumber}
                          </td>

                          {/* Patient Name (blue link that opens Patient Detail page) */}
                          <td className="py-4 px-3 font-semibold text-[#1e5adb] hover:underline cursor-pointer">
                            <span onClick={() => navigate(`/patients/${p.id}`)}>
                              {p.name}
                            </span>
                          </td>

                          {/* Age */}
                          <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm">
                            {p.age} yrs
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm">
                            {p.phone || '—'}
                          </td>

                          {/* Last Disease */}
                          <td className="py-4 px-3 text-slate-800 text-xs sm:text-sm font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              {p.lastDisease || 'No diagnosis'}
                            </span>
                          </td>

                          {/* Last Medicines Given (Pill badges in green, blue, purple) */}
                          <td className="py-4 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {p.lastMedicines && p.lastMedicines.length > 0 ? (
                                p.lastMedicines.map((med, mIdx) => (
                                  <span
                                    key={mIdx}
                                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium tracking-tight ${getBadgeStyle(mIdx)}`}
                                  >
                                    {med}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No medication</span>
                              )}
                            </div>
                          </td>

                          {/* Actions: + Prescription, Edit, Delete */}
                          <td className="py-4 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Add Rx Quick Button */}
                              <button
                                onClick={() => {
                                  setSelectedPatientForRx(p);
                                  setRxModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center"
                                title="Issue Prescription"
                              >
                                <FilePlus className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center"
                                title="Edit Patient"
                              >
                                <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  setPatientToDelete(p);
                                  setDeleteModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center"
                                title="Delete Patient"
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
                Showing {startIndex} to {endIndex} of {total} entries
              </div>

              {/* Pagination controls (5 per page) */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

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

      {/* Register / Edit Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter clinical profile details for SS Shifa Clinic medical registry.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+92 300 0000000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="House #, Street, City"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={formData.allergies}
                    onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option>
                    <option>O+</option><option>O-</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  {editingPatient ? 'Update Patient' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPatientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={patientToDelete?.name}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />

      {/* Quick Add Prescription Modal */}
      <AddPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => {
          setRxModalOpen(false);
          setSelectedPatientForRx(null);
        }}
        preselectedPatient={selectedPatientForRx}
        onSuccess={() => {
          fetchPatients();
        }}
      />

    </div>
  );
}
