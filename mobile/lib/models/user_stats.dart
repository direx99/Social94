class PlatformStats {
  final String name;
  final int followers;
  final String growth;

  PlatformStats({required this.name, required this.followers, required this.growth});

  factory PlatformStats.fromMap(Map<String, dynamic> map) {
    return PlatformStats(
      name: map['name'] ?? '',
      followers: map['followers'] ?? 0,
      growth: map['growth'] ?? '0%',
    );
  }
}

class ReachDataPoint {
  final String month;
  final int instagram;
  final int facebook;
  final int tiktok;
  final int youtube;

  ReachDataPoint({
    required this.month,
    required this.instagram,
    required this.facebook,
    required this.tiktok,
    required this.youtube,
  });

  factory ReachDataPoint.fromMap(Map<String, dynamic> map) {
    return ReachDataPoint(
      month: map['month'] ?? '',
      instagram: map['instagram'] ?? 0,
      facebook: map['facebook'] ?? 0,
      tiktok: map['tiktok'] ?? 0,
      youtube: map['youtube'] ?? 0,
    );
  }
}

class UserStats {
  final int totalReach;
  final num engagementRateNum;
  final int postsScheduled;
  final int activeCampaigns;
  final int newFollowers;
  final int avgReachPerPost;
  final List<PlatformStats> platformStats;
  final List<ReachDataPoint> reachOverTime;
  final List<Map<String, dynamic>> ageData;

  UserStats({
    required this.totalReach,
    required this.engagementRateNum,
    required this.postsScheduled,
    required this.activeCampaigns,
    required this.newFollowers,
    required this.avgReachPerPost,
    required this.platformStats,
    required this.reachOverTime,
    required this.ageData,
  });

  factory UserStats.fromMap(Map<String, dynamic> map) {
    return UserStats(
      totalReach: map['totalReach'] ?? 0,
      engagementRateNum: map['engagementRate'] ?? 0,
      postsScheduled: map['postsScheduled'] ?? 0,
      activeCampaigns: map['activeCampaigns'] ?? 0,
      newFollowers: map['newFollowers'] ?? 0,
      avgReachPerPost: map['avgReachPerPost'] ?? 0,
      platformStats: (map['platformStats'] as List<dynamic>?)
              ?.map((e) => PlatformStats.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      reachOverTime: (map['reachOverTime'] as List<dynamic>?)
              ?.map((e) => ReachDataPoint.fromMap(e as Map<String, dynamic>))
              .toList() ??
          [],
      ageData: (map['ageData'] as List<dynamic>?)
              ?.map((e) => Map<String, dynamic>.from(e as Map))
              .toList() ??
          [],
    );
  }
  
  String get formattedEngagementRate => '${engagementRateNum.toStringAsFixed(1)}%';
}
