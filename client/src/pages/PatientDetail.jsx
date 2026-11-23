import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import AddPrescriptionModal from '../components/AddPrescriptionModal';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Plus, 
  Printer, 
  ChevronLeft, 
  Clock, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch patient details
  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPatientDetail(token, id);
      setPatientData(data.patient);
      setDiseases(data.diseases || []);
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError(err.message || 'Failed to load patient profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id, token]);

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

  // Flatten all prescribed medicine items from all visits into a single chronological table (newest first)
  const flattenedMedicinesGiven = [];
  prescriptions.forEach((rx) => {
    if (Array.isArray(rx.items) && rx.items.length > 0) {
      rx.items.forEach((item, itemIdx) => {
        flattenedMedicinesGiven.push({
          date: rx.date || '2026-10-27',
          disease: rx.disease,
          rxId: rx.rxId || rx.rx_id,
          doctor: rx.doctor || 'Dr. Shazaib',
          medicineName: item.medicineName || item.medicine_name,
          dosage: item.dosage || '500mg',
          frequency: item.frequency || '3 times a day',
          duration: item.duration || '5 days',
          notes: item.notes || 'Take after meals',
          badgeIdx: itemIdx
        });
      });
    } else if (rx.medicines) {
      // Fallback for string-based medicines list
      const medsList = rx.medicines.split(',').map(m => m.trim());
      medsList.forEach((medName, mIdx) => {
        flattenedMedicinesGiven.push({
          date: rx.date || '2026-10-27',
          disease: rx.disease,
          rxId: rx.rxId || rx.rx_id,
          doctor: rx.doctor || 'Dr. Shazaib',
          medicineName: medName,
          dosage: '500mg',
          frequency: '3 times a day',
          duration: '5 days',
          notes: 'Take after meals',
          badgeIdx: mIdx
        });
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Layout */}
      <div className="flex-1 lg:pl-[258px] flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar with live patient search */}
        <TopNavbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => navigate('/patients')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1e5adb] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Patients List</span>
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium text-slate-500">Loading patient profile...</p>
            </div>
          ) : error || !patientData ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-red-100 text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="font-bold text-base">{error || 'Patient not found'}</p>
              <button
                onClick={() => navigate('/patients')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Return to Patients
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* 1. TOP CARD: Patient Demographics & Action Buttons */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6 sm:p-7">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start sm:items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0">
                      {patientData.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                          {patientData.name}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {patientData.gender} • {patientData.age} yrs
                        </span>
                        {patientData.bloodGroup && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            Blood Group: {patientData.bloodGroup}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-6 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{patientData.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patientData.address || 'Address not registered'}</span>
                        </div>
                      </div>

                      {/* Allergies Highlight */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Allergies:</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          patientData.allergies && patientData.allergies.toLowerCase() !== 'none'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {patientData.allergies || 'None recorded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: + Add Prescription & Print Prescription Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Print Prescription</span>
                    </button>

                    <button
                      onClick={() => setIsRxModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm transition"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Add Prescription</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* 2. SECTION: Diagnosed Disease(s) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Diagnosed Diseases
                    </h2>
                    <p className="text-xs text-slate-400">
                      Clinical conditions identified during patient visits
                    </p>
                  </div>
                </div>

                {diseases.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No diagnosed diseases recorded for this patient.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {diseases.map((d, dIdx) => (
                      <div 
                        key={dIdx}
                        className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc] hover:bg-blue-50/40 transition flex items-start justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-[#1e5adb]">
                            {d.diseaseName}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Diagnosed on: <strong>{d.latestDate}</strong></span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Attending: {d.doctor || 'Dr. Shazaib'}
                          </p>
                        </div>

                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. SECTION: Medicines Given (Table: Date, Disease, Medicine, Dosage, Frequency, Duration, Notes) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Medicines Given
                      </h2>
                      <p className="text-xs text-slate-400">
                        Detailed prescription records with dosages and frequencies (newest visit first)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    Total Prescribed Items: {flattenedMedicinesGiven.length}
                  </span>
                </div>

                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-600">
                        <th className="py-3 px-3 min-w-[110px]">Date</th>
                        <th className="py-3 px-3 min-w-[140px]">Disease</th>
                        <th className="py-3 px-3 min-w-[160px]">Medicine</th>
                        <th className="py-3 px-3 min-w-[100px]">Dosage</th>
                        <th className="py-3 px-3 min-w-[160px]">Frequency</th>
                        <th className="py-3 px-3 min-w-[100px]">Duration</th>
                        <th className="py-3 px-3 min-w-[180px]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {flattenedMedicinesGiven.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                            No prescribed medicines recorded yet. Click "+ Add Prescription" to issue medication.
                          </td>
                        </tr>
                      ) : (
                        flattenedMedicinesGiven.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            {/* Date */}
                            <td className="py-3.5 px-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {row.date}
                              </span>
                            </td>

                            {/* Disease */}
                            <td className="py-3.5 px-3 text-xs font-semibold text-slate-800">
                              {row.disease}
                            </td>

                            {/* Medicine as colored pill badge */}
                            <td className="py-3.5 px-3">
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold tracking-tight ${getBadgeStyle(row.badgeIdx)}`}>
                                {row.medicineName}
                              </span>
                            </td>

                            {/* Dosage */}
                            <td className="py-3.5 px-3 text-xs text-slate-700 font-medium">
                              {row.dosage}
                            </td>

                            {/* Frequency */}
                            <td className="py-3.5 px-3 text-xs text-slate-600">
                              {row.frequency}
                            </td>

                            {/* Duration */}
                            <td className="py-3.5 px-3 text-xs font-medium text-slate-700">
                              {row.duration}
                            </td>

                            {/* Notes */}
                            <td className="py-3.5 px-3 text-xs text-slate-500 italic">
                              {row.notes}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          <Footer />

        </main>
      </div>

      {/* Add Prescription Modal */}
      <AddPrescriptionModal
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        preselectedPatient={patientData}
        onSuccess={() => {
          fetchPatient();
        }}
      />

      {/* Official Prescription Print Preview Modal */}
      {showPrintModal && patientData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[95vh] overflow-y-auto">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Medical Prescription Slip</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#1e5adb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Print Now
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Prescription Template */}
            <div className="mt-4 p-6 border-2 border-slate-200 rounded-2xl print:border-none print:p-0">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <img src="/assets/login_logo_transparent.png" alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#0c2340]">
                      SS <span className="text-[#00a896]">Shifa Clinic</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Clinic Management &amp; Healthcare Center</p>
                    <p className="text-[11px] text-slate-400">Sector F-8/2, Islamabad • Phone: +92 51 2233445</p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-base font-bold text-slate-900">Dr. Shazaib</h3>
                  <p className="text-xs text-blue-600 font-semibold">Chief Medical Officer &amp; Physician</p>
                  <p className="text-[11px] text-slate-400">MBBS, FCPS (Medicine)</p>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs mb-5 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                  <span className="font-bold text-slate-800">{patientData.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AGE / GENDER</span>
                  <span className="font-bold text-slate-800">{patientData.age} yrs / {patientData.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BLOOD GROUP</span>
                  <span className="font-bold text-red-600">{patientData.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DATE</span>
                  <span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Allergies Notice */}
              {patientData.allergies && patientData.allergies.toLowerCase() !== 'none' && (
                <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Known Allergies:</strong> {patientData.allergies}</span>
                </div>
              )}

              {/* Rx Symbol */}
              <div className="text-2xl font-black text-blue-700 italic mb-3">℞</div>

              {/* Medicines Table */}
              <table className="w-full text-left border-collapse text-xs mb-8">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 px-2 w-8">#</th>
                    <th className="py-2 px-2">Medicine</th>
                    <th className="py-2 px-2">Dosage</th>
                    <th className="py-2 px-2">Frequency</th>
                    <th className="py-2 px-2">Duration</th>
                    <th className="py-2 px-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flattenedMedicinesGiven.slice(0, 8).map((med, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-2 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-bold text-slate-900">{med.medicineName}</td>
                      <td className="py-2.5 px-2 text-slate-700">{med.dosage}</td>
                      <td className="py-2.5 px-2 text-slate-700">{med.frequency}</td>
                      <td className="py-2.5 px-2 text-slate-700">{med.duration}</td>
                      <td className="py-2.5 px-2 text-slate-500 italic">{med.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signature area */}
              <div className="pt-8 flex justify-between items-end border-t border-slate-200">
                <div className="text-[11px] text-slate-400">
                  <p>• Take medicines exactly as prescribed.</p>
                  <p>• Keep all pharmaceuticals out of reach of children.</p>
                </div>
                <div className="text-center w-48">
                  <div className="border-b border-slate-400 w-full mb-1.5 h-12 flex items-end justify-center font-serif italic text-blue-900 font-bold">
                    Dr. Shazaib
                  </div>
                  <p className="text-xs font-bold text-slate-800">Dr. Shazaib</p>
                  <p className="text-[10px] text-slate-400">Authorized Medical Practitioner</p>
                </div>
              </div>

              {/* Developer Credit - printed prescription */}
              <div className="mt-6 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
                Developed by{' '}
                <span className="font-semibold" style={{ color: '#1E4FD8' }}>Hamza Sabir Shah</span>
              </div>

            </div>


          </div>
        </div>
      )}

    </div>
  );
}
