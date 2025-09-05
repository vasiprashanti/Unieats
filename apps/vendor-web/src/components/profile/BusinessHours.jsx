import React, { useState, useEffect } from 'react';

export default function BusinessHours({ initialHours, onSave }) {
  const [hours, setHours] = useState(initialHours || {
    monday: { open: true, openTime: '09:00', closeTime: '22:00' },
    tuesday: { open: true, openTime: '09:00', closeTime: '22:00' },
    wednesday: { open: true, openTime: '09:00', closeTime: '22:00' },
    thursday: { open: true, openTime: '09:00', closeTime: '22:00' },
    friday: { open: true, openTime: '09:00', closeTime: '23:00' },
    saturday: { open: true, openTime: '09:00', closeTime: '23:00' },
    sunday: { open: true, openTime: '10:00', closeTime: '22:00' }
  });
  const [saving, setSaving] = useState(false);

  // Update local state when initialHours changes
  useEffect(() => {
    if (initialHours) {
      setHours(initialHours);
    }
  }, [initialHours]);

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  const handleDayToggle = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        open: !prev[day].open
      }
    }));
  };

  const handleTimeChange = (day, type, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const applyMondayToAll = () => {
    const mondayHours = hours.monday;
    const newHours = {};
    days.forEach(({ key }) => {
      newHours[key] = { ...mondayHours };
    });
    setHours(newHours);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave(hours);
    } catch (error) {
      console.error('Failed to save hours:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Operating Hours</h2>
          <p className="text-muted text-sm">Set your restaurant's opening and closing times</p>
        </div>
        <button
          onClick={applyMondayToAll}
          className="px-3 py-1 text-sm border border-base rounded-lg hover:bg-accent transition-colors"
        >
          Apply Monday to All
        </button>
      </div>

      <div className="mb-6">
        <p className="text-muted text-sm mb-4">Set your restaurant's operating hours for each day</p>
        
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium">{label}</div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDayToggle(key)}
                  className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] ${
                    hours[key].open 
                      ? 'bg-[hsl(var(--primary))]' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      hours[key].open ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                
                <span className="text-sm w-12">
                  {hours[key].open ? 'Open' : 'Closed'}
                </span>
              </div>

              {hours[key].open && (
                <>
                  <select
                    value={hours[key].openTime}
                    onChange={(e) => handleTimeChange(key, 'openTime', e.target.value)}
                    className="px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] text-sm"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>

                  <span className="text-muted text-sm">to</span>

                  <select
                    value={hours[key].closeTime}
                    onChange={(e) => handleTimeChange(key, 'closeTime', e.target.value)}
                    className="px-3 py-2 border border-base rounded-lg bg-background focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] text-sm"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Business Hours
          </>
        )}
      </button>
    </div>
  );
}