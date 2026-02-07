import { useState, useCallback, useEffect } from 'react';
import { Bot, X } from 'lucide-react';
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
  // Helper to load initial state
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`diabeatit_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.warn('Failed to load state', e);
      return defaultValue;
    }
  };

  // State management with persistence
  const [currentStep, setCurrentStep] = useState(() => loadState('step', STEPS.START));
  const [userId, setUserId] = useState(() => loadState('userId', null));
  const [pendingProfile, setPendingProfile] = useState(() => loadState('pendingProfile', null));
  const [fullProfile, setFullProfile] = useState(() => loadState('fullProfile', null));
  const [healthMetrics, setHealthMetrics] = useState(() => loadState('metrics', null));
  const [mealPlan, setMealPlan] = useState(() => loadState('mealPlan', null));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Chat widget state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Persistence effects
  useEffect(() => localStorage.setItem('diabeatit_step', JSON.stringify(currentStep)), [currentStep]);
  useEffect(() => localStorage.setItem('diabeatit_userId', JSON.stringify(userId)), [userId]);
  useEffect(() => localStorage.setItem('diabeatit_pendingProfile', JSON.stringify(pendingProfile)), [pendingProfile]);
  useEffect(() => localStorage.setItem('diabeatit_fullProfile', JSON.stringify(fullProfile)), [fullProfile]);
  useEffect(() => localStorage.setItem('diabeatit_metrics', JSON.stringify(healthMetrics)), [healthMetrics]);
  useEffect(() => localStorage.setItem('diabeatit_mealPlan', JSON.stringify(mealPlan)), [mealPlan]);

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
      
      // Move to Dashboard immediately so user sees progress
      setCurrentStep(STEPS.DASHBOARD);
      
      // Automatically generate initial meal plan in background
      mealPlanApi.generateDaily(response.user_id)
        .then(mealResponse => {
           setMealPlan(mealResponse.meal_plan);
        })
        .catch(err => {
           console.error('Background meal plan generation failed:', err);
        });

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
    // Clear state
    setCurrentStep(STEPS.START);
    setUserId(null);
    setPendingProfile(null);
    setFullProfile(null);
    setHealthMetrics(null);
    setMealPlan(null);
    setError(null);
    setIsChatOpen(false);

    // Clear local storage
    localStorage.removeItem('diabeatit_step');
    localStorage.removeItem('diabeatit_userId');
    localStorage.removeItem('diabeatit_pendingProfile');
    localStorage.removeItem('diabeatit_fullProfile');
    localStorage.removeItem('diabeatit_metrics');
    localStorage.removeItem('diabeatit_mealPlan');
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

  // Helper to render current step content
  const renderStepContent = () => {
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

    // Default view (METRICS, MEAL_PLAN)
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
  };

  return (
    <div className="relative">
      {renderStepContent()}

      {/* Persistent Chat Widget (visible only on Dashboard) */}
      {userId && currentStep === STEPS.DASHBOARD && (
        <>
          {/* Chat Widget Window */}
          <div 
            className={`fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] z-[100] transition-all duration-300 transform ${isChatOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}
          >
            <div className="relative">
              {/* Close Button for Widget */}
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="absolute top-4 right-4 z-[110] p-1 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
                title="Close chat"
              >
                <X size={16} />
              </button>

              <ChatBox 
                userId={userId} 
                onMealPlanUpdate={(newPlan) => setMealPlan(newPlan)}
                onSetupClick={() => {
                  setIsChatOpen(false);
                  if (currentStep === STEPS.DASHBOARD || currentStep === STEPS.METRICS || currentStep === STEPS.MEAL_PLAN) {
                     handleReset();
                  }
                }}
              />
            </div>
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all z-[100] hover:scale-110 active:scale-95 flex items-center justify-center"
            title={isChatOpen ? "Close Assistant" : "Chat with AI Assistant"}
          >
            {isChatOpen ? <X size={24} /> : <Bot size={24} />}
          </button>
        </>
      )}
    </div>
  );
}

export default App;