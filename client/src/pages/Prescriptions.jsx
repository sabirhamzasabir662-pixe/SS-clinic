import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ClipboardList, Plus, Search, FileText, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function Prescriptions() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [total, setTotal] = useState(78);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rxToDelete, setRxToDelete] = useState(null);
  const [formData, setFormData] = useState({ patientName: '', disease: 'Common Cold', medicines: 'Paracetamol, Cetirizine', dosageNotes: 'Twice daily after meals' });

  const fetchPrescriptions = async () => {
    try {
      const data = await api.getPrescriptions(token, { search: searchTerm, page: currentPage, limit: 10 });
      setPrescriptions(data.prescriptions || []);
      setTotal(data.total || 78);
    } catch {
      // Fallback preview
      setPrescriptions([
        { id: 1, rxId: 'RX-7801', patient: 'Muhammad Ali', disease: 'Common Cold', medicines: 'Paracetamol, Cetirizine', doctor: 'Dr. Shazaib', date: '2026-10-27', status: 'Completed' },
        { id: 2, rxId: 'RX-7802', patient: 'Fatima Zahra', disease: 'Gastritis', medicines: 'Omeprazole, Antacid', doctor: 'Dr. Shazaib', date: '2026-10-26', status: 'Active' },
        { id: 3, rxId: 'RX-7803', patient: 'Ahmad Khan', disease: 'Hypertension', medicines: 'Amlodipine, Losartan', doctor: 'Dr. Shazaib', date: '2026-10-26', status: 'Active' },
        { id: 4, rxId: 'RX-7804', patient: 'Zainab Bibi', disease: 'Diabetes', medicines: 'Metformin, Glimepiride', doctor: 'Dr. Shazaib', date: '2026-10-25', status: 'Completed' },
        { id: 5, rxId: 'RX-7805', patient: 'Bilal Hassan', disease: 'Fever', medicines: 'Paracetamol, Ibuprofen', doctor: 'Dr. Shazaib', date: '2026-10-24', status: 'Completed' },
        { id: 6, rxId: 'RX-7806', patient: 'Ayesha Siddiqua', disease: 'Bronchitis', medicines: 'Azithromycin, Salbutamol', doctor: 'Dr. Shazaib', date: '2026-10-23', status: 'Active' },
        { id: 7, rxId: 'RX-7807', patient: 'Tariq Mehmood', disease: 'Hypertension', medicines: 'Atenolol, Aspirin', doctor: 'Dr. Shazaib', date: '2026-10-22', status: 'Completed' }
      ]);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [token, currentPage, searchTerm]);

  const handleConfirmDelete = async () => {
    if (!rxToDelete) return;
    const deletedId = rxToDelete.id;
    const rxLabel = rxToDelete.rxId || `RX-${rxToDelete.id}`;

    try {
      await api.deletePrescription(token, deletedId);
      setDeleteModalOpen(false);
      setRxToDelete(null);
      fetchPrescriptions();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'prescriptions', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchPrescriptions();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete prescription');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.patientName) return;
    setPrescriptions([
      {
        id: Date.now(),
        rxId: `RX-78${Math.floor(10 + Math.random() * 89)}`,
        patient: formData.patientName,
        disease: formData.disease,
        medicines: formData.medicines,
        doctor: user?.name || 'Dr. Shazaib',
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      },
      ...prescriptions
    ]);
    setTotal(t => t + 1);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen">
        <TopNavbar setMobileOpen={setMobileOpen} onGlobalSearch={setSearchTerm} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Clinical Prescriptions <ClipboardList className="w-6 h-6 text-rose-500" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Issued medical prescriptions, therapeutic regimens, and drug dispensation.
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({ patientName: '', disease: 'Common Cold', medicines: 'Paracetamol, Cetirizine', dosageNotes: 'Twice daily after meals' });
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Prescription</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Total Prescriptions This Month: {total}</h2>
                <p className="text-xs text-slate-500">Official medical prescriptions record</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search prescription..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-600">
                    <th className="py-3 px-3 w-24">Rx ID</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Disease</th>
                    <th className="py-3 px-3">Prescribed Medicines</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {prescriptions.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-3 font-mono font-bold text-blue-600 text-xs">{r.rxId || `RX-${7800+idx}`}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{r.patient}</td>
                      <td className="py-3.5 px-3 text-slate-700 text-xs">{r.disease}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs">{r.medicines}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs">{r.doctor}</td>
                      <td className="py-3.5 px-3 text-slate-500 text-xs">{r.date}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          r.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {r.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button 
                            onClick={() => alert(`Prescription ${r.rxId}:\nPatient: ${r.patient}\nMedicines: ${r.medicines}`)}
                            className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer"
                            title="Print / View"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setRxToDelete(r);
                              setDeleteModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 inline-flex items-center justify-center cursor-pointer"
                            title="Delete Prescription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>Showing {prescriptions.length} entries of {total}</div>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#1e5adb] text-white flex items-center justify-center font-bold">
                  {currentPage}
                </button>
                <button
                  disabled={currentPage * 10 >= total}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <Footer />

        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Issue Prescription</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={formData.patientName}
                  onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosed Disease</label>
                <input
                  type="text"
                  value={formData.disease}
                  onChange={e => setFormData({ ...formData, disease: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribed Medicines</label>
                <input
                  type="text"
                  value={formData.medicines}
                  onChange={e => setFormData({ ...formData, medicines: e.target.value })}
                  placeholder="Paracetamol 500mg, Cetirizine 10mg"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={formData.dosageNotes}
                  onChange={e => setFormData({ ...formData, dosageNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                  Issue
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
          setRxToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={rxToDelete?.rxId ? `${rxToDelete.rxId} (${rxToDelete.patient})` : 'Prescription'}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />
    </div>
  );
}
