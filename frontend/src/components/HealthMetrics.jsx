/**
 * Health Metrics Display Component
 * Shows calculated nutritional targets
 */

import { METRIC_CONFIG } from '../utils/constants';

function HealthMetrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="card animate-slide-up">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        📊 Your Daily Nutritional Targets
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {METRIC_CONFIG.map((config) => (
          <MetricCard
            key={config.key}
            value={metrics[config.key]}
            label={config.label}
            unit={config.unit}
            bgColor={config.color}
            textColor={config.textColor}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Tips</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Keep carbohydrates under {metrics.max_carbs_per_meal}g per meal</li>
          <li>• Prioritize low GI foods to avoid rapid blood sugar spikes</li>
          <li>• Ensure sufficient protein intake in every meal</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Single Metric Card
 */
function MetricCard({ value, label, unit, bgColor, textColor }) {
  return (
    <div className={`metric-card ${bgColor}`}>
      <div className={`text-2xl font-bold ${textColor}`}>
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

export default HealthMetrics;