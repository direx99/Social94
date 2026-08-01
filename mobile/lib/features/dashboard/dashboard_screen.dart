import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/user_stats.dart';
import '../audience/audience_screen.dart';
import '../campaigns/campaigns_screen.dart';
import '../content/content_screen.dart';
import '../profile/profile_screen.dart';

class DashboardScreen extends StatelessWidget {
  final Function(int) onNavigateToTab;

  const DashboardScreen({super.key, required this.onNavigateToTab});

  @override
  Widget build(BuildContext context) {
    final stats = Provider.of<UserStats?>(context);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        toolbarHeight: 80,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good afternoon, 👋',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              "Here's your Social94 overview",
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications), onPressed: () {}),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
              },
              borderRadius: BorderRadius.circular(20),
              child: const CircleAvatar(
                backgroundColor: AppTheme.primaryLight,
                child: Text('D', style: TextStyle(color: AppTheme.primary)),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildAiInsight(context),
            const SizedBox(height: 24),
            _buildStatCards(stats),
            const SizedBox(height: 24),
            _buildRecentActivity(context),
            const SizedBox(height: 24),
            _buildPlatformPulse(context, stats),
            const SizedBox(height: 24),
            _buildQuickActions(context),
            const SizedBox(height: 32), // Bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildAiInsight(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, AppTheme.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.bolt, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '✨ Gemini AI Insight',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Your Instagram engagement is up 15% this week. Consider posting more behind-the-scenes content to maintain this momentum.',
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCards(UserStats? stats) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.2,
      children: [
        _statCard(
          'Total Reach',
          stats != null ? '${(stats.totalReach / 1000).toStringAsFixed(1)}K' : '-',
          'purple',
          Icons.people,
          stats != null ? stats.formattedEngagementRate : '-',
          AppTheme.primary,
          AppTheme.primaryLight,
        ),
        _statCard(
          'Engagement Rate',
          stats != null ? '${stats.engagementRateNum.toStringAsFixed(1)}%' : '-',
          'emerald',
          Icons.trending_up,
          'this month',
          AppTheme.accentEmerald,
          AppTheme.accentEmeraldLight,
        ),
        _statCard(
          'Active Campaigns',
          stats != null ? '${stats.activeCampaigns}' : '-',
          'amber',
          Icons.campaign,
          '5 total',
          AppTheme.accentAmber,
          AppTheme.accentAmberLight,
        ),
        _statCard(
          'Pending Reminders',
          stats != null ? '${stats.postsScheduled}' : '-',
          'cyan',
          Icons.notifications,
          '12 total',
          AppTheme.secondary,
          AppTheme.secondaryLight,
        ),
      ],
    );
  }

  Widget _statCard(
    String title,
    String value,
    String colorName,
    IconData icon,
    String subtitle,
    Color color,
    Color bgColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 16),
              ),
              Row(
                children: [
                  const Icon(
                    Icons.arrow_outward,
                    color: AppTheme.accentEmerald,
                    size: 12,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            TextButton(onPressed: () {}, child: const Text('View All')),
          ],
        ),
        Card(
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 3,
            separatorBuilder: (context, index) =>
                const Divider(height: 1, color: AppTheme.borderLight),
            itemBuilder: (context, index) {
              final items = [
                {
                  'icon': '📣',
                  'title': 'Summer Sale Promo',
                  'time': 'Campaign',
                  'status': 'Active',
                },
                {
                  'icon': '🔔',
                  'title': 'Post IG Reel',
                  'time': 'Reminder',
                  'status': 'Pending',
                },
                {
                  'icon': '📣',
                  'title': 'Q3 Product Launch',
                  'time': 'Campaign',
                  'status': 'Draft',
                },
              ];
              final item = items[index];
              return ListTile(
                leading: Text(
                  item['icon']!,
                  style: const TextStyle(fontSize: 24),
                ),
                title: Text(
                  item['title']!,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                subtitle: Row(
                  children: [
                    const Icon(
                      Icons.access_time,
                      size: 12,
                      color: AppTheme.textMuted,
                    ),
                    const SizedBox(width: 4),
                    Text(item['time']!, style: const TextStyle(fontSize: 12)),
                  ],
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: item['status'] == 'Active'
                        ? AppTheme.statusActiveBg
                        : (item['status'] == 'Pending'
                              ? AppTheme.statusScheduledBg
                              : AppTheme.borderLight),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    item['status']!,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: item['status'] == 'Active'
                          ? AppTheme.statusActive
                          : (item['status'] == 'Pending'
                                ? AppTheme.statusScheduled
                                : AppTheme.textMuted),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPlatformPulse(BuildContext context, UserStats? stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Platform Pulse', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                if (stats != null)
                  for (final platform in stats.platformStats) ...[
                    _platformRow(
                      platform.name,
                      _getEmojiForPlatform(platform.name),
                      platform.followers,
                      20000,
                      _getColorForPlatform(platform.name),
                      platform.growth,
                    ),
                    const SizedBox(height: 16),
                  ],
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('View Full Analytics'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _platformRow(
    String name,
    String emoji,
    int followers,
    int maxFollowers,
    Color color,
    String growth,
  ) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: Text(emoji, style: const TextStyle(fontSize: 20)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 6),
              LinearProgressIndicator(
                value: followers / maxFollowers,
                backgroundColor: AppTheme.borderLight,
                color: color,
                minHeight: 6,
                borderRadius: BorderRadius.circular(3),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${(followers / 1000).toStringAsFixed(1)}K',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            Text(
              growth,
              style: const TextStyle(
                color: AppTheme.accentEmerald,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _actionCard(
                Icons.people,
                'Check\nAudience',
                AppTheme.primary,
                AppTheme.primaryLight,
                () => onNavigateToTab(1),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _actionCard(
                Icons.description,
                'Analyze\nContent',
                AppTheme.secondary,
                AppTheme.secondaryLight,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ContentScreen())),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _actionCard(
                Icons.campaign,
                'New\nCampaign',
                AppTheme.accentEmerald,
                AppTheme.accentEmeraldLight,
                () => onNavigateToTab(2),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _actionCard(IconData icon, String label, Color color, Color bgColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  String _getEmojiForPlatform(String platform) {
    if (platform.toLowerCase().contains('insta')) return '📸';
    if (platform.toLowerCase().contains('face')) return '👥';
    if (platform.toLowerCase().contains('link')) return '💼';
    if (platform.toLowerCase().contains('twit') || platform.toLowerCase().contains('x')) return '🐦';
    return '📱';
  }

  Color _getColorForPlatform(String platform) {
    if (platform.toLowerCase().contains('insta')) return AppTheme.platformInstagram;
    if (platform.toLowerCase().contains('face')) return AppTheme.platformFacebook;
    return AppTheme.secondary;
  }
}
