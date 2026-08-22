import { useEffect, useState } from 'react';
import { adminApi } from '@/features/admin/adminApi';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getSettings().then(setSettings);
  }, []);

  const save = async (key: string, value: unknown) => {
    setSavingKey(key);
    try {
      await adminApi.updateSetting(key, value);
      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    } finally {
      setSavingKey(null);
    }
  };

  if (!settings) return <p className="font-mono text-sm text-mist-500">loading…</p>;

  const numericField = (key: string, label: string, unit: string) => (
    <div className="flex items-center justify-between border-b border-ink/5 py-3 last:border-0 dark:border-bone/5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-ink/50 dark:text-bone/50">Currently {String(settings[key])}{unit}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input w-24"
          defaultValue={Number(settings[key])}
          onBlur={(e) => save(key, Number(e.target.value))}
        />
        {savingKey === key && <span className="font-mono text-xs text-mist-500">saving…</span>}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">System Settings</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
        Tune the thresholds behind the IoT emergency detection engine and other platform behavior.
      </p>

      <div className="card mt-6">
        <h3 className="mb-2 font-semibold">Emergency detection</h3>
        {numericField('emergencyHighTempThresholdC', 'High temperature threshold', '°C')}
        {numericField('emergencyNoMovementMinutes', 'No-movement alert window', ' min')}
        {numericField('emergencyLowBatteryPercent', 'Low battery alert level', '%')}
      </div>

      <div className="card mt-6">
        <h3 className="mb-2 font-semibold">Found-report matching</h3>
        {numericField('foundReportMatchRadiusMeters', 'Match search radius', 'm')}
      </div>

      <div className="card mt-6">
        <h3 className="mb-2 font-semibold">Platform</h3>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">Maintenance mode</p>
            <p className="text-xs text-ink/50 dark:text-bone/50">Temporarily disables non-admin sign-in</p>
          </div>
          <button
            onClick={() => save('maintenanceMode', !settings.maintenanceMode)}
            className={settings.maintenanceMode ? 'btn-danger' : 'btn-secondary'}
          >
            {settings.maintenanceMode ? 'Enabled — click to disable' : 'Disabled — click to enable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
