const AppColors = {
  primary: '#00D656', // Vibrant Green
  backgroundLight: '#FFFFFF',
  backgroundDark: '#102216',
  gridLight: '#F5F5F5',
  gridDark: '#1F2E25',
  
  // Event Colors (20 distinctive colors)
  eventOrange: '#FF9100',
  eventDarkGreen: '#2E7D32',
  eventPink: '#E91E63',
  eventLightGreen: '#66BB6A',
  eventGrey: '#BDBDBD',
  eventBlue: '#2979FF',
  eventRed: '#FF1744',
  eventYellow: '#FFEA00',
  eventPurple: '#D500F9',
  eventCyan: '#00E5FF',
  eventTeal: '#1DE9B6',
  eventLime: '#C6FF00',
  eventAmber: '#FFC400',
  eventDeepPurple: '#651FFF',
  eventIndigo: '#3D5AFE',
  eventLightBlue: '#00B0FF',
  eventDeepOrange: '#FF3D00',
  eventBrown: '#8D6E63',
  eventBlueGrey: '#78909C',
  eventMint: '#69F0AE',
};

const EVENT_COLOR_VALUES = [
  AppColors.eventOrange,
  AppColors.eventDarkGreen,
  AppColors.eventPink,
  AppColors.eventLightGreen,
  AppColors.eventGrey,
  AppColors.eventBlue,
  AppColors.eventRed,
  AppColors.eventYellow,
  AppColors.eventPurple,
  AppColors.eventCyan,
  AppColors.eventTeal,
  AppColors.eventLime,
  AppColors.eventAmber,
  AppColors.eventDeepPurple,
  AppColors.eventIndigo,
  AppColors.eventLightBlue,
  AppColors.eventDeepOrange,
  AppColors.eventBrown,
  AppColors.eventBlueGrey,
  AppColors.eventMint,
];

const getRandomEventColor = () => {
    return EVENT_COLOR_VALUES[Math.floor(Math.random() * EVENT_COLOR_VALUES.length)];
};

export default {
  AppColors,
  getRandomEventColor,
  light: {
    text: '#000',
    background: AppColors.backgroundLight,
    tableCellEmpty: '#fafafaff',
    tint: AppColors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: AppColors.primary,
    grid: AppColors.gridLight,
  },
  dark: {
    text: '#fff',
    background: AppColors.backgroundDark,
    tableCellEmpty: '#e8f0eb',
    tint: AppColors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: AppColors.primary,
    grid: AppColors.gridDark,
  },
};
