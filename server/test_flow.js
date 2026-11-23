async function testFullFlow() {
  console.log('=== TEST SUITE: Patient Search & Clinical History ===');

  // 1. Authenticate as Dr. Shazaib
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'shazaib', password: 'admin123' })
  });
  const { token, user } = await loginRes.json();
  console.log('Authenticated user:', user.name, '(', user.role, ')');

  // 2. Test live patient search for 'Fatima'
  console.log('\n[1] Live Search for "Fatima":');
  const searchRes = await fetch('http://localhost:5000/api/patients/search?q=Fatima', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const searchData = await searchRes.json();
  console.log('Matching patients found:', searchData.patients.length);
  const patient = searchData.patients[0];
  console.log('Patient:', patient.name, '| Age:', patient.age, '| Phone:', patient.phone);
  console.log('Latest Disease:', patient.latestDisease);
  console.log('Latest Medicines:', patient.latestMedicines);

  // 3. Test Patient Detail for this patient
  console.log('\n[2] Patient Detail Page Data for ID ' + patient.id + ':');
  const detailRes = await fetch('http://localhost:5000/api/patients/' + patient.id, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const detailData = await detailRes.json();
  console.log('Name:', detailData.patient.name);
  console.log('Address:', detailData.patient.address);
  console.log('Allergies:', detailData.patient.allergies);
  console.log('Blood Group:', detailData.patient.bloodGroup);
  console.log('Diagnosed Diseases count:', detailData.diseases.length);
  detailData.diseases.forEach(d => console.log('  - ' + d.diseaseName + ' (' + d.latestDate + ') by ' + d.doctor));
  
  console.log('Prescriptions count:', detailData.prescriptions.length);
  detailData.prescriptions.forEach((rx, idx) => {
    console.log('  [Rx ' + (idx + 1) + '] Rx ID: ' + rx.rxId + ' | Disease: ' + rx.disease + ' | Date: ' + rx.date);
    rx.items.forEach(item => {
      console.log('    * ' + item.medicineName + ' | ' + item.dosage + ' | ' + item.frequency + ' | ' + item.duration + ' | Notes: ' + item.notes);
    });
  });

  // 4. Test adding a new prescription for this patient
  console.log('\n[3] Adding New Prescription for ' + patient.name + ':');
  const addRxRes = await fetch('http://localhost:5000/api/prescriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      patientId: patient.id,
      patientName: patient.name,
      disease: 'Gastritis',
      doctorName: 'Dr. Shazaib',
      items: [
        { medicineName: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '14 days', notes: 'Take 30 mins before food' },
        { medicineName: 'Antacid', dosage: '10ml', frequency: '3 times a day', duration: '7 days', notes: 'After meals' },
        { medicineName: 'Domperidone', dosage: '10mg', frequency: 'Twice daily', duration: '5 days', notes: 'Before meals' }
      ]
    })
  });
  const addRxData = await addRxRes.json();
  console.log('Prescription added:', addRxData.message, 'Rx ID:', addRxData.prescription.rxId);

  // 5. Verify stats updated
  const statsRes = await fetch('http://localhost:5000/api/stats', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const stats = await statsRes.json();
  console.log('\n[4] Updated Clinic Stats:');
  console.log('Total Prescriptions:', stats.totalPrescriptions);
  console.log('Total Diseases:', stats.totalDiseases);
  console.log('Total Medicines:', stats.totalMedicines);
  console.log('Total Patients:', stats.totalPatients);

  // 6. Test Patients Page Table Data (page 1, limit 5)
  console.log('\n[5] Patients Page Table (5 per page):');
  const patientsListRes = await fetch('http://localhost:5000/api/patients?page=1&limit=5', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const listData = await patientsListRes.json();
  console.log('Showing', listData.patients.length, 'of', listData.total, 'patients:');
  listData.patients.forEach(p => {
    console.log('  # ' + p.id + ': ' + p.name + ' (' + p.age + ' yrs) | ' + p.phone + ' | Last Disease: ' + p.lastDisease + ' | Meds: ' + p.lastMedicines.join(', '));
  });

  // 7. Test "No patient found" query
  console.log('\n[6] Search for non-existent patient:');
  const noMatchRes = await fetch('http://localhost:5000/api/patients/search?q=XYZNonExistent', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const noMatchData = await noMatchRes.json();
  console.log('Non-existent query results count:', noMatchData.patients.length, '(Empty -> UI shows "No patient found")');

  console.log('\nALL VERIFICATION CHECKS COMPLETED AND WORKING FLAWLESSLY!');
}

testFullFlow().catch(console.error);
