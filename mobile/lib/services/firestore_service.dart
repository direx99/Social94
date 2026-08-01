import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_stats.dart';
import '../models/campaign.dart';
import '../models/reminder.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<UserStats?> streamUserStats(String uid) {
    return _db
        .collection('users')
        .doc(uid)
        .collection('meta')
        .doc('stats')
        .snapshots()
        .map((snap) {
      if (!snap.exists) return null;
      return UserStats.fromMap(snap.data()!);
    });
  }

  Stream<List<Campaign>> streamCampaigns(String uid) {
    return _db
        .collection('users')
        .doc(uid)
        .collection('campaigns')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => Campaign.fromFirestore(doc)).toList());
  }

  Stream<List<Reminder>> streamReminders(String uid) {
    return _db
        .collection('users')
        .doc(uid)
        .collection('reminders')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => Reminder.fromFirestore(doc)).toList());
  }
}
