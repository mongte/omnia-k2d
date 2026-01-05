import 'package:flutter/material.dart';
import 'package:orosi/features/calendar/index.dart';
import 'package:orosi/entities/event/index.dart';
import 'package:orosi/shared/ui/app_colors.dart';
import 'calendar_cell.dart';
import 'event_detail_panel.dart';

class CalendarGrid extends StatefulWidget {
  final CalendarController controller;

  const CalendarGrid({super.key, required this.controller});

  @override
  State<CalendarGrid> createState() => _CalendarGridState();
}

class _CalendarGridState extends State<CalendarGrid> {
  late ScrollController _scrollController;
  final int _baseYear = 2000;
  bool _isInitialized = false;
  double _currentWidth = 0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    widget.controller.addListener(_onControllerChange);
  }

  double _calculateHeightForMonth(int year, int month, double width) {
    if (width <= 0) return 0;

    final days = DateUtils.getDaysInMonth(year, month);
    final firstDay = DateTime(year, month, 1);
    final offset = (firstDay.weekday == 7) ? 0 : firstDay.weekday;
    final rows = ((offset + days) / 7).ceil();

    final cellWidth = width / 7;
    final cellHeight = cellWidth * 1.3;

    final lastDay = DateTime(year, month, days);
    // If the month ends on a Saturday (column 6 in 0-6 grid, which corresponds to DateTime.saturday=6? No wait.)
    // DateTime: Mon=1, Sat=6, Sun=7.
    // Our Grid: Sun=0, Mon=1, ... Sat=6.
    // So if DateTime.weekday == 6 (Sat), it is the last column.

    // Logic: If last day is Saturday (ends the row), we add a GAP ROW (7 empty cells).
    // If it ends mid-week, the empty cells on both rows create enough gap.
    final needsSpacing = lastDay.weekday == DateTime.saturday;

    // If spacing needed, we pretend there's one more row
    final effectiveRows = rows + (needsSpacing ? 1 : 0);

    return effectiveRows * cellHeight;
  }

  double _calculateOffset(DateTime target, double width) {
    double totalHeight = 0;
    int currentYear = _baseYear;
    int currentMonth = 1;

    final targetTotalMonths =
        (target.year - _baseYear) * 12 + (target.month - 1);

    for (int i = 0; i < targetTotalMonths; i++) {
      totalHeight += _calculateHeightForMonth(currentYear, currentMonth, width);

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
    return totalHeight;
  }

  void _initializeScroll(double width) {
    if (_isInitialized) return;

    // Default to focused day, or Today?
    // User expects to see focused day.
    final initialOffset = _calculateOffset(widget.controller.focusedDay, width);

    if (_scrollController.hasClients) {
      _scrollController.jumpTo(initialOffset);
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo(initialOffset);
        }
      });
    }
    _isInitialized = true;
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onControllerChange);
    _scrollController.dispose();
    super.dispose();
  }

  DateTime? _lastFocusedDay;

  void _onControllerChange() {
    if (!_isInitialized || !_scrollController.hasClients) return;

    final width = _currentWidth;
    if (width == 0) return;

    // Only scroll if the focused day actually changed (Year/Month navigation)
    // Ignore selection updates (clicking a cell)
    if (_lastFocusedDay != null &&
        isSameMonth(_lastFocusedDay!, widget.controller.focusedDay)) {
      return;
    }

    _lastFocusedDay = widget.controller.focusedDay;
    final targetOffset = _calculateOffset(widget.controller.focusedDay, width);

    final current = _scrollController.offset;
    // Only animate if the difference is significant (avoid micro-jitters)
    if ((current - targetOffset).abs() > 10) {
      _scrollController.animateTo(
        targetOffset,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOut,
      );
    }
  }

  bool isSameMonth(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Weekday Header
        Container(
          height: 40,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                offset: const Offset(0, 1),
                blurRadius: 2,
              ),
            ],
          ),
          child: Row(
            children: const [
              _WeekdayItem("SUN"),
              _WeekdayItem("MON"),
              _WeekdayItem("TUE"),
              _WeekdayItem("WED"),
              _WeekdayItem("THU"),
              _WeekdayItem("FRI"),
              _WeekdayItem("SAT"),
            ],
          ),
        ),

        // Vertical Infinite Grid
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              _initializeScroll(constraints.maxWidth);
              final width = constraints.maxWidth;
              _currentWidth = width;

              return NotificationListener<ScrollNotification>(
                onNotification: (notification) {
                  if (notification is ScrollUpdateNotification &&
                      !widget.controller.isYearScrolling) {
                    // Find visible month
                    double currentOffset = _scrollController.offset;
                    double accumulatedHeight = 0;
                    int year = _baseYear;
                    int month = 1;

                    // Optimization: We could cache heights, but calculation is cheap enough
                    // We Iterate until we pass the offset
                    while (true) {
                      final height = _calculateHeightForMonth(
                        year,
                        month,
                        width,
                      );
                      if (accumulatedHeight + height > currentOffset + 10) {
                        // +10 buffer
                        break;
                      }
                      accumulatedHeight += height;

                      month++;
                      if (month > 12) {
                        month = 1;
                        year++;
                      }

                      // Safety break for infinite loops (though 1200 items is finite)
                      if (year > _baseYear + 100) break;
                    }

                    final newFocusedDay = DateTime(year, month, 1);
                    // Only update if changed (month level)
                    if (newFocusedDay.year !=
                            widget.controller.focusedDay.year ||
                        newFocusedDay.month !=
                            widget.controller.focusedDay.month) {
                      widget.controller.setFocusedDay(newFocusedDay);
                    }
                  }
                  return false;
                },
                child: ListView.builder(
                  controller: _scrollController,
                  physics: const ClampingScrollPhysics(), // Dense feel
                  padding: EdgeInsets.zero,
                  itemCount: 2400,
                  itemBuilder: (context, index) {
                    final totalMonthsToCheck = index;
                    final year = _baseYear + (totalMonthsToCheck ~/ 12);
                    final month = (totalMonthsToCheck % 12) + 1;
                    final date = DateTime(year, month, 1);

                    return _MonthGrid(
                      month: date,
                      controller: widget.controller,
                      isFirst: index == 0,
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _WeekdayItem extends StatelessWidget {
  final String label;
  const _WeekdayItem(this.label);
  @override
  Widget build(BuildContext context) => Expanded(
    child: Center(
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: Theme.of(
            context,
          ).textTheme.bodyMedium?.color?.withValues(alpha: 0.4),
        ),
      ),
    ),
  );
}

class _MonthGrid extends StatelessWidget {
  final DateTime month;
  final CalendarController controller;
  final bool isFirst;

  const _MonthGrid({
    required this.month,
    required this.controller,
    this.isFirst = false,
  });

  @override
  Widget build(BuildContext context) {
    final daysInMonth = DateUtils.getDaysInMonth(month.year, month.month);
    final firstDayOfMonth = DateTime(month.year, month.month, 1);
    final startOffset = (firstDayOfMonth.weekday == 7)
        ? 0
        : firstDayOfMonth.weekday;

    // Dynamic Rows Logic
    final totalUsedCells = startOffset + daysInMonth;
    final rowsNumber = (totalUsedCells / 7).ceil();
    return LayoutBuilder(
      builder: (context, constraints) {
        final cellWidth = constraints.maxWidth / 7;
        final cellHeight = cellWidth * 1.3;

        final lastDay = DateTime(month.year, month.month, daysInMonth);
        final needsSpacing = lastDay.weekday == DateTime.saturday;

        // Add 7 extra empty cells if spacing is needed
        final totalCells = rowsNumber * 7 + (needsSpacing ? 7 : 0);
        final effectiveRows = (totalCells / 7).ceil();
        final totalHeight = cellHeight * effectiveRows;

        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () {
            controller.clearSelection();
          },
          onLongPressStart: (details) => _handleSelection(
            details.localPosition,
            cellWidth,
            cellHeight,
            startOffset,
            daysInMonth,
          ),
          onLongPressMoveUpdate: (details) => _handleSelection(
            details.localPosition,
            cellWidth,
            cellHeight,
            startOffset,
            daysInMonth,
          ),
          onLongPressEnd: (_) => controller.endSelection(),
          child: Container(
            height: totalHeight,
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: Theme.of(context).colorScheme.outline),
                top: isFirst
                    ? BorderSide(color: Theme.of(context).colorScheme.outline)
                    : BorderSide.none,
              ),
            ),
            child: AnimatedBuilder(
              animation: controller,
              builder: (context, _) {
                return CustomPaint(
                  foregroundPainter: _SelectionPainter(
                    controller: controller,
                    month: month,
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    startOffset: startOffset,
                    daysInMonth: daysInMonth,
                    accentColor: AppColors.primary,
                  ),
                  child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 7,
                          childAspectRatio: 1 / 1.3,
                        ),
                    itemCount: totalCells,
                    itemBuilder: (context, index) {
                      final dayNum = index - startOffset + 1;

                      // Empty Cells logic
                      if (dayNum < 1 || dayNum > daysInMonth) {
                        return const CalendarCell(day: null);
                      }

                      final currentDate = DateTime(
                        month.year,
                        month.month,
                        dayNum,
                      );
                      final events = _generateMockEvents(currentDate);

                      // Check next day for continuity
                      final nextDate = currentDate.add(const Duration(days: 1));
                      final nextEvents = _generateMockEvents(nextDate);
                      final continuingIds = events
                          .where((e) => nextEvents.any((n) => n.id == e.id))
                          .map((e) => e.id)
                          .toSet();

                      return InkWell(
                        onTap: () {
                          if (events.isNotEmpty) {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => const EventDetailPanel(),
                            );
                          } else {
                            controller.toggleDaySelection(currentDate);
                          }
                        },
                        child: CalendarCell(
                          day: dayNum,
                          isToday: DateUtils.isSameDay(
                            currentDate,
                            DateTime.now(),
                          ),
                          isSelected: controller.isDaySelected(currentDate),
                          isRangeStart: controller.isRangeStart(currentDate),
                          isRangeEnd: controller.isRangeEnd(currentDate),
                          // Event connection logic
                          events: events,
                          continuingEventIds: continuingIds,
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  void _handleSelection(
    Offset localPos,
    double w,
    double h,
    int offset,
    int maxDays,
  ) {
    if (controller.dragStarted == false) {
      controller.clearSelection();
      controller.setDragStarted(true);
    }

    int col = (localPos.dx / w).floor();
    int row = (localPos.dy / h).floor();
    int index = row * 7 + col;
    int day = index - offset + 1;

    if (day >= 1 && day <= maxDays) {
      final date = DateTime(month.year, month.month, day);
      if (controller.selectedRange == null) {
        controller.startSelection(date);
      } else {
        controller.updateSelection(date);
      }
    }
  }

  List<Event> _generateMockEvents(DateTime date) {
    final events = <Event>[];
    if (date.day == 12) {
      events.add(
        Event(
          id: '1',
          title: 'Start',
          startTime: date,
          endTime: date,
          color: AppColors.eventOrange,
        ),
      );
      events.add(
        Event(
          id: '2',
          title: '',
          startTime: date,
          endTime: date,
          color: Colors.green,
        ),
      );
    }
    if (date.day == 13) {
      events.add(
        Event(
          id: '1',
          title: 'Mid',
          startTime: date,
          endTime: date,
          color: AppColors.eventOrange,
        ),
      );
    }
    if (date.day == 14) {
      events.add(
        Event(
          id: '1',
          title: 'End',
          startTime: date,
          endTime: date,
          color: AppColors.eventOrange,
        ),
      );
      events.add(
        Event(
          id: '6',
          title: '',
          startTime: date,
          endTime: date,
          color: Colors.grey,
        ),
      );
    }
    return events;
  }
} // End _MonthGrid

class _SelectionPainter extends CustomPainter {
  final CalendarController controller;
  final DateTime month;
  final double cellWidth;
  final double cellHeight;
  final int startOffset;
  final int daysInMonth;
  final Color accentColor;

  _SelectionPainter({
    required this.controller,
    required this.month,
    required this.cellWidth,
    required this.cellHeight,
    required this.startOffset,
    required this.daysInMonth,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (controller.selectedRange == null) return;

    final start = controller.selectedRange!.start;
    final end = controller.selectedRange!.end;

    // Filter range to current month
    final monthStart = DateTime(month.year, month.month, 1);
    final monthEnd = DateTime(month.year, month.month, daysInMonth);

    if (end.isBefore(monthStart) || start.isAfter(monthEnd)) return;

    // Calculate start/end indices tailored to this month
    final effectiveStart = start.isBefore(monthStart) ? monthStart : start;
    final effectiveEnd = end.isAfter(monthEnd) ? monthEnd : end;

    final startIndex = effectiveStart.day + startOffset - 1;
    final endIndex = effectiveEnd.day + startOffset - 1;

    final paint = Paint()
      ..color = accentColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final bgPaint = Paint()
      ..color = accentColor.withValues(alpha: 0.1)
      ..style = PaintingStyle.fill;

    // Collect all rects
    final rects = <Rect>[];
    for (int i = startIndex; i <= endIndex; i++) {
      final col = i % 7;
      final row = i ~/ 7;
      final rect = Rect.fromLTWH(
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
      );
      rects.add(rect);
    }

    if (rects.isEmpty) return;

    // Draw Background (simplified union)
    // We can draw individual rects for background as occlusion doesn't matter for semi-transparent solid color?
    // Actually if we overlap semi-transparent rects, they get darker.
    // So we need a path.
    final path = Path();
    for (final r in rects) {
      path.addRect(r);
    }
    // Path.combine(PathOperation.union) is expensive but works.
    // Since it's a grid, we can just draw the path. Flutter Path supports overlapping adds (non-zero fill).
    // But for STROKE (Outline), we need the union boundary.

    // Better approach for Outline:
    // 1. Create a Path from all rects.
    // 2. Use Path.fillType = PathFillType.nonZero (default).
    // 3. Draw Fill.
    // 4. For Stroke, we only want the boundary.

    // A simple trick for grid selection stroke:
    // Draw the 4 borders of each selected cell, UNLESS the neighbor is also selected.

    // Fill first
    canvas.drawPath(path, bgPaint);

    // Stroke
    for (int i = startIndex; i <= endIndex; i++) {
      final col = i % 7;
      final row = i ~/ 7;

      final left = col * cellWidth;
      final top = row * cellHeight;
      final right = left + cellWidth;
      final bottom = top + cellHeight;

      // Check Neighbors (in the same month/range context)
      // Top
      final idxTop = i - 7;
      final hasTop = (idxTop >= startIndex && idxTop <= endIndex);

      // Bottom
      final idxBottom = i + 7;
      final hasBottom = (idxBottom >= startIndex && idxBottom <= endIndex);

      // Left
      final idxLeft = i - 1;
      final hasLeft =
          (idxLeft >= startIndex && idxLeft <= endIndex) && (col > 0);

      // Right
      final idxRight = i + 1;
      final hasRight =
          (idxRight >= startIndex && idxRight <= endIndex) && (col < 6);

      // Draw lines if neighbor is missing
      if (!hasTop) {
        canvas.drawLine(Offset(left, top), Offset(right, top), paint);
      }
      if (!hasBottom) {
        canvas.drawLine(Offset(left, bottom), Offset(right, bottom), paint);
      }
      if (!hasLeft) {
        canvas.drawLine(Offset(left, top), Offset(left, bottom), paint);
      }
      if (!hasRight) {
        canvas.drawLine(Offset(right, top), Offset(right, bottom), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SelectionPainter oldDelegate) {
    return oldDelegate.controller.selectedRange != controller.selectedRange ||
        oldDelegate.month != month;
  }
}
