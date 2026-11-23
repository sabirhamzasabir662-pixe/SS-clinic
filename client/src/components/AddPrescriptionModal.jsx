import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddPrescriptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedPatient = null 
}) {
  const { token, user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatient, setSearchingPatient] = useState(false);

  const [diseasesList, setDiseasesList] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [selectedDiseaseName, setSelectedDiseaseName] = useState('');

  const [medicinesItems, setMedicinesItems] = useState([]);
  const [newMedName, setNewMedName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load all diseases on modal open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setSelectedPatient(preselectedPatient);
      setPatientSearch('');
      setPatientResults([]);
      setNewMedName('');
      
      const loadDiseases = async () => {
        try {
          const data = await api.getDiseases(token, { limit: 100 });
          setDiseasesList(data.diseases || []);
        } catch (err) {
          console.error('Failed to load diseases:', err);
        }
      };
      loadDiseases();
    }
  }, [isOpen, preselectedPatient, token]);

  // Live patient search when patient not preselected
  useEffect(() => {
    if (!preselectedPatient && patientSearch.trim().length >= 2) {
      setSearchingPatient(true);
      const timer = setTimeout(async () => {
        try {
          const data = await api.searchPatients(token, patientSearch.trim());
          setPatientResults(data.patients || []);
        } catch {
          setPatientResults([]);
        } finally {
          setSearchingPatient(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setPatientResults([]);
    }
  }, [patientSearch, preselectedPatient, token]);

  // When a disease is selected, auto-fill recommended medicines from Diseases table
  const handleDiseaseChange = (e) => {
    const dId = e.target.value;
    setSelectedDiseaseId(dId);

    const diseaseObj = diseasesList.find(d => String(d.id) === String(dId));
    if (diseaseObj) {
      setSelectedDiseaseName(diseaseObj.name);

      const medsArray = Array.isArray(diseaseObj.medicines) 
        ? diseaseObj.medicines 
        : (typeof diseaseObj.medicines === 'string' ? diseaseObj.medicines.split(',').map(m => m.trim()) : []);

      const items = medsArray.map(medName => {
        let dosage = '500mg';
        let freq = '3 times a day';
        let duration = '5 days';
        let notes = 'Take after meals';

        if (medName.includes('Syrup') || medName.includes('Suspension')) {
          dosage = '10ml';
          freq = '3 times a day';
          duration = '7 days';
          notes = 'Shake well before use';
        } else if (medName.includes('Omeprazole') || medName.includes('Pantoprazole') || medName.includes('Esomeprazole')) {
          dosage = '20mg';
          freq = 'Once daily before breakfast';
          duration = '14 days';
          notes = 'Take 30 mins before food';
        } else if (medName.includes('Metformin') || medName.includes('Glimepiride')) {
          dosage = '500mg';
          freq = 'Twice daily with meals';
          duration = '1 month';
          notes = 'Monitor blood glucose';
        } else if (medName.includes('Amlodipine') || medName.includes('Losartan') || medName.includes('Atenolol')) {
          dosage = '5mg';
          freq = 'Once daily morning';
          duration = '1 month';
          notes = 'Check blood pressure';
        } else if (medName.includes('Cetirizine') || medName.includes('Loratadine')) {
          dosage = '10mg';
          freq = 'Once daily at bedtime';
          duration = '5 days';
          notes = 'May cause drowsiness';
        } else if (medName.includes('Ibuprofen')) {
          dosage = '400mg';
          freq = 'Twice daily after meals';
          duration = '3 days';
          notes = 'Take with food';
        }

        return {
          medicineName: medName,
          dosage,
          frequency: freq,
          duration,
          notes
        };
      });

      setMedicinesItems(items);
    } else {
      setSelectedDiseaseName('');
      setMedicinesItems([]);
    }
  };

  const updateItemField = (index, field, value) => {
    const updated = [...medicinesItems];
    updated[index][field] = value;
    setMedicinesItems(updated);
  };

  const removeMedicineItem = (index) => {
    setMedicinesItems(medicinesItems.filter((_, i) => i !== index));
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setMedicinesItems([
      ...medicinesItems,
      {
        medicineName: newMedName.trim(),
        dosage: '500mg',
        frequency: '3 times a day',
        duration: '5 days',
        notes: 'Take after meals'
      }
    ]);
    setNewMedName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPatient) {
      setErrorMsg('Please select a patient.');
      return;
    }
    if (!selectedDiseaseName) {
      setErrorMsg('Please select a diagnosed disease.');
      return;
    }
    if (medicinesItems.length === 0) {
      setErrorMsg('Please add at least one prescribed medicine.');
      return;
    }

    setIsLoading(true);
    try {
      await api.createPrescription(token, {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        diseaseId: selectedDiseaseId ? parseInt(selectedDiseaseId) : null,
        disease: selectedDiseaseName,
        doctorName: user?.name || 'Dr. Shazaib',
        items: medicinesItems
      });

      setSuccessMsg('Prescription issued successfully!');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue prescription.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Issue New Prescription</h3>
            <p className="text-xs text-slate-500 mt-0.5">SS Shifa Clinic • Prescribed by {user?.name || 'Dr. Shazaib'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient *
            </label>
            {selectedPatient ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-blue-950">{selectedPatient.name}</p>
                  <p className="text-xs text-blue-700">
                    {selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.phone}
                  </p>
                </div>
                {!preselectedPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientSearch('');
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Type patient name to search..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Dropdown search results */}
                {patientResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {patientResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientResults([]);
                        }}
                        className="w-full p-2.5 text-left hover:bg-slate-50 transition flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.age} yrs • {p.phone}</p>
                        </div>
                        <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {p.latestDisease || 'Select'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {patientSearch.trim().length >= 2 && patientResults.length === 0 && !searchingPatient && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-400 z-20 shadow">
                    No matching patient found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Disease Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Diagnosed Disease *
            </label>
            <select
              value={selectedDiseaseId}
              onChange={handleDiseaseChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="">-- Select Disease to Auto-Fill Medicines --</option>
              {diseasesList.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Medicines Given Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Prescribed Medicines ({medicinesItems.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Auto-populated from clinic database
              </span>
            </div>

            {/* Medicines Items List */}
            {medicinesItems.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Select a disease above to auto-fill recommended medicines, or add custom medicines below.
              </div>
            ) : (
              <div className="space-y-2.5">
                {medicinesItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-900 bg-blue-100/80 text-blue-800 px-2.5 py-0.5 rounded-md">
                        {item.medicineName}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedicineItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Dosage</span>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => updateItemField(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 500mg"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Frequency</span>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => updateItemField(idx, 'frequency', e.target.value)}
                          placeholder="e.g. 3 times a day"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Duration</span>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateItemField(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Notes</span>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItemField(idx, 'notes', e.target.value)}
                          placeholder="e.g. After meals"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add custom medicine */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add another medicine (e.g. Vitamin C)..."
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save & Issue Prescription'}
          </button>
        </div>

      </div>
    </div>
  );
}
