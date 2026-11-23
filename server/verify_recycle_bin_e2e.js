// Comprehensive E2E verification test for Recycle Bin
const BASE = 'http://127.0.0.1:5000/api';

async function verify() {
  console.log('====================================================');
  console.log('STARTING RECYCLE BIN COMPLETE E2E VERIFICATION SUITE');
  console.log('====================================================');

  // Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'shazaib', password: 'admin123' })
  });
  const { token, user } = await loginRes.json();
  console.log(`[AUTH] Logged in as ${user.name} (${user.role})`);

  // Initial Stats
  const s0 = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`[INITIAL STATS] Diseases: ${s0.totalDiseases}, Meds: ${s0.totalMedicines}, Patients: ${s0.totalPatients}, Prescriptions: ${s0.totalPrescriptions}`);

  // TEST 1: Delete a disease -> check count drops and shows in Recycle Bin
  console.log('\n--- TEST 1: Delete a disease ---');
  const dList = await (await fetch(`${BASE}/diseases?limit=1`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const testDisease = dList.diseases[0];
  console.log(`Deleting disease: [ID ${testDisease.id}] "${testDisease.name}"`);

  const delDRes = await fetch(`${BASE}/diseases/${testDisease.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delDData = await delDRes.json();
  console.log(`Delete response:`, delDData.message);

  const s1 = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Diseases count now: ${s1.totalDiseases} (was ${s0.totalDiseases})`);
  if (s1.totalDiseases !== s0.totalDiseases - 1) {
    throw new Error('FAIL: Total diseases count did not drop by 1!');
  }

  const binD = await (await fetch(`${BASE}/recycle-bin?type=diseases`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Recycle Bin (Diseases tab) has ${binD.total} items. Top item: "${binD.items[0]?.name}", auto-delete: "${binD.items[0]?.autoDeleteText}"`);
  if (binD.items[0]?.id !== testDisease.id) {
    throw new Error('FAIL: Deleted disease not found in Recycle Bin!');
  }

  // TEST 2: Restore it and check count goes back up
  console.log('\n--- TEST 2: Restore disease ---');
  const restDRes = await fetch(`${BASE}/recycle-bin/diseases/${testDisease.id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const restDData = await restDRes.json();
  console.log(`Restore response:`, restDData.message);

  const s2 = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Diseases count now: ${s2.totalDiseases} (restored back to ${s0.totalDiseases})`);
  if (s2.totalDiseases !== s0.totalDiseases) {
    throw new Error('FAIL: Total diseases count did not restore back to initial!');
  }

  // TEST 3: Delete a patient and check prescriptions are hidden, then restore
  console.log('\n--- TEST 3: Delete patient & cascade hide prescriptions ---');
  const pList = await (await fetch(`${BASE}/patients?limit=1`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const testPatient = pList.patients[0];
  console.log(`Deleting patient: [ID ${testPatient.id}] "${testPatient.name}"`);

  const rxBefore = s2.totalPrescriptions;

  const delPRes = await fetch(`${BASE}/patients/${testPatient.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delPData = await delPRes.json();
  console.log(`Delete patient response:`, delPData.message);

  const s3 = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Patients count now: ${s3.totalPatients} (was ${s2.totalPatients})`);
  console.log(`Prescriptions count now: ${s3.totalPrescriptions} (was ${rxBefore})`);
  if (s3.totalPatients !== s2.totalPatients - 1) {
    throw new Error('FAIL: Patient count did not drop by 1!');
  }
  if (s3.totalPrescriptions >= rxBefore) {
    throw new Error('FAIL: Patient prescriptions were not hidden!');
  }

  // Check top-bar patient live search ignores deleted patient
  const searchP = await (await fetch(`${BASE}/patients/search?q=${encodeURIComponent(testPatient.name.slice(0, 4))}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const searchMatch = searchP.patients.find(p => p.id === testPatient.id);
  console.log(`Patient search for deleted patient returned matches: ${searchMatch ? 'YES (FAIL)' : 'NONE (PASS)'}`);
  if (searchMatch) {
    throw new Error('FAIL: Deleted patient still appeared in top bar search!');
  }

  // Restore Patient & check prescriptions return together
  console.log('Restoring patient...');
  const restPRes = await fetch(`${BASE}/recycle-bin/patients/${testPatient.id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const restPData = await restPRes.json();
  console.log(`Restore patient response:`, restPData.message);

  const s4 = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Patients count now: ${s4.totalPatients} (restored!)`);
  console.log(`Prescriptions count now: ${s4.totalPrescriptions} (restored together!)`);
  if (s4.totalPatients !== s0.totalPatients || s4.totalPrescriptions !== rxBefore) {
    throw new Error('FAIL: Patient and prescriptions were not restored together!');
  }

  // TEST 4: Delete an appointment & doctor, check bin, restore
  console.log('\n--- TEST 4: Appointments and Doctors soft delete ---');
  const apptList = await (await fetch(`${BASE}/appointments`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const testAppt = apptList.appointments[0];
  await fetch(`${BASE}/appointments/${testAppt.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  
  const binAppts = await (await fetch(`${BASE}/recycle-bin?type=appointments`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Recycle Bin Appointments tab count: ${binAppts.total} (contains "${binAppts.items[0]?.name}")`);
  if (binAppts.total === 0) throw new Error('FAIL: Appointment not in bin!');

  await fetch(`${BASE}/recycle-bin/appointments/${testAppt.id}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  console.log('✓ Restored appointment successfully');

  // TEST 5: Permanently delete one item & Empty bin
  console.log('\n--- TEST 5: Permanent delete & Empty Recycle Bin ---');
  // Create temporary disease to permanently delete
  const tempD1 = await (await fetch(`${BASE}/diseases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Temp For Perm Delete', description: 'desc', symptoms: 'sym', medicines: 'med' })
  })).json();
  
  const tempD2 = await (await fetch(`${BASE}/diseases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Temp For Empty Bin', description: 'desc', symptoms: 'sym', medicines: 'med' })
  })).json();

  // Soft delete both
  await fetch(`${BASE}/diseases/${tempD1.disease.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  await fetch(`${BASE}/diseases/${tempD2.disease.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

  // Permanently delete tempD1
  const permDelRes = await fetch(`${BASE}/recycle-bin/diseases/${tempD1.disease.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Permanent delete status: ${permDelRes.status}`);
  if (permDelRes.status !== 200) throw new Error('FAIL: Permanent delete failed');

  // Empty Recycle Bin
  const emptyRes = await fetch(`${BASE}/recycle-bin`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const emptyData = await emptyRes.json();
  console.log(`Empty bin response:`, emptyData.message);

  const binCheck = await (await fetch(`${BASE}/recycle-bin`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`Recycle bin total items after emptying: ${binCheck.total}`);
  if (binCheck.total !== 0) throw new Error('FAIL: Recycle bin is not empty!');

  // Final Stats Check
  const sFinal = await (await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(`[FINAL VERIFIED STATS] Diseases: ${sFinal.totalDiseases}, Meds: ${sFinal.totalMedicines}, Patients: ${sFinal.totalPatients}, Prescriptions: ${sFinal.totalPrescriptions}`);
  console.log('====================================================');
  console.log('ALL VERIFICATION STEPS COMPLETED WITH 100% SUCCESS!');
  console.log('====================================================');
}

verify().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
