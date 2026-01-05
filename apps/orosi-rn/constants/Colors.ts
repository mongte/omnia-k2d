const AppColors = {
  primary: '#13EC5B',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#102216',
  gridLight: '#E5E7EB',
  gridDark: '#1F2E25',
  eventOrange: '#FFFF9800',
  eventDarkGreen: '#388E3C',
  eventPink: '#FFC0CB',
  eventLightGreen: '#A5D6A7',
  eventGrey: '#9E9E9E',
  eventBlue: '#42A5F5',
  eventRed: '#EF5350',
  eventYellow: '#FFFFEB3B',
  eventPurple: '#AB47BC',
};

export default {
  AppColors,
  light: {
    text: '#000',
    background: AppColors.backgroundLight,
    tint: AppColors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: AppColors.primary,
    grid: AppColors.gridLight,
  },
  dark: {
    text: '#fff',
    background: AppColors.backgroundDark,
    tint: AppColors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: AppColors.primary,
    grid: AppColors.gridDark,
  },
};
