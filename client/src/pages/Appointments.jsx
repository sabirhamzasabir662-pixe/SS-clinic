import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function Appointments() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [apptToDelete, setApptToDelete] = useState(null);

  const fetchAppointments = async () => {
    try {
      const data = await api.getAppointments(token);
      setAppointments(data.appointments || []);
    } catch {
      // Fallback preview
      setAppointments([
        { id: 1, patient: 'Muhammad Ali', time: '10:00 AM', date: 'Today', doctor: 'Dr. Shazaib', type: 'General Checkup', status: 'Confirmed' },
        { id: 2, patient: 'Fatima Zahra', time: '11:30 AM', date: 'Today', doctor: 'Dr. Shazaib', type: 'Follow Up', status: 'In Waiting' },
        { id: 3, patient: 'Ahmad Khan', time: '01:00 PM', date: 'Today', doctor: 'Dr. Shazaib', type: 'Blood Pressure Check', status: 'Confirmed' },
        { id: 4, patient: 'Zainab Bibi', time: '03:15 PM', date: 'Tomorrow', doctor: 'Dr. Shazaib', type: 'Diabetes Consultation', status: 'Scheduled' },
        { id: 5, patient: 'Bilal Hassan', time: '04:30 PM', date: 'Tomorrow', doctor: 'Dr. Shazaib', type: 'Fever Review', status: 'Scheduled' }
      ]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleConfirmDelete = async () => {
    if (!apptToDelete) return;
    const deletedId = apptToDelete.id;
    const deletedPatient = apptToDelete.patient;

    try {
      await api.deleteAppointment(token, deletedId);
      setDeleteModalOpen(false);
      setApptToDelete(null);
      fetchAppointments();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'appointments', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchAppointments();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete appointment');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen">
        <TopNavbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Appointments Schedule <Calendar className="w-6 h-6 text-blue-600" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage doctor schedules, patient visits, and clinical queues.
              </p>
            </div>
            <button 
              onClick={() => alert('New appointment booking modal')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-600">
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Time &amp; Date</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Consultation Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No active appointments scheduled.
                      </td>
                    </tr>
                  ) : (
                    appointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{a.patient}</td>
                        <td className="py-3.5 px-3 text-slate-600 text-xs">
                          <span className="font-semibold text-slate-800">{a.time}</span> ({a.date})
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-xs">{a.doctor}</td>
                        <td className="py-3.5 px-3 text-slate-600 text-xs">{a.type}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button 
                              onClick={() => alert(`Marked ${a.patient} as checked in`)}
                              className="px-3 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium cursor-pointer"
                            >
                              Check In
                            </button>
                            <button 
                              onClick={() => {
                                setApptToDelete(a);
                                setDeleteModalOpen(true);
                              }}
                              className="w-7 h-7 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 inline-flex items-center justify-center cursor-pointer"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setApptToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={apptToDelete ? `${apptToDelete.patient} (${apptToDelete.type})` : 'Appointment'}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />
    </div>
  );
}
