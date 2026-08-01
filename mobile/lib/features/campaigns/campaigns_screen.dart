import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/campaign.dart';
import 'create_campaign_screen.dart';

class CampaignsScreen extends StatelessWidget {
  const CampaignsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final campaigns = Provider.of<List<Campaign>>(context);
    
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Campaigns', style: Theme.of(context).textTheme.titleLarge),
            Text(
              "Manage your AI marketing campaigns",
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            color: AppTheme.primary,
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateCampaignScreen()));
            },
          ),
        ],
      ),
      body: campaigns.isEmpty
            ? const Center(child: Text('No active campaigns'))
            : ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: campaigns.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final c = campaigns[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: c.status == 'active' ? AppTheme.statusActiveBg : AppTheme.statusScheduledBg,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                c.status.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: c.status == 'active' ? AppTheme.statusActive : AppTheme.statusScheduled,
                                ),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Goal: ${c.goal}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Reach: ${c.reach}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('Budget: ${c.budget}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        )
                      ],
                    ),
                  );
                },
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateCampaignScreen()));
        },
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
