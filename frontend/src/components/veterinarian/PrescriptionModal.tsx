import React from 'react';
import { X, Printer, Stethoscope, PawPrint } from 'lucide-react';
import { VetPrescription } from '@/types/veterinarian';

interface PrescriptionModalProps {
  prescription: VetPrescription | null;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ prescription, onClose }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/60 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Stethoscope className="h-4 w-4 text-emerald-600" />
            Digital Prescription Preview
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print Rx
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Rx Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 space-y-6 print:p-0 print:bg-white print:text-black">
          {/* Clinic & Doctor Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e6f42] text-white">
                  <PawPrint className="h-4 w-4 fill-current" />
                </div>
                <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-400">ResQPet Central Hospital</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mall Road Medical Center, Nainital, Uttarakhand • Tel: +91 9695609898
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{prescription.doctorName}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">BVSc & AH, MVSc (Surgery & Radiology)</p>
              <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">Reg: VET-IN-2018-8472</p>
            </div>
          </div>

          {/* Patient Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient</span>
              <p className="font-bold text-slate-800 dark:text-white">{prescription.petName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Owner</span>
              <p className="font-bold text-slate-800 dark:text-white">{prescription.ownerName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
              <p className="font-bold text-slate-800 dark:text-white">{prescription.date}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rx Number</span>
              <p className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{prescription.prescriptionNumber}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Diagnosis</span>
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40 font-semibold text-emerald-900 dark:text-emerald-200">
              🩺 {prescription.diagnosis}
            </div>
          </div>

          {/* Rx Medications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-2xl font-black text-emerald-700 dark:text-emerald-400">℞</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Prescribed Medication</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {prescription.medications.map((med, idx) => (
                    <tr key={med.id}>
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{med.medicine}</td>
                      <td className="p-3">{med.dosage}</td>
                      <td className="p-3 font-medium text-emerald-700 dark:text-emerald-400">{med.duration}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Instructions */}
          {prescription.instructions && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Dietary & Home Care Advice:</span>
              <p className="text-amber-800 dark:text-amber-200">{prescription.instructions}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="flex items-end justify-between pt-8 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="text-[11px] text-slate-400">
              <p>Emergency 24x7 Helpline: +91 9695609898</p>
              <p>Valid for 30 days from date of issue.</p>
            </div>
            <div className="text-center">
              <div className="text-lg text-emerald-800 dark:text-emerald-400 italic">Dr. Neeraj Sharma</div>
              <div className="w-32 border-t border-slate-400 dark:border-slate-600 mx-auto mt-1" />
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrescriptionModal;
