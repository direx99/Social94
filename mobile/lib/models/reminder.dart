import 'package:cloud_firestore/cloud_firestore.dart';

class Reminder {
  final String id;
  final String title;
  final String message;
  final String platform;
  final String datetime;
  final String recurrence;
  final String status;
  final DateTime? createdAt;

  Reminder({
    required this.id,
    required this.title,
    required this.message,
    required this.platform,
    required this.datetime,
    required this.recurrence,
    required this.status,
    this.createdAt,
  });

  factory Reminder.fromFirestore(DocumentSnapshot doc) {
    final map = doc.data() as Map<String, dynamic>? ?? {};
    return Reminder(
      id: doc.id,
      title: map['title'] ?? '',
      message: map['message'] ?? '',
      platform: map['platform'] ?? '',
      datetime: map['datetime'] ?? '',
      recurrence: map['recurrence'] ?? '',
      status: map['status'] ?? 'pending',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
    );
  }
}
