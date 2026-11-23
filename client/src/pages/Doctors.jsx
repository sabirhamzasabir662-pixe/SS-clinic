import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { UserCheck, Plus, Mail, Phone, Award, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function Doctors() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const fetchDoctors = async () => {
    try {
      const data = await api.getDoctors(token);
      setDoctorsList(data.doctors || []);
    } catch {
      // Fallback
      setDoctorsList([
        {
          id: 1,
          name: 'Dr. Shazaib',
          specialty: 'Chief Medical Officer & Physician',
          qualification: 'MBBS, FCPS (Medicine)',
          department: 'General & Internal Medicine',
          experience: '12 Years',
          avatar: '/assets/doctor_avatar_exact.png',
          email: 'dr.shazaib@shifaclinic.com',
          phone: '+92 300 8889991'
        },
        {
          id: 2,
          name: 'Dr. Ayesha Malik',
          specialty: 'Consultant Pediatrician',
          qualification: 'MBBS, MCPS (Pediatrics)',
          department: 'Pediatrics & Child Health',
          experience: '8 Years',
          avatar: '/assets/doctor_avatar_exact.png',
          email: 'dr.ayesha@shifaclinic.com',
          phone: '+92 300 8889992'
        },
        {
          id: 3,
          name: 'Dr. Usman Qureshi',
          specialty: 'Cardiologist',
          qualification: 'MBBS, Dip. Card, FACC',
          department: 'Cardiovascular Care',
          experience: '15 Years',
          avatar: '/assets/doctor_avatar_exact.png',
          email: 'dr.usman@shifaclinic.com',
          phone: '+92 300 8889993'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    const deletedId = doctorToDelete.id;
    const deletedName = doctorToDelete.name;

    try {
      await api.deleteDoctor(token, deletedId);
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
      fetchDoctors();

      showToast({
        message: 'Moved to Recycle Bin',
        type: 'info',
        actionText: 'Undo',
        onAction: async () => {
          try {
            await api.restoreItem(token, 'doctors', deletedId);
            showToast({ message: 'Item restored successfully', type: 'success' });
            fetchDoctors();
          } catch (err) {
            showToast({ message: err.message || 'Failed to restore', type: 'error' });
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to delete doctor');
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
                Medical Staff &amp; Doctors <UserCheck className="w-6 h-6 text-teal-600" />
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Clinical specialists, consultants, and attending practitioners at SS Shifa Clinic.
              </p>
            </div>
            <button 
              onClick={() => alert('Add Doctor modal')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medical Specialist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                No active doctors registered.
              </div>
            ) : (
              doctorsList.map((doc) => (
                <div key={doc.id || doc.name} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition relative group">
                  {/* Top Action Delete Button */}
                  <button
                    onClick={() => {
                      setDoctorToDelete(doc);
                      setDeleteModalOpen(true);
                    }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                    title="Delete Doctor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-4 mb-4 pr-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm shrink-0">
                      <img src={doc.avatar || '/assets/doctor_avatar_exact.png'} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.department}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.qualification} • {doc.experience} Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Footer />

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDoctorToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={doctorToDelete?.name}
        title="Move to Recycle Bin"
        message={`Move this item to the Recycle Bin? You can restore it later.`}
        confirmText="Move to Recycle Bin"
      />
    </div>
  );
}
