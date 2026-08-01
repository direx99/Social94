import 'package:cloud_firestore/cloud_firestore.dart';

class Campaign {
  final String id;
  final String name;
  final String goal;
  final List<String> platforms;
  final String status;
  final String startDate;
  final String endDate;
  final String budget;
  final String reach;
  final String engagement;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Campaign({
    required this.id,
    required this.name,
    required this.goal,
    required this.platforms,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.budget,
    required this.reach,
    required this.engagement,
    this.createdAt,
    this.updatedAt,
  });

  factory Campaign.fromFirestore(DocumentSnapshot doc) {
    final map = doc.data() as Map<String, dynamic>? ?? {};
    return Campaign(
      id: doc.id,
      name: map['name'] ?? '',
      goal: map['goal'] ?? '',
      platforms: (map['platforms'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: map['status'] ?? 'draft',
      startDate: map['startDate'] ?? '',
      endDate: map['endDate'] ?? '',
      budget: map['budget'] ?? '',
      reach: map['reach'] ?? '',
      engagement: map['engagement'] ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
    );
  }
}
