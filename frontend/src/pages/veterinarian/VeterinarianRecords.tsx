import { useState } from 'react';
import { medicalApi, type MedicalRecord } from '@/features/medical/medicalApi';

const VeterinarianRecords = () => {
  const [petId, setPetId] = useState('');
  const [records, setRecords] = useState<MedicalRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  const lookup = async () => {
    if (!petId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await medicalApi.getForPet(petId.trim());
      setRecords(data);
    } catch {
      setError('Could not find records for that pet ID.');
      setRecords(null);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async () => {
    if (!petId.trim() || !diagnosis.trim()) return;
    await medicalApi.addRecord({ petId: petId.trim(), diagnosis, treatment, notes });
    setDiagnosis('');
    setTreatment('');
    setNotes('');
    lookup();
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Medical Records</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
        Enter the pet's internal ID (visible in the owner's pet profile URL) to view or add records.
      </p>

      <div className="card mt-6">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Pet ID"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
          />
          <button onClick={lookup} disabled={loading} className="btn-primary shrink-0">
            {loading ? 'Looking up…' : 'Look up'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-coral-500">{error}</p>}
      </div>

      {records !== null && (
        <>
          <div className="card mt-6">
            <h3 className="mb-4 font-semibold">Add a new record</h3>
            <div className="space-y-3">
              <input className="input" placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              <input className="input" placeholder="Treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} />
              <textarea className="input" placeholder="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <button onClick={addRecord} className="btn-primary">Save record</button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-semibold">History</h3>
            {records.length === 0 ? (
              <div className="card text-center text-sm text-ink/60 dark:text-bone/60">No records yet for this pet.</div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec._id} className="card">
                    <p className="font-mono text-xs text-mist-500">{new Date(rec.visitDate).toLocaleDateString()}</p>
                    <p className="mt-1 font-medium">{rec.diagnosis}</p>
                    {rec.treatment && <p className="text-sm text-ink/70 dark:text-bone/70">Treatment: {rec.treatment}</p>}
                    {rec.notes && <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">{rec.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VeterinarianRecords;
