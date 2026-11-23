import bcrypt from 'bcryptjs';
import { getDb, initSchema } from './db.js';

export async function seedDatabase() {
  console.log('Seeding SS Shifa Clinic Database...');
  const db = await initSchema();

  // 1. Seed Admin User
  const existingAdmin = db.queryOne("SELECT * FROM users WHERE username = 'shazaib'");
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    db.run(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ['Dr. Shazaib', 'shazaib', 'dr.shazaib@ssclinic.com', hashedPassword, 'Administrator']
    );
    console.log('Admin user created: username="shazaib", password="admin123"');
  }

  // 2. Seed 28 Diseases (5 from screenshot first)
  const diseaseCount = db.queryOne("SELECT COUNT(*) as count FROM diseases").count;
  if (diseaseCount < 28) {
    db.run("DELETE FROM diseases");

    const initialDiseases = [
      {
        name: 'Common Cold',
        description: 'Viral infection of upper respiratory tract',
        symptoms: 'Cough, Sore throat, Runny nose, Sneezing',
        medicines: 'Paracetamol, Cetirizine, Cough Syrup'
      },
      {
        name: 'Fever',
        description: 'Increase in body temperature',
        symptoms: 'High body temp, Chills, Headache, Weakness',
        medicines: 'Paracetamol, Ibuprofen'
      },
      {
        name: 'Gastritis',
        description: 'Inflammation of stomach lining',
        symptoms: 'Stomach pain, Nausea, Bloating, Loss of appetite',
        medicines: 'Omeprazole, Antacid, Domperidone'
      },
      {
        name: 'Diabetes',
        description: 'High blood sugar level disorder',
        symptoms: 'Increased thirst, Frequent urination, Fatigue',
        medicines: 'Metformin, Glimepiride, Insulin'
      },
      {
        name: 'Hypertension',
        description: 'High blood pressure condition',
        symptoms: 'Headache, Dizziness, Chest pain, Shortness',
        medicines: 'Amlodipine, Losartan, Atenolol'
      },
      {
        name: 'Asthma',
        description: 'Chronic inflammatory airway disease',
        symptoms: 'Wheezing, Shortness of breath, Chest tightness',
        medicines: 'Salbutamol, Fluticasone, Montelukast'
      },
      {
        name: 'Allergic Rhinitis',
        description: 'Nasal inflammation caused by allergens',
        symptoms: 'Sneezing, Watery eyes, Itchy nose, Congestion',
        medicines: 'Loratadine, Cetirizine, Fluticasone Nasal Spray'
      },
      {
        name: 'Bronchitis',
        description: 'Inflammation of the lining of bronchial tubes',
        symptoms: 'Cough with mucus, Fatigue, Slight fever, Chest discomfort',
        medicines: 'Amoxicillin, Dextromethorphan, Guaifenesin'
      },
      {
        name: 'Pneumonia',
        description: 'Infection that inflames air sacs in lungs',
        symptoms: 'Chest pain when breathing, Productive cough, High fever',
        medicines: 'Azithromycin, Ceftriaxone, Paracetamol'
      },
      {
        name: 'Migraine',
        description: 'Neurological headache condition with throbbing pain',
        symptoms: 'Severe headache, Nausea, Sensitivity to light and sound',
        medicines: 'Sumatriptan, Ibuprofen, Domperidone'
      },
      {
        name: 'Urinary Tract Infection (UTI)',
        description: 'Bacterial infection of urinary system',
        symptoms: 'Burning urination, Frequent urge, Pelvic pain',
        medicines: 'Ciprofloxacin, Nitrofurantoin, Phenazopyridine'
      },
      {
        name: 'Gastroenteritis',
        description: 'Intestinal infection marked by diarrhea and cramps',
        symptoms: 'Watery diarrhea, Abdominal cramps, Nausea, Dehydration',
        medicines: 'ORS (Oral Rehydration), Metronidazole, Zinc Sulfate'
      },
      {
        name: 'Tonsillitis',
        description: 'Inflammation of the pharyngeal tonsils',
        symptoms: 'Swollen tonsils, Painful swallowing, Tender lymph nodes',
        medicines: 'Penicillin V, Ibuprofen, Antiseptic Gargle'
      },
      {
        name: 'Sinusitis',
        description: 'Inflammation of the sinus cavities',
        symptoms: 'Facial pain, Nasal discharge, Reduced smell sense',
        medicines: 'Pseudoephedrine, Amoxicillin-Clavulanate, Saline Spray'
      },
      {
        name: 'GERD (Acid Reflux)',
        description: 'Chronic digestive disease of stomach acid flow',
        symptoms: 'Heartburn, Chest pain, Difficulty swallowing, Regurgitation',
        medicines: 'Esomeprazole, Famotidine, Gaviscon'
      },
      {
        name: 'Osteoarthritis',
        description: 'Degenerative joint disease of cartilage',
        symptoms: 'Joint pain, Stiffness, Loss of flexibility, Grating sensation',
        medicines: 'Naproxen, Glucosamine, Paracetamol'
      },
      {
        name: 'Rheumatoid Arthritis',
        description: 'Autoimmune inflammatory joint disorder',
        symptoms: 'Warm tender joints, Morning stiffness, Fatigue',
        medicines: 'Methotrexate, Hydroxychloroquine, Prednisone'
      },
      {
        name: 'Iron Deficiency Anemia',
        description: 'Lack of healthy red blood cells due to low iron',
        symptoms: 'Extreme fatigue, Pale skin, Weakness, Brittle nails',
        medicines: 'Ferrous Sulfate, Folic Acid, Vitamin C'
      },
      {
        name: 'Hypothyroidism',
        description: 'Underactive thyroid gland disorder',
        symptoms: 'Weight gain, Fatigue, Dry skin, Cold sensitivity',
        medicines: 'Levothyroxine, Selenium'
      },
      {
        name: 'Hyperthyroidism',
        description: 'Overactive thyroid produces excess hormone',
        symptoms: 'Weight loss, Rapid heartbeat, Sweating, Tremors',
        medicines: 'Methimazole, Propranolol'
      },
      {
        name: 'Eczema (Dermatitis)',
        description: 'Inflammatory itchy skin condition',
        symptoms: 'Dry itchy patches, Red inflamed skin, Rough scaly spots',
        medicines: 'Hydrocortisone, Emollient Cream, Antihistamines'
      },
      {
        name: 'Peptic Ulcer Disease',
        description: 'Sores developing on inside lining of stomach',
        symptoms: 'Burning stomach pain, Feeling full, Intolerance to fatty food',
        medicines: 'Pantoprazole, Clarithromycin, Amoxicillin'
      },
      {
        name: 'Otitis Media (Ear Infection)',
        description: 'Infection of the middle ear airspace',
        symptoms: 'Ear pain, Diminished hearing, Fluid drainage, Irritability',
        medicines: 'Amoxicillin, Acetaminophen, Antibiotic Ear Drops'
      },
      {
        name: 'Conjunctivitis (Pink Eye)',
        description: 'Inflammation of transparent membrane of eyelid',
        symptoms: 'Redness, Gritty feeling, Itchiness, Eye discharge',
        medicines: 'Tobramycin Eye Drops, Artificial Tears'
      },
      {
        name: 'Kidney Stones (Nephrolithiasis)',
        description: 'Hard deposits made of minerals and salts in kidney',
        symptoms: 'Severe sharp back flank pain, Pain on urination, Pink urine',
        medicines: 'Tamsulosin, Ketorolac, Hydration'
      },
      {
        name: 'Gout',
        description: 'Complex arthritis caused by uric acid crystals',
        symptoms: 'Sudden severe attacks of joint pain, Redness at big toe',
        medicines: 'Colchicine, Allopurinol, Indomethacin'
      },
      {
        name: 'Fatty Liver Disease',
        description: 'Accumulation of excess fat in liver cells',
        symptoms: 'Fatigue, Discomfort in upper right abdomen, Swelling',
        medicines: 'Vitamin E, Ursodeoxycholic Acid, Silymarin'
      },
      {
        name: 'COVID-19 / Viral Syndrome',
        description: 'Respiratory coronavirus viral infection',
        symptoms: 'Loss of taste, Dry cough, Shortness of breath, Chills',
        medicines: 'Paracetamol, Zinc, Vitamin C, Inhaled Budesonide'
      }
    ];

    for (const d of initialDiseases) {
      db.run(
        "INSERT INTO diseases (name, description, symptoms, medicines) VALUES (?, ?, ?, ?)",
        [d.name, d.description, d.symptoms, d.medicines]
      );
    }
    console.log(`Seeded ${initialDiseases.length} diseases.`);
  }

  // 3. Seed 156 Medicines
  const medCount = db.queryOne("SELECT COUNT(*) as count FROM medicines").count;
  if (medCount < 156) {
    db.run("DELETE FROM medicines");

    const medNames = [
      'Paracetamol', 'Cetirizine', 'Cough Syrup', 'Ibuprofen', 'Omeprazole', 
      'Antacid Suspension', 'Domperidone', 'Metformin', 'Glimepiride', 'Insulin Glargine', 
      'Amlodipine', 'Losartan', 'Atenolol', 'Amoxicillin', 'Azithromycin', 
      'Ciprofloxacin', 'Salbutamol', 'Fluticasone', 'Montelukast', 'Loratadine', 
      'Dextromethorphan', 'Guaifenesin', 'Ceftriaxone', 'Sumatriptan', 'Nitrofurantoin', 
      'Phenazopyridine', 'Oral Rehydration Salts', 'Metronidazole', 'Zinc Sulfate', 'Penicillin V', 
      'Pseudoephedrine', 'Amoxicillin-Clavulanate', 'Esomeprazole', 'Famotidine', 'Gaviscon', 
      'Naproxen', 'Glucosamine', 'Methotrexate', 'Hydroxychloroquine', 'Prednisone', 
      'Ferrous Sulfate', 'Folic Acid', 'Vitamin C', 'Levothyroxine', 'Methimazole', 
      'Propranolol', 'Hydrocortisone', 'Pantoprazole', 'Clarithromycin', 'Tobramycin'
    ];

    const categories = [
      'Analgesic / Antipyretic', 'Antihistamine', 'Antitussive', 'NSAID', 
      'Proton Pump Inhibitor', 'Antacid', 'Antiemetic', 'Antidiabetic', 
      'Cardiovascular / Antihypertensive', 'Antibiotic', 'Bronchodilator', 
      'Corticosteroid', 'Vitamins & Minerals', 'Endocrine / Thyroid', 'Dermatological'
    ];

    const dosages = ['500mg Tablet', '10mg Tablet', '20mg Capsule', '250mg Suspension', '100ml Syrup', '5mg Tablet', '40mg Tablet'];

    for (let i = 1; i <= 156; i++) {
      const name = i <= medNames.length ? medNames[i - 1] : `${medNames[(i % medNames.length)]} Extra-${Math.floor(i / medNames.length)}`;
      const cat = categories[i % categories.length];
      const dosage = dosages[i % dosages.length];
      const stock = Math.floor(50 + (i * 7) % 450);

      db.run(
        "INSERT INTO medicines (name, category, dosage, stock) VALUES (?, ?, ?, ?)",
        [name, cat, dosage, stock]
      );
    }
    console.log('Seeded 156 medicines.');
  }

  // 4. Seed 42 Patients (with address, allergies, blood group)
  const patientCount = db.queryOne("SELECT COUNT(*) as count FROM patients").count;
  const rxItemsCount = db.queryOne("SELECT COUNT(*) as count FROM prescription_items").count;

  if (patientCount < 42 || rxItemsCount === 0) {
    db.run("DELETE FROM prescription_items");
    db.run("DELETE FROM prescriptions");
    db.run("DELETE FROM patients");

    const samplePatients = [
      { name: 'Muhammad Ali', age: 34, gender: 'Male', phone: '+92 300 1234567', address: 'House 14, Street 5, F-8/2, Islamabad', allergies: 'Penicillin', blood_group: 'B+' },
      { name: 'Fatima Zahra', age: 28, gender: 'Female', phone: '+92 312 9876543', address: 'Flat 4B, Gulberg Heights, Lahore', allergies: 'Sulfa Drugs', blood_group: 'O+' },
      { name: 'Ahmad Khan', age: 45, gender: 'Male', phone: '+92 333 4567890', address: 'Sector G-9/1, Street 22, Islamabad', allergies: 'None', blood_group: 'A+' },
      { name: 'Zainab Bibi', age: 52, gender: 'Female', phone: '+92 301 2345678', address: 'Model Town Block C, Lahore', allergies: 'Aspirin', blood_group: 'AB+' },
      { name: 'Bilal Hassan', age: 22, gender: 'Male', phone: '+92 345 6789012', address: 'University Town, Peshawar', allergies: 'None', blood_group: 'O-' },
      { name: 'Ayesha Siddiqua', age: 31, gender: 'Female', phone: '+92 321 3456789', address: 'Saddar Bazar, Rawalpindi', allergies: 'Dust & Pollen', blood_group: 'B-' },
      { name: 'Tariq Mehmood', age: 60, gender: 'Male', phone: '+92 305 7890123', address: 'DHA Phase 5, Lahore', allergies: 'Ibuprofen', blood_group: 'A-' },
      { name: 'Hina Pervez', age: 26, gender: 'Female', phone: '+92 334 1122334', address: 'Bahria Town Phase 4, Rawalpindi', allergies: 'None', blood_group: 'O+' },
      { name: 'Usman Farooq', age: 38, gender: 'Male', phone: '+92 315 2233445', address: 'Hayatabad Phase 2, Peshawar', allergies: 'Ciprofloxacin', blood_group: 'B+' },
      { name: 'Maryam Noor', age: 19, gender: 'Female', phone: '+92 322 3344556', address: 'F-10 Markaz, Islamabad', allergies: 'None', blood_group: 'A+' }
    ];

    const firstNames = ['Hamza', 'Saad', 'Farhan', 'Kashif', 'Zeeshan', 'Naveed', 'Rashid', 'Sobia', 'Sadia', 'Noreen', 'Samina', 'Rabia'];
    const lastNames = ['Sheikh', 'Malik', 'Abbasi', 'Chaudhry', 'Bhatti', 'Ansari', 'Qureshi', 'Raza', 'Shah', 'Niazi'];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const allergyOptions = ['None', 'None', 'Penicillin', 'Sulfa drugs', 'Aspirin', 'NSAIDs', 'None', 'Lactose intolerance'];
    const cityAddresses = ['F-7/2, Islamabad', 'DHA Phase 6, Karachi', 'Gulberg III, Lahore', 'Cantt Area, Rawalpindi', 'Hayatabad, Peshawar', 'Wapda Town, Lahore', 'Satellite Town, Gujranwala'];

    for (let i = 1; i <= 42; i++) {
      let p;
      if (i <= samplePatients.length) {
        p = samplePatients[i - 1];
      } else {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[i % lastNames.length];
        const gender = (i % 2 === 0) ? 'Female' : 'Male';
        const age = 18 + (i * 3) % 60;
        const bg = bloodGroups[i % bloodGroups.length];
        const address = `House ${10 + i}, Street ${2 + (i % 8)}, ${cityAddresses[i % cityAddresses.length]}`;
        const allergies = allergyOptions[i % allergyOptions.length];
        p = {
          name: `${fn} ${ln}`,
          age,
          gender,
          phone: `+92 300 ${(1000000 + i * 2345).toString().slice(0, 7)}`,
          address,
          allergies,
          blood_group: bg
        };
      }
      db.run(
        "INSERT INTO patients (name, age, gender, phone, address, allergies, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.name, p.age, p.gender, p.phone, p.address, p.allergies, p.blood_group]
      );
    }
    console.log('Seeded 42 patients.');

    // Fetch all seeded patients, diseases, and medicines
    const allPatients = db.queryAll("SELECT * FROM patients ORDER BY id ASC");
    const allDiseases = db.queryAll("SELECT * FROM diseases ORDER BY id ASC");
    const allMedicines = db.queryAll("SELECT * FROM medicines ORDER BY id ASC");

    // Seed 78 Prescriptions linked to the 42 patients
    // 36 patients get 2 prescriptions (72), 6 patients get 1 prescription (6) = 78 prescriptions total!
    let rxCounter = 1;

    for (let pIdx = 0; pIdx < allPatients.length; pIdx++) {
      const patient = allPatients[pIdx];
      const numRx = pIdx < 36 ? 2 : 1;

      for (let rxIdx = 0; rxIdx < numRx; rxIdx++) {
        const rxIdStr = `RX-78${(rxCounter < 10 ? '0' : '') + rxCounter}`;
        const diseaseIndex = (pIdx * 3 + rxIdx * 7) % allDiseases.length;
        const disease = allDiseases[diseaseIndex];

        // Format dates: newest visits in late October 2026
        const day = 29 - Math.floor((rxCounter - 1) / 3);
        const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;

        // Get medicines recommended for this disease
        const diseaseMeds = disease.medicines ? disease.medicines.split(',').map(m => m.trim()) : ['Paracetamol'];
        const medsSummary = diseaseMeds.join(', ');

        db.run(
          "INSERT INTO prescriptions (rx_id, patient_id, patient_name, disease_id, disease, medicines, doctor_name, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [rxIdStr, patient.id, patient.name, disease.id, disease.name, medsSummary, 'Dr. Shazaib', 'Active', dateStr]
        );

        const newRx = db.queryOne("SELECT id FROM prescriptions ORDER BY id DESC LIMIT 1");

        // Seed Prescription Items for each medicine
        diseaseMeds.forEach((medName) => {
          const medObj = allMedicines.find(m => m.name.toLowerCase() === medName.toLowerCase());
          const medId = medObj ? medObj.id : null;
          
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
            notes = 'Take 30 minutes before meal';
          } else if (medName.includes('Metformin') || medName.includes('Glimepiride')) {
            dosage = '500mg';
            freq = 'Twice daily with meals';
            duration = '1 month';
            notes = 'Monitor blood glucose';
          } else if (medName.includes('Amlodipine') || medName.includes('Losartan') || medName.includes('Atenolol')) {
            dosage = '5mg';
            freq = 'Once daily morning';
            duration = '1 month';
            notes = 'Check blood pressure regularly';
          } else if (medName.includes('Cetirizine') || medName.includes('Loratadine')) {
            dosage = '10mg';
            freq = 'Once daily at bedtime';
            duration = '5 days';
            notes = 'May cause drowsiness';
          } else if (medName.includes('Ibuprofen') || medName.includes('Naproxen')) {
            dosage = '400mg';
            freq = 'Twice daily after meals';
            duration = '3 days';
            notes = 'Take with food or milk';
          }

          db.run(
            "INSERT INTO prescription_items (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newRx.id, medId, medName, dosage, freq, duration, notes]
          );
        });

        rxCounter++;
      }
    }
    console.log(`Seeded ${rxCounter - 1} prescriptions with detailed items across 42 patients.`);
  }

  // 5. Seed Appointments
  const apptCount = db.queryOne("SELECT COUNT(*) as count FROM appointments").count;
  if (apptCount === 0) {
    const initialAppointments = [
      { patient: 'Muhammad Ali', time: '10:00 AM', date: 'Today', doctor: 'Dr. Shazaib', type: 'General Checkup', status: 'Confirmed' },
      { patient: 'Fatima Zahra', time: '11:30 AM', date: 'Today', doctor: 'Dr. Shazaib', type: 'Follow Up', status: 'In Waiting' },
      { patient: 'Ahmad Khan', time: '01:00 PM', date: 'Today', doctor: 'Dr. Shazaib', type: 'Blood Pressure Check', status: 'Confirmed' },
      { patient: 'Zainab Bibi', time: '03:15 PM', date: 'Tomorrow', doctor: 'Dr. Shazaib', type: 'Diabetes Consultation', status: 'Scheduled' },
      { patient: 'Bilal Hassan', time: '04:30 PM', date: 'Tomorrow', doctor: 'Dr. Shazaib', type: 'Fever Review', status: 'Scheduled' }
    ];

    for (const a of initialAppointments) {
      db.run(
        "INSERT INTO appointments (patient, time, date, doctor, type, status) VALUES (?, ?, ?, ?, ?, ?)",
        [a.patient, a.time, a.date, a.doctor, a.type, a.status]
      );
    }
    console.log('Seeded 5 appointments.');
  }

  // 6. Seed Doctors
  const docCount = db.queryOne("SELECT COUNT(*) as count FROM doctors").count;
  if (docCount === 0) {
    const initialDoctors = [
      {
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
        name: 'Dr. Usman Qureshi',
        specialty: 'Cardiologist',
        qualification: 'MBBS, Dip. Card, FACC',
        department: 'Cardiovascular Care',
        experience: '15 Years',
        avatar: '/assets/doctor_avatar_exact.png',
        email: 'dr.usman@shifaclinic.com',
        phone: '+92 300 8889993'
      }
    ];

    for (const d of initialDoctors) {
      db.run(
        "INSERT INTO doctors (name, specialty, qualification, department, experience, avatar, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [d.name, d.specialty, d.qualification, d.department, d.experience, d.avatar, d.email, d.phone]
      );
    }
    console.log('Seeded 3 doctors.');
  }

  db.persist();
  console.log('Seeding completed successfully!');
}

// Run directly if invoked as script
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
