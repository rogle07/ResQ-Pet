import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const FosterApplication = () => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    homeType: '',
    hasOtherPets: '',
    familyAgrees: '',
    dedicatedHours: '',
    experience: '',
    whyFoster: '',
    fromDate: '',
    toDate: '',
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Foster Application</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Foster Application Form
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Apply to provide temporary shelter, feeding, and medical care for rescue animals in need.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-5 animate-fadeIn">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Thank you, <strong>{formData.fullName || 'Guardian'}</strong>! Our foster coordinators will review your home details and contact you via phone ({formData.phoneNumber || 'provided number'}) within 24-48 hours.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Link
                  to="/foster-home/requests"
                  className="rounded-xl bg-[#1e6f42] px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  View Foster Requests
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      fullName: '',
                      phoneNumber: '',
                      emailAddress: '',
                      address: '',
                      homeType: '',
                      hasOtherPets: '',
                      familyAgrees: '',
                      dedicatedHours: '',
                      experience: '',
                      whyFoster: '',
                      fromDate: '',
                      toDate: '',
                    });
                    setUploadedImage(null);
                  }}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Personal Information */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.verma@example.com"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Flat No, Building, Street, City, State"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Home & Environment */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                  Home Environment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Type of Residence <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.homeType}
                      onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select type</option>
                      <option value="Apartment / Flat">Apartment / Flat</option>
                      <option value="Independent House / Villa">Independent House / Villa</option>
                      <option value="Farmhouse / Sanctuary">Farmhouse / Sanctuary</option>
                      <option value="Gated Society with Garden">Gated Society with Garden</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Do you have existing pets? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.hasOtherPets}
                      onChange={(e) => setFormData({ ...formData, hasOtherPets: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="No pets">No pets currently</option>
                      <option value="Yes - Dogs">Yes - Dogs</option>
                      <option value="Yes - Cats">Yes - Cats</option>
                      <option value="Yes - Multiple Animals">Yes - Multiple Animals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      All household members agree? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.familyAgrees}
                      onChange={(e) => setFormData({ ...formData, familyAgrees: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes, everyone is supportive</option>
                      <option value="Living Alone">Living alone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Daily dedicated care time <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.dedicatedHours}
                      onChange={(e) => setFormData({ ...formData, dedicatedHours: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="2-4 hours">2 - 4 hours</option>
                      <option value="4-6 hours">4 - 6 hours</option>
                      <option value="6+ hours">6+ hours</option>
                      <option value="Full time">Full time (Work from home)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Experience & Motivation */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                  Experience & Motivation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Experience with pets <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select experience</option>
                      <option value="Beginner">Beginner (First-time pet caregiver)</option>
                      <option value="Intermediate">Intermediate (Have owned dogs/cats/pets)</option>
                      <option value="Expert">Expert (Previous foster parent / rescue volunteer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Why do you want to foster? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us what inspires you to care for foster pets..."
                      value={formData.whyFoster}
                      onChange={(e) => setFormData({ ...formData, whyFoster: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Upload (Optional) */}
              <div className="space-y-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                  Upload Home Photo (Optional)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload home or pet area photo to speed up verification</p>
                
                <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all dark:border-slate-700 dark:bg-slate-800/40">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {uploadedImage ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={uploadedImage}
                        alt="Home Area Preview"
                        className="h-28 w-44 rounded-xl object-cover shadow-sm border mb-2"
                      />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Photo Uploaded (Click to change)</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max. 5MB)</p>
                    </>
                  )}
                </label>
              </div>

              {/* Section 5: Availability */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                  Availability
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={formData.toDate}
                      onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1e6f42] py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 hover:bg-[#165a34] transition-all hover:scale-[1.005] disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FosterApplication;
