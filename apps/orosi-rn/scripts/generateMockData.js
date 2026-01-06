const fs = require('fs');
const path = require('path');

const Colors = {
  AppColors: {
    eventOrange: '#FF9100',
    eventDarkGreen: '#2E7D32',
    eventPink: '#E91E63',
    eventLightGreen: '#66BB6A',
    eventGrey: '#BDBDBD',
    eventBlue: '#2979FF',
    eventRed: '#FF1744',
    eventYellow: '#FFEA00',
    eventPurple: '#D500F9',
  }
};

const EVENT_COLORS = Object.values(Colors.AppColors);

const generateMockEvents = () => {
  const mockEvents = {};
  const continuingIds = {}; // Note: JSON doesn't support Set, so we use Array

  const addToMap = (date, event, isContinuing) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    if (!mockEvents[key]) {
      mockEvents[key] = [];
    }
    mockEvents[key].push({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString()
    });

    if (isContinuing) {
        if (!continuingIds[key]) {
            continuingIds[key] = [];
        }
        if (!continuingIds[key].includes(event.id)) {
            continuingIds[key].push(event.id);
        }
    }
  };

  const year = 2026;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 1, 28);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
       if (Math.random() < 0.3) { 
          const numEvents = Math.floor(Math.random() * 3) + 1; 
          
          for (let e = 0; e < numEvents; e++) {
              const duration = Math.floor(Math.random() * 5) + 1; 
              const color = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
              const id = Math.random().toString(36).substr(2, 9);
              const title = `Event ${d.getDate()}-${e+1}`;
              
              const eventStart = new Date(d);
              const eventEnd = new Date(d);
              eventEnd.setDate(eventEnd.getDate() + duration - 1);

              const eventObj = {
                  id,
                  title,
                  startTime: eventStart,
                  endTime: eventEnd,
                  color,
              };

              for (let i = 0; i < duration; i++) {
                  const currentDay = new Date(d);
                  currentDay.setDate(currentDay.getDate() + i);
                  if (currentDay > endDate) break;
                  addToMap(currentDay, eventObj, i > 0); 
              }
          }
       }
  }

  return { events: mockEvents, continuing: continuingIds };
};

const data = generateMockEvents();
const outputPath = path.join(__dirname, '../components/calendar/model/mockData.json');

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`Mock data written to ${outputPath}`);
