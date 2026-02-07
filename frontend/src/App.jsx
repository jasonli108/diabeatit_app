import { useState, useCallback } from 'react';
import StartPage from './components/StartPage';
import ProfileForm from './components/ProfileForm';
import CareModeSelection from './components/CareModeSelection';
import Dashboard from './components/Dashboard';
import HealthMetrics from './components/HealthMetrics';
import MealPlan from './components/MealPlan';
import ChatBox from './components/ChatBox';
import LoadingSpinner from './components/LoadingSpinner';
import { userApi, mealPlanApi } from './services/api';
import appIcon from './assets/app_icon.png';

// App steps
const STEPS = {
  START: 0,
  PROFILE: 1,
  CARE_MODE: 2,
  DASHBOARD: 3,
  METRICS: 4,
  MEAL_PLAN: 5,
};

function App() {
  // State management
  const [currentStep, setCurrentStep] = useState(STEPS.START);
  const [userId, setUserId] = useState(null);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Step 1: Handle profile data collection
   */
  const handleProfileSubmit = (profileData) => {
    setPendingProfile(profileData);
    setCurrentStep(STEPS.CARE_MODE);
  };

  /**
   * Step 2: Handle care mode selection and register
   */
  const handleCareModeSelect = async (diabeticType) => {
    if (!pendingProfile) return;
    
    setLoading(true);
    setError(null);

    try {
      const completeProfile = { ...pendingProfile, diabetic_type: diabeticType };
      setFullProfile(completeProfile);
      
      const response = await userApi.register(completeProfile);
      
      setUserId(response.user_id);
      setHealthMetrics(response.health_metrics);
      
      // Automatically generate initial meal plan
      const mealResponse = await mealPlanApi.generateDaily(response.user_id);
      setMealPlan(mealResponse.meal_plan);
      
      setCurrentStep(STEPS.DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed, please try again later');
      console.error('Registration error:', err);
      setCurrentStep(STEPS.CARE_MODE);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle meal plan generation (for refresh/updates)
   */
  const handleGenerateMealPlan = useCallback(async (preferences = null) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await mealPlanApi.generateDaily(userId, preferences);
      
      if (response.meal_plan?.error) {
        throw new Error(response.meal_plan.message || 'Failed to generate meal plan');
      }

      setMealPlan(response.meal_plan);
      setCurrentStep(STEPS.MEAL_PLAN);
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || 'Failed to generate meal plan';
      setError(msg);
      console.error('Meal plan generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Reset to start
   */
  const handleReset = useCallback(() => {
    setCurrentStep(STEPS.START);
    setUserId(null);
    setPendingProfile(null);
    setFullProfile(null);
    setHealthMetrics(null);
    setMealPlan(null);
    setError(null);
  }, []);

  /**
   * Go back one step
   */
  const handleBack = useCallback(() => {
    if (currentStep === STEPS.MEAL_PLAN) {
      setCurrentStep(STEPS.METRICS);
    } else if (currentStep === STEPS.METRICS) {
      setCurrentStep(STEPS.DASHBOARD);
    } else if (currentStep === STEPS.DASHBOARD) {
      // If we go back from dashboard, we might want to go to care mode
      setCurrentStep(STEPS.CARE_MODE);
    } else if (currentStep === STEPS.CARE_MODE) {
      setCurrentStep(STEPS.PROFILE);
    } else if (currentStep === STEPS.PROFILE) {
      setCurrentStep(STEPS.START);
    }
  }, [currentStep]);

  if (currentStep === STEPS.START) {
    return <StartPage onStart={() => setCurrentStep(STEPS.PROFILE)} />;
  }

  if (currentStep === STEPS.PROFILE) {
    return (
      <>
        {loading && <LoadingSpinner />}
        <ProfileForm 
          onSubmit={handleProfileSubmit} 
          loading={loading} 
          onBack={handleBack} 
        />
      </>
    );
  }

  if (currentStep === STEPS.CARE_MODE) {
    return (
      <div className="min-h-screen bg-[#43462A] flex items-center justify-center p-6">
        {loading && <LoadingSpinner />}
        <CareModeSelection 
          onSelect={handleCareModeSelect} 
          onBack={handleBack}
          loading={loading}
        />
      </div>
    );
  }

  if (currentStep === STEPS.DASHBOARD) {
    return (
      <Dashboard 
        healthMetrics={healthMetrics}
        profile={fullProfile}
        mealPlan={mealPlan}
        onStartOver={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="flex flex-col items-center mb-6">
          <img src={appIcon} alt="DiaBeat It Logo" className="w-16 h-16 mb-2 rounded-xl shadow-md" />
          <h1 className="text-2xl md:text-3xl font-bold text-green-700">
            DiaBeat It!
          </h1>
          <p className="text-gray-500 text-sm">
            Powered by Gemini AI
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && <LoadingSpinner />}

        {/* Step content */}
        <div className="animate-fade-in">
          {/* Metrics View (Optional Step) */}
          {currentStep === STEPS.METRICS && healthMetrics && (
            <div className="space-y-4">
              <HealthMetrics metrics={healthMetrics} />
              
              <button
                onClick={() => handleGenerateMealPlan()}
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <span>🤖</span>
                <span>Generate Today's Meals with AI</span>
              </button>

              <button
                onClick={handleBack}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Meal Plan & Chat */}
          {currentStep === STEPS.MEAL_PLAN && mealPlan && (
            <div className="space-y-4">
              <MealPlan 
                mealPlan={mealPlan} 
                dailyCarbsLimit={healthMetrics?.daily_carbs_limit} 
              />
              
              <ChatBox 
                userId={userId} 
                onMealPlanUpdate={(newPlan) => setMealPlan(newPlan)}
              />

              <button
                onClick={handleReset}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                ← Start Over
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>© 2024 DiaBeat It! | Google Hackathon Project</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
