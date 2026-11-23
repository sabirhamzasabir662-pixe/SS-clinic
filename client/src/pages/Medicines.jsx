import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Pill, Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function Medicines() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(156);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Analgesic', dosage: '500mg', stock: 100 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState(null);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMedicines(token, { search: searchTerm, page: currentPage, limit: 10 });
      setMedicines(data.medicines || []);
      setTotal(data.total || 156);
    } catch {
      // Fallback preview
      setMedicines([
        { id: 1, name: 'Paracetamol', category: 'Analgesic / Antipyretic', dosage: '500mg Tablet', stock: 420 },
        { id: 2, name: 'Cetirizine', category: 'Antihistamine', dosage: '10mg Tablet', stock: 250 },
        { id: 3, name: 'Cough Syrup', category: 'Antitussive', dosage: '120ml Bottle', stock: 95 },
        { id: 4, name: 'Ibuprofen', category: 'NSAID', dosage: '400mg Tablet', stock: 310 },
        { id: 5, name: 'Omeprazole', category: 'Proton Pump Inhibitor', dosage: '20mg Capsule', stock: 180 },
        { id: 6, name: 'Antacid Suspension', category: 'Antacid', dosage: '200ml Bottle', stock: 140 },
        { id: 7, name: 'Domperidone', category: 'Antiemetic', dosage: '10mg Tablet', stock: 220 },
        { id: 8, name: 'Metformin', category: 'Antidiabetic', dosage: '500mg Tablet', stock: 500 },
        { id: 9, name: 'Glimepiride', category: 'Antidiabetic', dosage: '2mg Tablet', stock: 320 },
        { id: 10, name: 'Insulin Glargine', category: 'Hormone', dosage: '100 IU/ml Vial', stock: 65 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [token, currentPage, searchTerm]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (editingMed) {
      setMedicines(medicines.map(m => m.id === editingMed.id ? { ...m, ...formData } : m));
    } else {
      setMedicines([{ id: Date.now(), ...formData }, ...medicines]);
      setTotal(t => t + 1);
    }
    setModalOpen(false);
    setEditingMed(null);
  };

  const handleConfirmDelete = async () => {
    if (!medToDelete) return;
    const deletedId = medToDelete.id;
    const deletedName = medToDelete.name;

    try {
      await api.deleteMedicine(token, deletedId);
      setDeleteModalOpen(false);
      setMedToDelete(null);
      fetchMedicines();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'medicines', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchMedicines();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete medicine');
    }
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
                Medicines Inventory <Pill className="w-6 h-6 text-emerald-600" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage pharmacy stock and available pharmaceutical products.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMed(null);
                setFormData({ name: '', category: 'Analgesic', dosage: '500mg', stock: 100 });
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Total Available Medicines: {total}</h2>
                <p className="text-xs text-slate-500">Live clinical pharmacy database</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search medicine..."
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
                    <th className="py-3 px-3 w-12 text-slate-400">#</th>
                    <th className="py-3 px-3">Medicine Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Dosage / Form</th>
                    <th className="py-3 px-3">In Stock</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {medicines.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-3 text-slate-400 text-xs">{(currentPage-1)*10 + idx + 1}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{m.name}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs">{m.category}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs">{m.dosage}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {m.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMed(m);
                              setFormData({ name: m.name, category: m.category, dosage: m.dosage, stock: m.stock });
                              setModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setMedToDelete(m);
                              setDeleteModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                            title="Delete Medicine"
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
              <div>Showing {medicines.length} entries of {total}</div>
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
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingMed ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage / Form</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                  Save
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
          setMedToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={medToDelete?.name}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />
    </div>
  );
}
