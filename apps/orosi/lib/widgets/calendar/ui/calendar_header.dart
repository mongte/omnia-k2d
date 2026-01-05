import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:orosi/features/calendar/index.dart';
import 'package:intl/intl.dart';

class CalendarHeader extends StatefulWidget {
  final CalendarController controller;

  const CalendarHeader({super.key, required this.controller});

  @override
  State<CalendarHeader> createState() => _CalendarHeaderState();
}

class _CalendarHeaderState extends State<CalendarHeader> {
  late PageController _yearController;
  late PageController _monthController;

  static const int _baseValues = 10000;

  @override
  void initState() {
    super.initState();
    _updateControllersFromFocusedDate();
    widget.controller.addListener(_onControllerChange);
  }

  void _updateControllersFromFocusedDate() {
    final focused = widget.controller.focusedDay;
    final now = DateTime.now();

    final yearPage = _baseValues + (focused.year - now.year);
    final monthDiff =
        (focused.year - now.year) * 12 + (focused.month - now.month);
    final monthPage = _baseValues + monthDiff;

    _yearController = PageController(
      viewportFraction: 0.35,
      initialPage: yearPage,
    );
    _monthController = PageController(
      viewportFraction: 0.25,
      initialPage: monthPage,
    );
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onControllerChange);
    _yearController.dispose();
    _monthController.dispose();
    super.dispose();
  }

  void _onControllerChange() {
    final focused = widget.controller.focusedDay;
    final now = DateTime.now();

    // Sync Year
    // If we are currently scrolling the year manually, do NOT sync back from controller
    if (widget.controller.isYearScrolling) return;

    final yearPage = _baseValues + (focused.year - now.year);
    if (_yearController.hasClients &&
        _yearController.page?.round() != yearPage) {
      final currentYearPage = _yearController.page?.round() ?? yearPage;
      if ((currentYearPage - yearPage).abs() > 1) {
        _yearController.jumpToPage(yearPage);
      } else {
        _yearController.animateToPage(
          yearPage,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    }

    // Sync Month
    final monthDiff =
        (focused.year - now.year) * 12 + (focused.month - now.month);
    final monthPage = _baseValues + monthDiff;

    if (_monthController.hasClients &&
        _monthController.page?.round() != monthPage) {
      final currentMonthPage = _monthController.page?.round() ?? monthPage;
      if ((currentMonthPage - monthPage).abs() > 1) {
        _monthController.jumpToPage(monthPage);
      } else {
        _monthController.animateToPage(
          monthPage,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            offset: const Offset(0, 4),
            blurRadius: 20,
            spreadRadius: -10,
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Row: Hamburger Menu (Use Stack to not disrupt centering later if needed, but here simple Row end is ok)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: () {
                    Scaffold.of(context).openDrawer();
                  },
                  icon: const Icon(Icons.menu),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  style: IconButton.styleFrom(
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Main Controls Area
          // We use a Stack to Center the Date Pickers perfectly,
          // while floating the Action buttons on the right.
          SizedBox(
            height: 80,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Centered Year/Month Selection
                SizedBox(
                  width: 250, // Constrain width for the selector area
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildGradientSelector(
                        height: 44,
                        controller: _yearController,
                        onPageChanged: (index) {
                          // Do nothing on intermediate page changes
                        },
                        onNotification: (notification) {
                          if (notification is ScrollStartNotification) {
                            // Only trigger for user drags, not programmatic animations
                            if (notification.dragDetails != null) {
                              widget.controller.setYearScrolling(true);
                            }
                          } else if (notification is ScrollEndNotification) {
                            if (widget.controller.isYearScrolling) {
                              // Settle and Jump Atomically
                              final index = _yearController.page!.round();
                              final diff = index - _baseValues;
                              final newYear = DateTime.now().year + diff;
                              final current = widget.controller.focusedDay;

                              widget.controller.commitYearScroll(
                                DateTime(newYear, current.month, current.day),
                              );
                            }
                          }
                          return false;
                        },
                        builder: (context, index, selectedness) {
                          final diff = index - _baseValues;
                          final year = DateTime.now().year + diff;
                          return Text(
                            "$year",
                            style: TextStyle(
                              fontSize: 28, // Prominent size
                              fontWeight: FontWeight.w900,
                              color:
                                  Theme.of(context).brightness ==
                                      Brightness.dark
                                  ? Colors.white.withValues(
                                      alpha: 0.2 + (0.8 * selectedness),
                                    )
                                  : const Color(0xFF1A1A1A).withValues(
                                      alpha: 0.2 + (0.8 * selectedness),
                                    ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 4),
                      _buildGradientSelector(
                        height: 30,
                        controller: _monthController,
                        onPageChanged: (index) {
                          final diff = index - _baseValues;
                          final baseDate = DateTime(
                            DateTime.now().year,
                            DateTime.now().month,
                            1,
                          );
                          final newDate = DateTime(
                            baseDate.year,
                            baseDate.month + diff,
                            1,
                          );
                          final current = widget.controller.focusedDay;
                          if (newDate.year != current.year ||
                              newDate.month != current.month) {
                            widget.controller.setFocusedDay(newDate);
                          }
                        },
                        builder: (context, index, selectedness) {
                          final diff = index - _baseValues;
                          final baseDate = DateTime(
                            DateTime.now().year,
                            DateTime.now().month,
                            1,
                          );
                          final date = DateTime(
                            baseDate.year,
                            baseDate.month + diff,
                            1,
                          );
                          final monthName = DateFormat(
                            'MMM',
                          ).format(date).toUpperCase();

                          return Text(
                            monthName,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color:
                                  Theme.of(context).brightness ==
                                      Brightness.dark
                                  ? Colors.white.withValues(
                                      alpha: 0.3 + (0.7 * selectedness),
                                    )
                                  : const Color(0xFF1A1A1A).withValues(
                                      alpha: 0.3 + (0.7 * selectedness),
                                    ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildGradientSelector({
    required double height,
    required PageController controller,
    required Function(int) onPageChanged,
    required Widget Function(BuildContext, int, double) builder,
    bool Function(ScrollNotification)? onNotification,
  }) {
    return ShaderMask(
      shaderCallback: (Rect bounds) {
        return const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            Colors.transparent,
            Colors.white,
            Colors.white,
            Colors.transparent,
          ],
          stops: [0.0, 0.35, 0.65, 1.0],
        ).createShader(bounds);
      },
      blendMode: BlendMode.dstIn,
      child: SizedBox(
        height: height,
        child: NotificationListener<ScrollNotification>(
          onNotification: onNotification,
          child: ScrollConfiguration(
            behavior: ScrollConfiguration.of(context).copyWith(
              dragDevices: {PointerDeviceKind.touch, PointerDeviceKind.mouse},
            ),
            child: PageView.builder(
              controller: controller,
              onPageChanged: onPageChanged,
              physics: const BouncingScrollPhysics(),
              itemBuilder: (context, index) {
                return AnimatedBuilder(
                  animation: controller,
                  builder: (context, child) {
                    double selectedness = 0.0;
                    if (controller.position.haveDimensions) {
                      selectedness =
                          1.0 -
                          (controller.page! - index).abs().clamp(0.0, 1.0);
                    } else {
                      selectedness = (index == controller.initialPage)
                          ? 1.0
                          : 0.0;
                    }

                    // Scale effect for the center item
                    final scale = 0.8 + (0.2 * selectedness);

                    return Center(
                      child: Transform.scale(
                        scale: scale,
                        child: builder(context, index, selectedness),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
