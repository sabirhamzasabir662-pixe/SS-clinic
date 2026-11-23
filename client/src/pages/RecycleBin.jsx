import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  X,
  Layers,
  Activity,
  Pill,
  Users,
  ClipboardList,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function RecycleBin() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    diseases: 0,
    medicines: 0,
    patients: 0,
    prescriptions: 0,
    appointments: 0,
    doctors: 0
  });

  // Modal states
  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [emptyBinModalOpen, setEmptyBinModalOpen] = useState(false);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictItem, setConflictItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [conflictError, setConflictError] = useState('');

  const isAdmin = user?.role === 'Administrator' || user?.username === 'shazaib';

  const tabs = [
    { id: 'all', label: 'All', icon: Layers, countKey: 'all' },
    { id: 'diseases', label: 'Diseases', icon: Activity, countKey: 'diseases' },
    { id: 'medicines', label: 'Medicines', icon: Pill, countKey: 'medicines' },
    { id: 'patients', label: 'Patients', icon: Users, countKey: 'patients' },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList, countKey: 'prescriptions' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, countKey: 'appointments' },
    { id: 'doctors', label: 'Doctors', icon: UserCheck, countKey: 'doctors' }
  ];

  // Fetch Recycle Bin items
  const fetchBinItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecycleBin(token, {
        type: activeTab,
        q: searchTerm,
        page: currentPage,
        limit: 5
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch recycle bin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBinItems();
  }, [token, activeTab, searchTerm, currentPage]);

  // Handle Restore
  const handleRestore = async (item, customName = null) => {
    try {
      await api.restoreItem(token, item.typeKey, item.id, customName);
      showToast({ message: 'Item restored successfully', type: 'success' });
      setConflictModalOpen(false);
      setConflictItem(null);
      setRenameValue('');
      setConflictError('');
      fetchBinItems();
    } catch (err) {
      if (err.conflict) {
        // Name conflict detected: prompt doctor to rename
        setConflictItem(item);
        setRenameValue(customName || `${item.rawName || item.name} (Restored)`);
        setConflictError(err.message || 'An active item with this name already exists.');
        setConflictModalOpen(true);
      } else {
        showToast({ message: err.message || 'Failed to restore item', type: 'error' });
      }
    }
  };

  // Handle Permanent Delete Single Item
  const handleConfirmPermanentDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deletePermanently(token, itemToDelete.typeKey, itemToDelete.id);
      showToast({ message: 'Item permanently deleted', type: 'info' });
      setPermanentDeleteModalOpen(false);
      setItemToDelete(null);
      fetchBinItems();
    } catch (err) {
      showToast({ message: err.message || 'Failed to delete item permanently', type: 'error' });
    }
  };

  // Handle Empty Bin
  const handleConfirmEmptyBin = async () => {
    try {
      await api.emptyRecycleBin(token);
      showToast({ message: 'Recycle Bin emptied successfully', type: 'info' });
      setEmptyBinModalOpen(false);
      fetchBinItems();
    } catch (err) {
      showToast({ message: err.message || 'Failed to empty recycle bin', type: 'error' });
    }
  };

  // Type Pill Badge styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Disease':
        return 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]';
      case 'Medicine':
        return 'bg-[#eaf8f1] text-[#059669] border border-[#a7f3d0]';
      case 'Patient':
        return 'bg-[#fef4eb] text-[#f97316] border border-[#fed7aa]';
      case 'Prescription':
        return 'bg-[#faf5ff] text-[#9333ea] border border-[#e9d5ff]';
      case 'Appointment':
        return 'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]';
      case 'Doctor':
        return 'bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4]';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
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
        {/* Top Navbar */}
        <TopNavbar 
          setMobileOpen={setMobileOpen} 
          onGlobalSearch={(q) => {
            setSearchTerm(q);
            setCurrentPage(1);
          }} 
        />

        {/* Recycle Bin Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Recycle Bin <Trash2 className="w-6 h-6 text-red-500" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Deleted items are kept here. You can restore them or delete them permanently.
              </p>
            </div>

            {/* Empty Recycle Bin Button */}
            <button
              onClick={() => setEmptyBinModalOpen(true)}
              disabled={counts.all === 0 || !isAdmin}
              title={!isAdmin ? 'Only Administrator can empty the bin' : 'Empty Recycle Bin'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 active:bg-red-100 font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-[2.2]" />
              <span>Empty Recycle Bin</span>
            </button>
          </div>

          {/* Filter Chips / Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = counts[tab.countKey] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1e5adb] text-white shadow-sm font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Card with Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {tabs.find(t => t.id === activeTab)?.label} in Bin
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Items remain in the bin for 30 days before being automatically cleaned up.
                </p>
              </div>

              {/* Search Deleted Items Input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search deleted items..."
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
                    <th className="py-3.5 px-3 min-w-[200px]">Name</th>
                    <th className="py-3.5 px-3 min-w-[120px]">Type</th>
                    <th className="py-3.5 px-3 min-w-[140px]">Deleted By</th>
                    <th className="py-3.5 px-3 min-w-[180px]">Deleted On</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading recycle bin...</span>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    /* Empty State */
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                          <Trash2 className="w-7 h-7 stroke-[1.8]" />
                        </div>
                        <h4 className="text-base font-bold text-slate-700 mb-1">
                          Recycle Bin is empty
                        </h4>
                        <p className="text-xs text-slate-400">
                          {searchTerm 
                            ? 'No deleted items matching your search.' 
                            : 'No deleted items found in this category.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    items.map((row, index) => {
                      const rowNumber = (currentPage - 1) * 5 + (index + 1);

                      return (
                        <tr key={`${row.typeKey}-${row.id}`} className="hover:bg-slate-50/70 transition-colors">
                          {/* Row Number */}
                          <td className="py-4 px-3 text-slate-400 font-normal text-xs sm:text-sm">
                            {rowNumber}
                          </td>

                          {/* Name */}
                          <td className="py-4 px-3 font-semibold text-slate-900">
                            {row.name}
                          </td>

                          {/* Type Colored Pill Badge */}
                          <td className="py-4 px-3">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold tracking-tight ${getTypeBadge(row.type)}`}>
                              {row.type}
                            </span>
                          </td>

                          {/* Deleted By */}
                          <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm">
                            {row.deleted_by || 'Dr. Shazaib'}
                          </td>

                          {/* Deleted On + Auto-deletes countdown */}
                          <td className="py-4 px-3">
                            <div className="text-xs sm:text-sm text-slate-700 font-medium">
                              {formatDate(row.deleted_at)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {row.autoDeleteText || 'Auto-deletes in 30 days'}
                            </div>
                          </td>

                          {/* Actions: Green Restore and Red Delete Permanently */}
                          <td className="py-4 px-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              {/* Green Restore Button */}
                              <button
                                onClick={() => handleRestore(row)}
                                className="w-8 h-8 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition flex items-center justify-center cursor-pointer"
                                title="Restore"
                              >
                                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>

                              {/* Red Delete Permanently Button */}
                              <button
                                onClick={() => {
                                  if (!isAdmin) {
                                    alert('Only the Administrator (Dr. Shazaib) can permanently delete items.');
                                    return;
                                  }
                                  setItemToDelete(row);
                                  setPermanentDeleteModalOpen(true);
                                }}
                                disabled={!isAdmin}
                                className={`w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 transition flex items-center justify-center cursor-pointer ${
                                  !isAdmin ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                                title={isAdmin ? 'Delete Permanently' : 'Admin only'}
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

            {/* Table Footer: Entries count and pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div>
                Showing {startIndex} to {endIndex} of {total} entries
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
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

      {/* Delete Permanently Modal */}
      <DeleteConfirmModal
        isOpen={permanentDeleteModalOpen}
        onClose={() => {
          setPermanentDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmPermanentDelete}
        itemName={itemToDelete?.name}
        title="Permanently Delete Item"
        message="This will permanently delete this item. This cannot be undone."
        confirmText="Yes, Delete Permanently"
        isPermanent={true}
      />

      {/* Empty Recycle Bin Modal */}
      <DeleteConfirmModal
        isOpen={emptyBinModalOpen}
        onClose={() => setEmptyBinModalOpen(false)}
        onConfirm={handleConfirmEmptyBin}
        title="Empty Recycle Bin"
        message="Are you sure you want to empty the Recycle Bin? This will permanently delete all items. This cannot be undone."
        confirmText="Yes, Empty Bin"
        isPermanent={true}
      />

      {/* Name Conflict Rename Modal */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setConflictModalOpen(false);
                setConflictItem(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Name Conflict Detected
            </h3>
            
            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
              {conflictError || `An active item with the same name already exists. Please rename this item before restoring:`}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!renameValue.trim()) return;
                handleRestore(conflictItem, renameValue.trim());
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Item Name:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConflictModalOpen(false);
                    setConflictItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Rename &amp; Restore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
