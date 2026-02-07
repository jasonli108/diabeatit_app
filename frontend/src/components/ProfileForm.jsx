/**
 * Profile Form Component
 * Collects user health information for registration
 */

import { useState } from 'react';
import { Ruler, Scale, Dumbbell, ChevronRight, ArrowLeft } from 'lucide-react';
import { 
  DEFAULT_PROFILE 
} from '../utils/constants';

function ProfileForm({ onSubmit, loading, onBack }) {
  // Convert initial values
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Handle input change
   */
  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!heightFt || heightFt < 3 || heightFt > 8) {
      newErrors.height = 'Please enter a valid height';
    }
    if (weightLbs === '' || weightLbs < 50 || weightLbs > 700) {
      newErrors.weight = 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Convert back to cm and kg for backend
      const totalInches = (Number(heightFt) * 12) + Number(heightIn || 0);
      const heightCm = Math.round(totalInches * 2.54);
      const weightKg = Math.round(Number(weightLbs) / 2.20462);

      onSubmit({
        ...profile,
        height_cm: heightCm,
        weight_kg: weightKg
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#43462A] flex flex-col items-center justify-center p-8 font-sans text-[#E6DDB5]">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-semibold mb-3 text-[#E0A64E]">Your Health Metrics</h1>
        <p className="text-[#A19D7E] text-xl mb-12">Help us personalize your nutrition plan</p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Height Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#E6DDB5]">
              <Ruler size={24} className="text-[#D4B3FF] rotate-45" />
              <label className="text-xl font-medium">Height</label>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="Feet"
                  className="w-full bg-[#5C5F3A]/20 border border-[#5C5F3A] rounded-2xl p-5 text-xl text-[#E6DDB5] placeholder-[#A19D7E]/50 outline-none focus:border-[#E6DDB5]/40"
                />
                <span className="text-sm text-[#A19D7E] ml-1">Feet</span>
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="Inches"
                  className="w-full bg-[#5C5F3A]/20 border border-[#5C5F3A] rounded-2xl p-5 text-xl text-[#E6DDB5] placeholder-[#A19D7E]/50 outline-none focus:border-[#E6DDB5]/40"
                />
                <span className="text-sm text-[#A19D7E] ml-1">Inches</span>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#E6DDB5]">
              <Scale size={24} className="text-[#D4B3FF]" />
              <label className="text-xl font-medium">Weight (lbs)</label>
            </div>
            <input
              type="number"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              placeholder="Enter your weight in pounds"
              className="w-full bg-[#5C5F3A]/20 border border-[#5C5F3A] rounded-2xl p-5 text-xl text-[#E6DDB5] placeholder-[#A19D7E]/50 outline-none focus:border-[#E6DDB5]/40"
            />
          </div>

          {/* Workouts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#E6DDB5]">
              <Dumbbell size={24} className="text-[#D4B3FF]" />
              <label className="text-xl font-medium">Workouts per Week</label>
            </div>
            <div className="relative">
              <select
                value={profile.exercise_freq_per_week}
                onChange={(e) => handleChange('exercise_freq_per_week', Number(e.target.value))}
                className="w-full bg-[#1A1C10] border border-[#5C5F3A] rounded-2xl p-5 text-xl text-[#E6DDB5] appearance-none outline-none focus:border-[#E6DDB5]/40"
              >
                <option value="" disabled>Select your workout frequency</option>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'time' : 'times'} per week</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#A19D7E]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Error message if any */}
          {(errors.height || errors.weight) && (
             <p className="text-red-400 text-center">Please fill in your height and weight correctly</p>
          )}

          {/* Submit Button */}
          <div className="pt-10 flex flex-col items-center gap-10">
            <button
              type="submit"
              disabled={loading}
              className="text-[#E6DDB5] text-2xl hover:text-white transition-colors flex items-center gap-2"
            >
              {loading ? 'Calculating...' : 'Continue'} <span>→</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="text-[#A19D7E] text-xl hover:text-[#E6DDB5] transition-colors flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;