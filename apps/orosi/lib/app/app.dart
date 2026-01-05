import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:orosi/shared/ui/app_colors.dart';
import 'package:orosi/pages/calendar/ui/calendar_page.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = GoogleFonts.interTextTheme();

    return MaterialApp(
      title: 'Orosi Grid Planner',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: AppColors.backgroundLight,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          surface: AppColors.backgroundLight,
          onSurface: Colors.black,
          outline: AppColors.gridLight,
        ),
        textTheme: textTheme.apply(bodyColor: Colors.black, displayColor: Colors.black),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.backgroundDark,
        colorScheme: ColorScheme.dark(
          primary: AppColors.primary,
          surface: AppColors.backgroundDark,
          onSurface: Colors.white,
          outline: AppColors.gridDark,
        ),
         textTheme: textTheme.apply(bodyColor: Colors.white, displayColor: Colors.white),
      ),
      home: const CalendarPage(),
    );
  }
}
