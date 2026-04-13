import React, { useState, useRef, useEffect } from 'react';

function TimePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, minutes] = value ? value.split(':').map(Number) : [9, 0];
  
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const pickerRef = useRef(null);

  // Generate hours (1-12) and minutes (00-55 in 5-min increments)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
  const periodOptions = ['AM', 'PM'];

  // Convert 24h to 12h format
  const get12Hour = (h) => {
    if (h === 0) return 12;
    if (h > 12) return h - 12;
    return h;
  };

  const getPeriod = (h) => (h >= 12 ? 'PM' : 'AM');

  const [selectedHour, setSelectedHour] = useState(get12Hour(hours));
  const [selectedMinute, setSelectedMinute] = useState(Math.round(minutes / 5) * 5);
  const [selectedPeriod, setSelectedPeriod] = useState(getPeriod(hours));

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setSelectedHour(get12Hour(h));
      setSelectedMinute(Math.round(m / 5) * 5);
      setSelectedPeriod(getPeriod(h));
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll to selected value when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToSelected(hourRef, selectedHour, hourOptions);
        scrollToSelected(minuteRef, selectedMinute, minuteOptions);
      }, 50);
    }
  }, [isOpen]);

  const scrollToSelected = (ref, value, options) => {
    if (ref.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        const itemHeight = 44;
        ref.current.scrollTop = index * itemHeight;
      }
    }
  };

  const handleScroll = (ref, options, setter) => {
    if (ref.current) {
      const itemHeight = 44;
      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      setter(options[clampedIndex]);
    }
  };

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    
    const timeString = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange({ target: { name: label === 'Start Time' ? 'startTime' : 'endTime', value: timeString } });
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    const h = get12Hour(hours);
    const m = String(minutes).padStart(2, '0');
    const p = getPeriod(hours);
    return `${h}:${m} ${p}`;
  };

  return (
    <div className="time-picker-wrapper" ref={pickerRef}>
      <div 
        className="time-picker-display"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="time-value">{formatDisplayTime()}</span>
        <span className="time-picker-icon">🕐</span>
      </div>

      {isOpen && (
        <div className="time-picker-dropdown">
          <div className="time-picker-header">
            <button type="button" className="picker-cancel" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
            <span className="picker-title">Select Time</span>
            <button type="button" className="picker-confirm" onClick={handleConfirm}>
              Done
            </button>
          </div>
          
          <div className="time-picker-wheels">
            <div className="wheel-container">
              <div className="wheel-highlight"></div>
              
              {/* Hours wheel */}
              <div 
                className="time-wheel"
                ref={hourRef}
                onScroll={() => handleScroll(hourRef, hourOptions, setSelectedHour)}
              >
                <div className="wheel-padding"></div>
                {hourOptions.map((h) => (
                  <div 
                    key={h} 
                    className={`wheel-item ${selectedHour === h ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedHour(h);
                      scrollToSelected(hourRef, h, hourOptions);
                    }}
                  >
                    {h}
                  </div>
                ))}
                <div className="wheel-padding"></div>
              </div>

              {/* Minutes wheel */}
              <div 
                className="time-wheel"
                ref={minuteRef}
                onScroll={() => handleScroll(minuteRef, minuteOptions, setSelectedMinute)}
              >
                <div className="wheel-padding"></div>
                {minuteOptions.map((m) => (
                  <div 
                    key={m} 
                    className={`wheel-item ${selectedMinute === m ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMinute(m);
                      scrollToSelected(minuteRef, m, minuteOptions);
                    }}
                  >
                    {String(m).padStart(2, '0')}
                  </div>
                ))}
                <div className="wheel-padding"></div>
              </div>

              {/* AM/PM wheel */}
              <div className="time-wheel period-wheel">
                <div className="wheel-padding"></div>
                {periodOptions.map((p) => (
                  <div 
                    key={p} 
                    className={`wheel-item ${selectedPeriod === p ? 'selected' : ''}`}
                    onClick={() => setSelectedPeriod(p)}
                  >
                    {p}
                  </div>
                ))}
                <div className="wheel-padding"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;
