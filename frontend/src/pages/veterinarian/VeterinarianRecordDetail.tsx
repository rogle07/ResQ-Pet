import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Printer,
  Calendar,
  Phone,
  FileText,
  Download,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { INITIAL_MEDICAL_RECORDS, INITIAL_PRESCRIPTIONS } from '@/data/veterinarianMockData';
import { PrescriptionModal } from '@/components/veterinarian/PrescriptionModal';
import { VetPrescription } from '@/types/veterinarian';

export const VeterinarianRecordDetail = () => {
  const { id } = useParams<{ id: string }>();

  const record = INITIAL_MEDICAL_RECORDS.find((r) => r.id === id || r.recordId === id) || INITIAL_MEDICAL_RECORDS[0];

  const [selectedRx, setSelectedRx] = useState<VetPrescription | null>(null);
  const [nextDate, setNextDate] = useState(record.nextAppointmentDate || '2026-05-25');
  const [nextTime, setNextTime] = useState(record.nextAppointmentTime || '11:00 AM');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleSaved, setRescheduleSaved] = useState(false);

  const handleSaveReschedule = () => {
    setRescheduleSaved(true);
    setTimeout(() => {
      setRescheduleSaved(false);
      setIsRescheduling(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/veterinarian/records" className="hover:text-emerald-700">Medical Records</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">{record.recordId}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Medical Record Details
          </h1>
        </div>

        <button
          onClick={() => setSelectedRx(INITIAL_PRESCRIPTIONS[0])}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Printer className="h-4 w-4" /> View & Print Prescription
        </button>
      </div>

      {/* Main Grid: Left Detailed Medical Case & Right Sidebar (Attachments & Reschedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Record Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Summary Banner */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={record.image}
                  alt={record.petName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-xl font-black text-slate-900 dark:text-white">
                      {record.petName}
                    </h2>
                    <span className="text-xs text-slate-400">({record.species} • {record.age} • {record.breed})</span>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      ID: {record.petCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Record ID: <strong className="font-mono text-slate-800 dark:text-white">{record.recordId}</strong> • Date: {record.date}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attending Vet: <strong className="text-emerald-700 dark:text-emerald-400">{record.attendingVet}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Diagnosis & Symptoms */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clinical Diagnosis</span>
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  🩺 {record.diagnosis}
                </p>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Symptoms</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {record.symptoms.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Plan */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Treatment Plan</span>
              <div className="space-y-2">
                {record.treatmentPlan.map((plan, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{plan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prescribed Medications Table */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-emerald-600" /> Prescribed Medications
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold uppercase text-[10px] text-slate-400">
                  <tr>
                    <th className="p-3">Medicine</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {record.medications.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.medicine}</td>
                      <td className="p-3">{m.dosage}</td>
                      <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{m.duration}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Notes */}
          {record.notes && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Care & Dietary Notes</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {record.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Attachments | Next Appt | Emergency */}
        <div className="space-y-6">
          {/* Attachments Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" /> Attached Reports & Lab Scans
            </h3>

            <div className="space-y-2">
              {(record.attachments || [
                { name: 'skin_report1.jpg', size: '1.2 MB', type: 'image' },
                { name: 'skin_report2.jpg', size: '1.5 MB', type: 'image' },
                { name: 'lab_report.pdf', size: '420 KB', type: 'pdf' },
              ]).map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{att.name}</p>
                      <span className="text-[10px] text-slate-400">{att.size}</span>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Next Appointment Card with Inline Reschedule */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" /> Next Appointment
              </h3>
              {!isRescheduling && (
                <button
                  onClick={() => setIsRescheduling(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Reschedule
                </button>
              )}
            </div>

            {isRescheduling ? (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">New Date</label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Time Slot</label>
                  <select
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReschedule}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
                {rescheduleSaved && <p className="text-emerald-600 text-center font-bold">✓ Rescheduled!</p>}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                <p className="text-emerald-900 dark:text-emerald-300 font-extrabold text-sm">
                  {nextDate}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {nextTime} (Confirmed)
                </p>
              </div>
            )}
          </div>

          {/* Emergency 24x7 Contact Box */}
          <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 space-y-3">
            <h3 className="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-1.5">
              🚨 24x7 Emergency Contact
            </h3>
            <p className="text-xs text-red-800 dark:text-red-300">
              For acute distress, severe fever or wound reopening:
            </p>
            <p className="font-mono text-base font-black text-red-600 dark:text-red-400">
              +91 9695609898
            </p>
            <a
              href="tel:+919695609898"
              className="inline-flex items-center justify-center gap-1.5 w-full rounded-2xl bg-red-600 p-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" /> Call Emergency Unit
            </a>
          </div>
        </div>
      </div>

      <PrescriptionModal
        prescription={selectedRx}
        onClose={() => setSelectedRx(null)}
      />
    </div>
  );
};
export default VeterinarianRecordDetail;
