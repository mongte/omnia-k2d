import 'package:flutter/material.dart';
import 'package:orosi/entities/event/index.dart';
import 'package:orosi/shared/ui/app_colors.dart';

class CalendarCell extends StatelessWidget {
  final int? day;
  final bool isToday;
  final bool isSelected;
  final bool isRangeStart;
  final bool isRangeEnd;
  final List<Event> events;
  final Set<String> continuingEventIds;

  const CalendarCell({
    super.key,
    this.day,
    this.isToday = false,
    this.isSelected = false,
    this.isRangeStart = false,
    this.isRangeEnd = false,
    this.events = const [],
    this.continuingEventIds = const {},
  });

  @override
  Widget build(BuildContext context) {
    if (day == null) {
      return Container(
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? Colors.white.withValues(alpha: 0.05)
              : Colors.grey.withValues(alpha: 0.05),
          border: Border(
            right: BorderSide(color: Theme.of(context).colorScheme.outline),
            bottom: BorderSide(color: Theme.of(context).colorScheme.outline),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          right: BorderSide(color: Theme.of(context).colorScheme.outline),
          bottom: BorderSide(color: Theme.of(context).colorScheme.outline),
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Day Header
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: isToday
                    ? Container(
                        width: 28,
                        height: 28,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          "$day",
                          style: const TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : Text(
                        "$day",
                        style: TextStyle(
                          color: Theme.of(
                            context,
                          ).textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
              ),

              const Spacer(),

              // Event Blocks
              Padding(
                padding: const EdgeInsets.fromLTRB(2, 0, 2, 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: events.take(4).map((event) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 2),
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: event.color,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),

          // Connector Ring (if continuing)
          if (continuingEventIds.isNotEmpty)
            Positioned(
              right: -5,
              top: 18,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: events
                        .firstWhere((e) => continuingEventIds.contains(e.id))
                        .color,
                    width: 2,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
