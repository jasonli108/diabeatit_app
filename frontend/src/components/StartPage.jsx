import React from 'react';
import illustration from '../assets/illustration.png';
import appIcon from '../assets/app_icon.png';

const StartPage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#43462A] flex flex-col items-center justify-center p-6 font-sans text-center">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#E0A64E] mb-3 tracking-tight">
          Welcome to Your Health Journey
        </h1>
        
        <p className="text-[#A19D7E] text-base leading-relaxed mb-8 px-4">
          Take control of your diabetes with personalized nutrition guidance. We're here to support you every step of the way.
        </p>
        
        {/* Illustration */}
        <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden mb-6 shadow-xl relative bg-[#2C2E1A] border border-[#5C5F3A]/30">
           <img 
             src={illustration} 
             alt="Healthy Food Illustration" 
             className="w-full h-full object-cover object-center scale-150"
           />
        </div>

        {/* App Icon */}
        <div className="mb-8">
          <img src={appIcon} alt="DiaBeat It Logo" className="w-16 h-16 rounded-2xl shadow-lg border border-[#E6DDB5]/20" />
        </div>

        {/* Button */}
        <button 
          onClick={onStart}
          className="w-full max-w-xs py-4 text-[#E6DDB5] font-bold text-lg tracking-widest uppercase hover:text-white transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default StartPage;
