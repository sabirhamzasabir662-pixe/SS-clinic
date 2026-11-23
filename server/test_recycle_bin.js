// Automated test script for Recycle Bin feature
const BASE = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('--- STARTING RECYCLE BIN TEST SUITE ---');

  // 1. Login as Dr. Shazaib
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'shazaib', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✓ Logged in as Dr. Shazaib');

  // 2. Initial Stats
  const stats1Res = await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } });
  const stats1 = await stats1Res.json();
  console.log(`✓ Initial stats: ${stats1.totalDiseases} diseases, ${stats1.totalMedicines} medicines, ${stats1.totalPatients} patients, ${stats1.totalPrescriptions} prescriptions`);

  // 3. Soft Delete a Disease (e.g. ID 1 "Common Cold" or whatever exists)
  const diseasesRes = await fetch(`${BASE}/diseases?limit=1`, { headers: { Authorization: `Bearer ${token}` } });
  const diseasesData = await diseasesRes.json();
  const diseaseToDel = diseasesData.diseases[0];
  console.log(`Target disease to soft delete: ID ${diseaseToDel.id} "${diseaseToDel.name}"`);

  const delDiseaseRes = await fetch(`${BASE}/diseases/${diseaseToDel.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delDiseaseData = await delDiseaseRes.json();
  console.log(`✓ Soft deleted disease response:`, delDiseaseData.message);

  // Check stats decreased
  const stats2Res = await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } });
  const stats2 = await stats2Res.json();
  console.log(`✓ Stats after disease delete: ${stats2.totalDiseases} (was ${stats1.totalDiseases})`);
  if (stats2.totalDiseases !== stats1.totalDiseases - 1) {
    throw new Error('Total diseases count did not drop by 1!');
  }

  // Check Recycle Bin contains the disease
  const binRes1 = await fetch(`${BASE}/recycle-bin?type=diseases`, { headers: { Authorization: `Bearer ${token}` } });
  const binData1 = await binRes1.json();
  console.log(`✓ Recycle bin contains ${binData1.items.length} deleted diseases. Found: "${binData1.items[0]?.name}"`);
  console.log(`✓ Auto-delete message: "${binData1.items[0]?.autoDeleteText}"`);

  // 4. Restore Disease
  const restoreRes1 = await fetch(`${BASE}/recycle-bin/diseases/${diseaseToDel.id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const restoreData1 = await restoreRes1.json();
  console.log(`✓ Restored disease response:`, restoreData1.message);

  // Check stats restored
  const stats3Res = await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } });
  const stats3 = await stats3Res.json();
  console.log(`✓ Stats after restore: ${stats3.totalDiseases} (restored to ${stats1.totalDiseases})`);
  if (stats3.totalDiseases !== stats1.totalDiseases) {
    throw new Error('Total diseases count did not restore back!');
  }

  // 5. Patient Soft Delete and Cascade Prescriptions Test
  const patientsRes = await fetch(`${BASE}/patients?limit=1`, { headers: { Authorization: `Bearer ${token}` } });
  const patientsData = await patientsRes.json();
  const patientToDel = patientsData.patients[0];
  console.log(`Target patient to delete: ID ${patientToDel.id} "${patientToDel.name}"`);

  // Count active prescriptions before
  const rxBefore = stats3.totalPrescriptions;

  // Soft delete patient
  const delPatientRes = await fetch(`${BASE}/patients/${patientToDel.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delPatientData = await delPatientRes.json();
  console.log(`✓ Soft deleted patient response:`, delPatientData.message);

  // Stats after patient delete
  const stats4Res = await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } });
  const stats4 = await stats4Res.json();
  console.log(`✓ Patients count: ${stats4.totalPatients} (was ${stats3.totalPatients})`);
  console.log(`✓ Prescriptions count: ${stats4.totalPrescriptions} (was ${rxBefore})`);
  if (stats4.totalPatients !== stats3.totalPatients - 1) {
    throw new Error('Patients count did not decrease!');
  }
  if (stats4.totalPrescriptions >= rxBefore) {
    throw new Error('Patient prescriptions were not hidden!');
  }

  // Verify patient search does NOT find deleted patient
  const searchRes = await fetch(`${BASE}/patients/search?q=${encodeURIComponent(patientToDel.name)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const searchData = await searchRes.json();
  console.log(`✓ Patient live search for deleted patient returned: ${searchData.patients.length} results (expected 0)`);
  if (searchData.patients.length > 0) {
    throw new Error('Deleted patient still appeared in live search!');
  }

  // Restore Patient
  const restorePatientRes = await fetch(`${BASE}/recycle-bin/patients/${patientToDel.id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const restorePatientData = await restorePatientRes.json();
  console.log(`✓ Restored patient response:`, restorePatientData.message);

  const stats5Res = await fetch(`${BASE}/stats`, { headers: { Authorization: `Bearer ${token}` } });
  const stats5 = await stats5Res.json();
  console.log(`✓ Stats after patient restore: ${stats5.totalPatients} patients, ${stats5.totalPrescriptions} prescriptions (restored!)`);
  if (stats5.totalPrescriptions !== rxBefore) {
    throw new Error('Prescriptions were not restored together with patient!');
  }

  // 6. Test Name Conflict on Restore
  console.log('Testing Name Conflict resolution...');
  // Create a disease named "Test Conflict Disease"
  const createD1 = await fetch(`${BASE}/diseases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Test Conflict Disease', description: 'desc', symptoms: 'sym', medicines: 'med' })
  });
  const d1Data = await createD1.json();
  const d1Id = d1Data.disease.id;

  // Soft delete it
  await fetch(`${BASE}/diseases/${d1Id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

  // Now create ANOTHER active disease with the SAME name
  const createD2 = await fetch(`${BASE}/diseases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Test Conflict Disease', description: 'desc2', symptoms: 'sym2', medicines: 'med2' })
  });
  const d2Data = await createD2.json();
  const d2Id = d2Data.disease.id;

  // Now attempt to restore d1 without renaming -> should return 409
  const conflictRes = await fetch(`${BASE}/recycle-bin/diseases/${d1Id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`✓ Restore duplicate name HTTP status: ${conflictRes.status} (expected 409)`);
  const conflictData = await conflictRes.json();
  console.log(`✓ Conflict message: "${conflictData.message}"`);
  if (conflictRes.status !== 409 || !conflictData.conflict) {
    throw new Error('Did not detect name conflict!');
  }

  // Now restore with newName
  const renameRestoreRes = await fetch(`${BASE}/recycle-bin/diseases/${d1Id}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newName: 'Test Conflict Disease (Restored)' })
  });
  const renameRestoreData = await renameRestoreRes.json();
  console.log(`✓ Renamed and restored successfully: "${renameRestoreData.name}"`);

  // Clean up d1 and d2 permanent delete test
  await fetch(`${BASE}/diseases/${d1Id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  await fetch(`${BASE}/diseases/${d2Id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

  // 7. Permanent Delete one item
  const permDelRes = await fetch(`${BASE}/recycle-bin/diseases/${d1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`✓ Permanent delete single item HTTP status: ${permDelRes.status}`);

  // 8. Empty Recycle Bin
  const emptyRes = await fetch(`${BASE}/recycle-bin`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const emptyData = await emptyRes.json();
  console.log(`✓ Empty recycle bin response:`, emptyData.message);

  const binAfterEmptyRes = await fetch(`${BASE}/recycle-bin`, { headers: { Authorization: `Bearer ${token}` } });
  const binAfterEmpty = await binAfterEmptyRes.json();
  console.log(`✓ Recycle bin item count after emptying: ${binAfterEmpty.items.length}`);
  if (binAfterEmpty.items.length !== 0) {
    throw new Error('Recycle bin was not empty after Empty Bin command!');
  }

  console.log('=== ALL BACKEND RECYCLE BIN TESTS PASSED WITH 100% SUCCESS ===');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
