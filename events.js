// events.js

(function () {
  const calendarRoot = document.getElementById("calendar-root");
  if (!calendarRoot) return;

  // State
  let currentDate = new Date(); // Start with current month
  const today = new Date();

  // Event Categories & Themes
  const categories = {
    community: "event-community",
    job: "event-job",
    education: "event-education",
    food: "event-food",
    health: "event-health",
    housing: "event-housing"
  };

  // Base Recurring Events Definition
  const recurringEvents = [
    { name: "Free Grocery Distribution", type: "food", time: "10:00 AM", recurring: { dayOfWeek: 2 } }, // Every Tuesday
    { name: "Resume Writing Workshop", type: "job", time: "2:00 PM", recurring: { dayOfWeek: 3 } }, // Every Wednesday
    { name: "Free Tech/Digital Skills", type: "education", time: "5:30 PM", recurring: { dayOfWeek: 4 } }, // Every Thursday
    { name: "SNAP/WIC Assistance", type: "food", time: "1:00 PM", recurring: { dayOfWeek: 1 } }, // Every Monday
    { name: "Substance Recovery Group", type: "health", time: "7:00 PM", recurring: { dayOfWeek: 5 } }, // Every Friday
    { name: "Community Resource Fair", type: "community", time: "9:00 AM", recurring: { dayOfWeek: 6, weekOfMonth: 1 } }, // 1st Saturday
    { name: "Free Dental/Vision Clinic", type: "health", time: "8:00 AM", recurring: { dayOfWeek: 6, weekOfMonth: 3 } }, // 3rd Saturday
    { name: "Tenant Rights Workshop", type: "housing", time: "6:00 PM", recurring: { dayOfWeek: 5, weekOfMonth: 2 } }, // 2nd Friday
    { name: "GED/Adult Literacy Class", type: "education", time: "10:00 AM", recurring: { dayOfWeek: 1 } }, // Every Monday
    { name: "Interview Prep Session", type: "job", time: "4:00 PM", recurring: { dayOfWeek: 2 } }, // Every Tuesday
    { name: "Mental Health Awareness", type: "health", time: "3:00 PM", recurring: { dayOfWeek: 4, weekOfMonth: 2 } }, // 2nd Thursday
    { name: "First-Time Homebuyer Seminar", type: "housing", time: "10:00 AM", recurring: { dayOfWeek: 6, weekOfMonth: 4 } }, // 4th Saturday
    { name: "Community Clean-up Day", type: "community", time: "8:00 AM", recurring: { dayOfWeek: 0, weekOfMonth: 2 } }, // 2nd Sunday
  ];

  // Specific one-off events for "always active" look, seeded by day of month
  const getDailyEvents = (year, month, day) => {
    const events = [];
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const weekOfMonth = Math.floor((day - 1) / 7) + 1;

    // Add recurring events
    recurringEvents.forEach(event => {
      if (event.recurring.dayOfWeek === dayOfWeek) {
        if (!event.recurring.weekOfMonth || event.recurring.weekOfMonth === weekOfMonth) {
          events.push(event);
        }
      }
    });

    // Add pseudo-random one-off events based on the date so it stays consistent
    const seed = year * 1000 + month * 100 + day;
    
    if (seed % 11 === 0) {
      events.push({ name: "Job Fair & Hiring Event", type: "job", time: "9:00 AM" });
    }
    if (seed % 17 === 0) {
      events.push({ name: "Financial Literacy Workshop", type: "education", time: "6:00 PM" });
    }
    if (seed % 23 === 0) {
      events.push({ name: "Emergency Rental Assistance", type: "housing", time: "1:00 PM" });
    }

    // Sort events by time (basic string sort works for AM/PM if formatted properly, but keeping it simple)
    return events;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Calculate dates to show
    const dates = [];
    
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      dates.push({
        year: month === 0 ? year - 1 : year,
        month: month === 0 ? 11 : month - 1,
        day: daysInPrevMonth - i,
        isOtherMonth: true
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        year,
        month,
        day: i,
        isOtherMonth: false
      });
    }

    // Next month padding (to fill the grid to 35 or 42 cells)
    const remainingCells = dates.length % 7 === 0 ? 0 : 7 - (dates.length % 7);
    const totalCells = dates.length + remainingCells < 35 ? 35 : (dates.length + remainingCells > 35 ? 42 : 35);
    const paddingEnd = totalCells - dates.length;

    for (let i = 1; i <= paddingEnd; i++) {
      dates.push({
        year: month === 11 ? year + 1 : year,
        month: month === 11 ? 0 : month + 1,
        day: i,
        isOtherMonth: true
      });
    }

    const html = `
      <div class="calendar-header">
        <div class="calendar-header-left">
          <div class="calendar-month-year">
            <h2 class="calendar-month-name">${monthNames[month]} ${year}</h2>
            <span class="calendar-date-range">
              ${monthNames[month].substring(0, 3)} 1, ${year} - ${monthNames[month].substring(0, 3)} ${daysInMonth}, ${year}
            </span>
          </div>
        </div>
        
        <div class="calendar-header-right">
          <div class="calendar-nav-group">
            <button class="calendar-btn icon-btn" id="prev-month" aria-label="Previous month">
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="calendar-btn" id="today-btn">Today</button>
            <button class="calendar-btn icon-btn" id="next-month" aria-label="Next month">
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
          
          <button class="calendar-btn-primary">
            <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
            New Event
          </button>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div class="calendar-weekday">Sun</div>
          <div class="calendar-weekday">Mon</div>
          <div class="calendar-weekday">Tue</div>
          <div class="calendar-weekday">Wed</div>
          <div class="calendar-weekday">Thu</div>
          <div class="calendar-weekday">Fri</div>
          <div class="calendar-weekday">Sat</div>
        </div>
        
        <div class="calendar-days">
          ${dates.map(date => {
            const isToday = date.year === today.getFullYear() && 
                            date.month === today.getMonth() && 
                            date.day === today.getDate();
            
            const dayEvents = getDailyEvents(date.year, date.month, date.day);
            
            return `
              <div class="calendar-day ${date.isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}">
                <div class="day-header">
                  <span class="day-number">${date.day}</span>
                </div>
                <div class="day-events">
                  ${dayEvents.map(event => `
                    <div class="event-chip ${categories[event.type]}" title="${event.name} at ${event.time}">
                      <span class="event-chip-name">${event.name}</span>
                      <span class="event-chip-time">${event.time}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    calendarRoot.innerHTML = html;

    // Attach event listeners
    document.getElementById("prev-month").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    document.getElementById("today-btn").addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });

    // Re-initialize icons
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Initial render
  renderCalendar();

})();
