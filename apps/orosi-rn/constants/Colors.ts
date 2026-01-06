const AppColors = {
  primary: '#00D656', // Vibrant Green from image (approx)
  backgroundLight: '#FFFFFF',
  backgroundDark: '#102216', // Keeping for safety, though unused in forced light
  gridLight: '#F5F5F5', // Very subtle grid
  gridDark: '#1F2E25',
  eventOrange: '#FF9100',
  eventDarkGreen: '#2E7D32',
  eventPink: '#E91E63',
  eventLightGreen: '#66BB6A',
  eventGrey: '#BDBDBD',
  eventBlue: '#2979FF',
  eventRed: '#FF1744',
  eventYellow: '#FFEA00',
  eventPurple: '#D500F9',
};

export default {
  AppColors,
  light: {
    text: '#000',
    background: AppColors.backgroundLight,
    tableCellEmpty: '#f5fef8',
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
