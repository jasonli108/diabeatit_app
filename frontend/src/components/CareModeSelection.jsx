import React, { useState } from 'react';
import { Scale, Target, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

const MODES = [
  {
    id: 'prediabetic', // Mapping to API value
    title: 'Lifestyle Balance',
    description: 'With the goal of prevention and daily stability, the priority is to control blood sugar fluctuations while maintaining dietary flexibility',
    icon: Scale,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30',
    selectedBorder: 'border-green-400',
  },
  {
    id: 'type2', // Mapping to API value
    title: 'Stable Glycemic Control',
    description: 'Suitable for people diagnosed with diabetes who need long term stable blood sugar control, the system will automatically manage the carbohydrates and portion sizes of each meal.',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    selectedBorder: 'border-blue-400',
  },
  {
    id: 'type1', // Mapping to API value
    title: 'Precision Protection',
    description: 'Prioritizing Organ Protection, this is suitable for people who need to pay special attention to sodium, protein or other nutritional restrictions',
    icon: Shield,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
    selectedBorder: 'border-purple-400',
  }
];

const CareModeSelection = ({ onSelect, onBack, loading }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleSubmit = () => {
    if (selectedMode) {
      onSelect(selectedMode);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans text-[#E6DDB5]">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Choose Your Care Mode</h2>
        <p className="text-[#A19D7E] text-lg">Select the approach that best fits your health goals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`text-left relative p-6 rounded-3xl border-2 transition-all duration-300 h-full flex flex-col
                ${isSelected 
                  ? `${mode.selectedBorder} bg-[#2C2E2B] scale-105 shadow-2xl shadow-black/50` 
                  : 'border-transparent bg-[#1A1B12]/40 hover:bg-[#1A1B12]/60 hover:border-[#5C5F3A]'
                }
              `}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${mode.bgColor}`}>
                <Icon size={28} className={mode.color} />
              </div>

              <h3 className={`text-xl font-bold mb-4 ${mode.color}`}>
                {mode.title}
              </h3>

              <p className="text-[#A19D7E] text-sm leading-relaxed">
                {mode.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#E6DDB5] shadow-[0_0_10px_rgba(230,221,181,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#A19D7E] font-bold uppercase tracking-widest text-sm hover:text-[#E6DDB5] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!selectedMode || loading}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all
            ${selectedMode 
              ? 'bg-[#3B3D21] text-[#E6DDB5] hover:bg-[#4B4E2A] hover:scale-105 shadow-lg' 
              : 'bg-[#1A1B12] text-[#5C5F3A] cursor-not-allowed'
            }
          `}
        >
          {loading ? 'Generating Personalized Plan...' : 'Continue to Dashboard'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default CareModeSelection;
