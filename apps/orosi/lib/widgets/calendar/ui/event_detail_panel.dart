import 'package:flutter/material.dart';
import 'package:orosi/shared/ui/app_colors.dart';

class EventDetailPanel extends StatelessWidget {
  const EventDetailPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 40,
            spreadRadius: 0,
            offset: Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Events",
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      "Jan 12 — 14, 2025",
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(
                          context,
                        ).textTheme.bodySmall?.color?.withValues(alpha: 0.5),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                  style: IconButton.styleFrom(
                    backgroundColor: Theme.of(
                      context,
                    ).dividerColor.withValues(alpha: 0.1),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: Stack(
              children: [
                // Timeline Line
                Positioned(
                  left: 24,
                  top: 0,
                  bottom: 0,
                  child: Container(
                    width: 1,
                    color: Theme.of(
                      context,
                    ).dividerColor.withValues(alpha: 0.2),
                  ),
                ),

                ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    _buildDateHeader("Jan 12"),
                    _buildTimelineItem(
                      context,
                      time: "09:00 AM",
                      title: "Team Strategy Kickoff",
                      desc: "Quarterly planning session with marketing.",
                      color: AppColors.eventOrange,
                    ),
                    const SizedBox(height: 24),
                    _buildTimelineItem(
                      context,
                      time: "11:30 AM",
                      title: "Design Review",
                      desc: "Reviewing new mobile assets.",
                      color: AppColors.eventDarkGreen,
                    ),
                    const SizedBox(height: 24),
                    _buildTimelineItem(
                      context,
                      time: "02:00 PM",
                      title: "Client Call",
                      desc: "Status update for Project X.",
                      color: AppColors.eventRed,
                    ),

                    const SizedBox(height: 48),
                    _buildDateHeader("Jan 13"),
                    _buildTimelineItem(
                      context,
                      time: "All Day",
                      title: "Strategy Workshop",
                      desc: "Day 2 of planning.",
                      color: AppColors.eventOrange,
                    ),
                    const SizedBox(height: 24),
                    _buildTimelineItem(
                      context,
                      time: "10:00 AM",
                      title: "Development Sync",
                      desc: "",
                      color: AppColors.eventDarkGreen,
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Add Button
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: FilledButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add),
              label: const Text("Add New Event"),
              style: FilledButton.styleFrom(
                backgroundColor: Colors
                    .black, // or white depending on theme, standardizing for now
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateHeader(String text) {
    return Padding(
      padding: const EdgeInsets.only(
        bottom: 24,
        left: 16,
      ), // Offset for timeline
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context, {
    required String time,
    required String title,
    required String desc,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Dot
        Container(
          width: 8,
          height: 8,
          margin: const EdgeInsets.only(
            top: 6,
            right: 24,
          ), // Center with text top
          transform: Matrix4.translationValues(
            -4.0,
            0,
            0,
          ), // Center on line (left 24 - 4 = 20?) No, line is left 24.
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(
              color: Theme.of(context).scaffoldBackgroundColor,
              width: 2,
            ),
          ),
        ),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                time,
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              if (desc.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    desc,
                    style: TextStyle(
                      color: Theme.of(
                        context,
                      ).textTheme.bodySmall?.color?.withValues(alpha: 0.6),
                      fontSize: 10,
                    ),
                  ),
                ),
              // Progress Bar lookalike
              Container(
                margin: const EdgeInsets.only(top: 8),
                height: 4,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
