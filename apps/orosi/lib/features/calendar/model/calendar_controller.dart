import 'package:flutter/material.dart';

class CalendarController extends ChangeNotifier {
  DateTime _focusedDay;
  DateTimeRange? _selectedRange;
  bool _isMonthLoading = false;

  // For dragging
  DateTime? _dragStart;
  bool _dragStarted = false; // Track if we are in a drag sequence

  CalendarController({required DateTime initialDay}) : _focusedDay = initialDay;

  DateTime get focusedDay => _focusedDay;
  DateTimeRange? get selectedRange => _selectedRange;
  bool get isMonthLoading => _isMonthLoading;
  bool get dragStarted => _dragStarted;
  bool get isYearScrolling => _isYearScrolling;

  bool _isYearScrolling = false;

  void setFocusedDay(DateTime day) {
    if (_focusedDay == day) return;
    _focusedDay = day;
    notifyListeners();
  }

  void startSelection(DateTime day) {
    _dragStart = day;
    _selectedRange = DateTimeRange(start: day, end: day);
    notifyListeners();
  }

  void updateSelection(DateTime currentDay) {
    if (_dragStart == null) return;

    final start = _dragStart!.isBefore(currentDay) ? _dragStart! : currentDay;
    final end = _dragStart!.isBefore(currentDay) ? currentDay : _dragStart!;

    _selectedRange = DateTimeRange(start: start, end: end);
    notifyListeners();
  }

  void endSelection() {
    _dragStart = null;
    _dragStarted = false; // Reset drag state
    notifyListeners();
  }

  void clearSelection() {
    _selectedRange = null;
    notifyListeners();
  }

  void toggleDaySelection(DateTime day) {
    if (_selectedRange != null &&
        _selectedRange!.start.isAtSameMomentAs(day) &&
        _selectedRange!.end.isAtSameMomentAs(day)) {
      clearSelection();
    } else {
      _selectedRange = DateTimeRange(start: day, end: day);
      notifyListeners();
    }
  }

  bool isDaySelected(DateTime day) {
    if (_selectedRange == null) return false;
    final start = DateUtils.dateOnly(_selectedRange!.start);
    final end = DateUtils.dateOnly(_selectedRange!.end);
    final target = DateUtils.dateOnly(day);

    return (target.isAtSameMomentAs(start) || target.isAfter(start)) &&
        (target.isAtSameMomentAs(end) || target.isBefore(end));
  }

  bool isRangeStart(DateTime day) {
    return _selectedRange != null &&
        DateUtils.isSameDay(_selectedRange!.start, day);
  }

  bool isRangeEnd(DateTime day) {
    return _selectedRange != null &&
        DateUtils.isSameDay(_selectedRange!.end, day);
  }

  void setDragStarted(bool val) {
    _dragStarted = val;
    // Don't notify listeners, just internal state or simple frame state
  }

  void setYearScrolling(bool val) {
    if (_isYearScrolling == val) return;
    _isYearScrolling = val;
    notifyListeners();
  }

  /// Atomically updates the date and clears the scrolling flag to prevent UI glitches.
  void commitYearScroll(DateTime newDate) {
    _isYearScrolling = false;
    _focusedDay = newDate;
    notifyListeners();
  }

  Future<void> jumpToMonth(DateTime month) async {
    // Removed simulated delay
    _focusedDay = month;
    notifyListeners();
  }
}
