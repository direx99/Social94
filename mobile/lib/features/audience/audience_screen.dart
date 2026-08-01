import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme.dart';
import '../../models/user_stats.dart';

class AudienceScreen extends StatelessWidget {
  const AudienceScreen({super.key});

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
            Text('Audience Overview', style: Theme.of(context).textTheme.titleLarge),
            Text(
              "Track your audience growth & demographics",
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Show Update Stats Modal
            },
          ),
          IconButton(
            icon: const Icon(Icons.bolt),
            color: AppTheme.primary,
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSummaryStats(stats),
            const SizedBox(height: 24),
            _buildReachChart(context),
            const SizedBox(height: 24),
            _buildPlatformBreakdown(context),
            const SizedBox(height: 24),
            _buildDemographics(context, stats),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryStats(UserStats? stats) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.3,
      children: [
        _statCard(
            'Total Followers',
            stats != null ? '${(stats.totalReach / 1000).toStringAsFixed(1)}K' : '-',
            Icons.people,
            AppTheme.primary),
        _statCard(
            'Avg Reach/Post',
            stats != null ? '${(stats.avgReachPerPost / 1000).toStringAsFixed(1)}K' : '-',
            Icons.visibility,
            AppTheme.secondary),
        _statCard(
            'Engagement Rate',
            stats != null ? stats.formattedEngagementRate : '-',
            Icons.trending_up,
            AppTheme.accentEmerald),
        _statCard(
            'New Followers',
            stats != null ? '+${stats.newFollowers}' : '-',
            Icons.arrow_outward,
            AppTheme.accentAmber),
      ],
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color) {
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
          Icon(icon, color: color, size: 20),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          Text(title, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _buildReachChart(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('📈 Reach Over Time', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              height: 220,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 22,
                        getTitlesWidget: (value, meta) {
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                          if (value.toInt() >= 0 && value.toInt() < months.length) {
                            return Text(months[value.toInt()], style: const TextStyle(fontSize: 10, color: AppTheme.textMuted));
                          }
                          return const Text('');
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 1),
                        FlSpot(1, 1.5),
                        FlSpot(2, 1.4),
                        FlSpot(3, 3.4),
                        FlSpot(4, 2),
                        FlSpot(5, 2.2),
                        FlSpot(6, 4.5),
                      ],
                      isCurved: true,
                      color: AppTheme.platformInstagram,
                      barWidth: 2,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppTheme.platformInstagram.withValues(alpha: 0.1),
                      ),
                    ),
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 2),
                        FlSpot(1, 2.5),
                        FlSpot(2, 2.4),
                        FlSpot(3, 1.5),
                        FlSpot(4, 2.8),
                        FlSpot(5, 3.2),
                        FlSpot(6, 3.5),
                      ],
                      isCurved: true,
                      color: AppTheme.platformFacebook,
                      barWidth: 2,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppTheme.platformFacebook.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPlatformBreakdown(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('🌐 Platform Breakdown', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                SizedBox(
                  width: 120,
                  height: 120,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 30,
                      sections: [
                        PieChartSectionData(color: AppTheme.platformInstagram, value: 40, title: '', radius: 30),
                        PieChartSectionData(color: AppTheme.platformFacebook, value: 30, title: '', radius: 30),
                        PieChartSectionData(color: AppTheme.platformTikTok, value: 20, title: '', radius: 30),
                        PieChartSectionData(color: AppTheme.platformYouTube, value: 10, title: '', radius: 30),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                const Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _LegendRow(color: AppTheme.platformInstagram, name: 'Instagram', value: '18.2K'),
                      SizedBox(height: 8),
                      _LegendRow(color: AppTheme.platformFacebook, name: 'Facebook', value: '13.5K'),
                      SizedBox(height: 8),
                      _LegendRow(color: AppTheme.platformTikTok, name: 'TikTok', value: '9.0K'),
                      SizedBox(height: 8),
                      _LegendRow(color: AppTheme.platformYouTube, name: 'YouTube', value: '4.5K'),
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDemographics(BuildContext context, UserStats? stats) {
    if (stats == null || stats.ageData.isEmpty) {
      return const SizedBox(height: 100, child: Center(child: Text('No Demographic Data')));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('👥 Age Demographics', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: stats.ageData.map((data) {
                final age = data['age']?.toString() ?? '';
                final percent = ((data['percentage'] ?? 0) as num).toDouble();
                return Column(
                  children: [
                    _ageRow(age, percent / 100.0, '${percent.toInt()}%'),
                    const SizedBox(height: 12),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
  Widget _ageRow(String label, double percent, String percentText) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            Text(percentText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primary)),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: percent,
          backgroundColor: AppTheme.borderLight,
          color: AppTheme.primary,
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        )
      ],
    );
  }
}

class _LegendRow extends StatelessWidget {
  final Color color;
  final String name;
  final String value;
  
  const _LegendRow({required this.color, required this.name, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(name, style: const TextStyle(fontSize: 12)),
        const Spacer(),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}
