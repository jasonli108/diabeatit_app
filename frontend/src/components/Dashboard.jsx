import React from 'react';
import { Shield, Heart, Activity, Scale, Utensils, Flame } from 'lucide-react';

// Helper to get readable mode name
const getModeName = (type) => {
  switch (type) {
    case 'type1': return 'Precision Protection';
    case 'type2': return 'Stable Glycemic Control';
    case 'prediabetic': return 'Lifestyle Balance';
    default: return 'General Health';
  }
};

const Dashboard = ({ healthMetrics, profile, mealPlan, onStartOver }) => {
  // Safe access to profile data
  const safeProfile = profile || {};
  const safeMetrics = healthMetrics || {};

  // Calculate BMI safely
  const bmi = safeProfile.height_cm && safeProfile.weight_kg 
    ? (safeProfile.weight_kg / Math.pow(safeProfile.height_cm / 100, 2)).toFixed(1)
    : '--';

  const weightLbs = safeProfile.weight_kg 
    ? Math.round(safeProfile.weight_kg * 2.20462) 
    : '--';

  const activityLevel = safeProfile.exercise_freq_per_week !== undefined
    ? `${safeProfile.exercise_freq_per_week}-${Math.min(safeProfile.exercise_freq_per_week + 1, 7)} times`
    : '--';

  return (
    <div className="bg-[#1C1C1E] min-h-screen font-sans text-[#E6DDB5] pb-24">
      {/* Header Card */}
      <div className="bg-[#3B3D21] p-6 rounded-[2rem] mb-8 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Your Health Dashboard</h1>
            <p className="text-[#A19D7E] text-xs">Personalized guidance for your diabetes management</p>
          </div>
          <button 
            onClick={onStartOver}
            className="text-[#A19D7E] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Start Over
          </button>
        </div>

        <div className="inline-flex items-center gap-3 bg-[#2C2E1A] p-3 pr-6 rounded-2xl border border-[#5C5F3A]/30">
          <div className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center text-white">
            <Shield size={18} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] text-[#A19D7E] uppercase font-bold tracking-wider mb-0.5">Your Current Mode</p>
            <p className="text-[#C084FC] text-sm font-bold">{getModeName(safeProfile.diabetic_type)}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-8 px-2">
        {/* BMI */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-[#A19D7E]">
            <Heart size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">BMI</span>
          </div>
          <p className="text-3xl font-bold text-[#C084FC] mb-1">{bmi}</p>
          <p className="text-[#A19D7E] text-[10px]">Body Mass Index</p>
        </div>

        {/* Calories */}
        <div className="flex flex-col border-l border-[#3B3D21] pl-4">
          <div className="flex items-center gap-2 mb-2 text-[#A19D7E]">
            <Flame size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Calories</span>
          </div>
          <p className="text-3xl font-bold text-[#C084FC] mb-1">
            {safeMetrics.daily_calories || '--'}
          </p>
          <p className="text-[#A19D7E] text-[10px]">Daily Target</p>
        </div>

        {/* Activity */}
        <div className="flex flex-col border-l border-[#3B3D21] pl-4">
          <div className="flex items-center gap-2 mb-2 text-[#A19D7E]">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Activity</span>
          </div>
          <p className="text-xl font-bold text-[#C084FC] mb-1 leading-tight">
            {activityLevel}
          </p>
          <p className="text-[#A19D7E] text-[10px]">Workout frequency</p>
        </div>

        {/* Weight */}
        <div className="flex flex-col border-l border-[#3B3D21] pl-4">
          <div className="flex items-center gap-2 mb-2 text-[#A19D7E]">
            <Scale size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
          </div>
          <p className="text-3xl font-bold text-[#C084FC] mb-1">
            {weightLbs}
          </p>
          <p className="text-[#A19D7E] text-[10px]">Pounds</p>
        </div>
      </div>

      {/* Nutrition Recommendations */}
      <div className="bg-[#3B3D21]/50 p-6 rounded-[2rem] mb-8 border border-[#5C5F3A]/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#C084FC]/20 flex items-center justify-center text-[#C084FC]">
            <Utensils size={16} />
          </div>
          <h2 className="text-sm font-bold text-[#E6DDB5] uppercase tracking-wide">Today's Nutrition Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecommendationItem 
            num="1" 
            text={`Track your carb intake: aim for ${safeMetrics.max_carbs_per_meal || 45}-${(safeMetrics.max_carbs_per_meal || 45) + 15}g per meal`} 
          />
          <RecommendationItem 
            num="2" 
            text="Choose low-glycemic foods: leafy greens, beans, non-starchy vegetables" 
            highlight="Choose"
          />
          <RecommendationItem 
            num="3" 
            text="Include omega-3 rich foods like salmon 2-3 times per week" 
          />
          <RecommendationItem 
            num="4" 
            text="Work with your healthcare team to adjust insulin based on meals" 
          />
        </div>
      </div>

      {/* Meal Plan Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#C084FC]/20 flex items-center justify-center text-[#C084FC]">
            <Utensils size={16} />
          </div>
          <h2 className="text-sm font-bold text-[#E6DDB5] uppercase tracking-wide">Your Personalized Meal Plan</h2>
        </div>

        <div className="space-y-6">
          {/* Check if meal plan is loaded and has valid structure */}
          {mealPlan && mealPlan.meal_plan ? (
            <>
              <MealCard 
                type="Breakfast" 
                title="Organ-Protective Morning"
                mealData={mealPlan.meal_plan.breakfast} 
              />
              <MealCard 
                type="Lunch" 
                title="Nutrient-Balanced Lunch"
                mealData={mealPlan.meal_plan.lunch} 
              />
              <MealCard 
                type="Dinner" 
                title="Protective Evening Meal"
                mealData={mealPlan.meal_plan.dinner} 
              />
            </>
          ) : (
            <div className="text-center p-8 bg-[#2C2E1A] rounded-2xl border border-[#5C5F3A]/30 border-dashed animate-pulse">
              <div className="mb-3 text-4xl">🥗</div>
              <p className="text-[#A19D7E] font-medium">Generating your personalized meal plan...</p>
              <p className="text-[#5C5F3A] text-xs mt-2">This uses AI to match your exact health metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <div className="mb-4 text-[#E6DDB5] animate-pulse">
           <Heart size={32} fill="currentColor" className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold mb-2">You're Taking Control!</h3>
        <p className="text-[#A19D7E] text-xs max-w-md mx-auto leading-relaxed px-4">
          Every healthy choice you make is a step toward better health. 
          Remember, managing diabetes is a journey, and you're doing great by 
          staying informed and proactive.
        </p>
      </div>
    </div>
  );
};

const RecommendationItem = ({ num, text, highlight }) => {
  // Safer highlight logic
  let content = text;
  if (highlight && typeof text === 'string' && text.includes(highlight)) {
    const parts = text.split(highlight);
    content = (
      <span>
        <span className="text-[#60A5FA] font-bold">{highlight}</span>
        {parts[1]}
      </span>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-md bg-[#6D28D9] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
        {num}
      </div>
      <p className="text-[#E6DDB5] text-sm leading-relaxed font-medium">
        {content}
      </p>
    </div>
  );
};

const MealCard = ({ type, title, mealData }) => {
  if (!mealData || !mealData.recipes || mealData.recipes.length === 0) return null;

  const mainRecipe = mealData.recipes[0]; // Assuming first recipe is main
  const description = mainRecipe.name || "Healthy option";
  const carbs = mainRecipe.carbs || 0;
  const subtext = `Low sodium, controlled protein (${carbs}g carbs)`;

  return (
    <div className="bg-transparent px-2">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-[#4C1D95] text-[#C084FC] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          {type}
        </span>
        <span className="text-[#C084FC] text-sm font-medium tracking-wide">
          {title}
        </span>
      </div>
      
      <p className="text-[#E6DDB5] mb-1 font-medium text-lg">
        {description}
      </p>
      
      <p className="text-[#A19D7E] text-xs italic">
        {subtext}
      </p>
    </div>
  );
};

export default Dashboard;