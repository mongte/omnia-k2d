import 'package:flutter/material.dart';
import 'package:orosi/shared/ui/app_colors.dart';

class Event {
  final String id;
  final String title;
  final DateTime startTime;
  final DateTime endTime;
  final Color color;
  final bool isAllDay;
  final String? description;

  const Event({
    required this.id,
    required this.title,
    required this.startTime,
    required this.endTime,
    this.color = AppColors.eventOrange,
    this.isAllDay = false,
    this.description,
  });

  // Helper getters
  bool get isMultiDay => 
      startTime.year != endTime.year || 
      startTime.month != endTime.month || 
      startTime.day != endTime.day;
}
