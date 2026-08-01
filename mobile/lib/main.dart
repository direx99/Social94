import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'core/theme.dart';
import 'core/navigation/bottom_nav.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/auth_service.dart';
import 'services/firestore_service.dart';
import 'models/user_stats.dart';
import 'models/campaign.dart';
import 'models/reminder.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Social94',
      theme: AppTheme.lightTheme,
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: AuthService().authStateChanges,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasData && snapshot.data != null) {
          final user = snapshot.data!;
          final firestore = FirestoreService();
          
          return MultiProvider(
            providers: [
              StreamProvider<UserStats?>(
                create: (_) => firestore.streamUserStats(user.uid),
                initialData: null,
              ),
              StreamProvider<List<Campaign>>(
                create: (_) => firestore.streamCampaigns(user.uid),
                initialData: const [],
              ),
              StreamProvider<List<Reminder>>(
                create: (_) => firestore.streamReminders(user.uid),
                initialData: const [],
              ),
            ],
            child: const BottomNav(),
          );
        }
        return const LoginScreen();
      },
    );
  }
}

