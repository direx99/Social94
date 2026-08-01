import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/reminder.dart';
import 'create_reminder_screen.dart';

class RemindersScreen extends StatelessWidget {
  const RemindersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final reminders = Provider.of<List<Reminder>>(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Reminders', style: Theme.of(context).textTheme.titleLarge),
            Text(
              "Schedule alerts and notifications",
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
      body: reminders.isEmpty
            ? const Center(child: Text('No upcoming reminders'))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: reminders.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final r = reminders[index];
                  bool isPending = r.status == 'pending';
                  return Card(
                    margin: EdgeInsets.zero,
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isPending ? AppTheme.accentAmberLight : AppTheme.statusCompletedBg,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.notifications, color: isPending ? AppTheme.accentAmber : AppTheme.statusCompleted, size: 20),
                      ),
                      title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text('${r.platform} • ${r.datetime}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          if (r.message.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(r.message, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                          ]
                        ],
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isPending ? AppTheme.accentAmberLight : AppTheme.statusCompletedBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          r.status.toUpperCase(),
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isPending ? AppTheme.accentAmber : AppTheme.statusCompleted),
                        ),
                      ),
                    ),
                  );
                },
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateReminderScreen()));
        },
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
