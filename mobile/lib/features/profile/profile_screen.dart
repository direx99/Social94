import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/theme.dart';
import '../auth/auth_service.dart';
import 'privacy_policy_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final email = user?.email ?? 'user@example.com';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 32),
            const CircleAvatar(
              radius: 50,
              backgroundColor: AppTheme.primaryLight,
              child: Text(
                'D',
                style: TextStyle(
                  fontSize: 40,
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              email,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 32),
            const Divider(color: AppTheme.border),
            ListTile(
              leading: const Icon(Icons.person, color: AppTheme.primary),
              title: const Text('Account Details'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // Future expansion
              },
            ),
            const Divider(color: AppTheme.border),
            ListTile(
              leading: const Icon(Icons.privacy_tip, color: AppTheme.primary),
              title: const Text('Privacy Policy'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()),
                );
              },
            ),
            const Divider(color: AppTheme.border),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
              onTap: () async {
                await AuthService().signOut();
                if (context.mounted) {
                  Navigator.of(context).popUntil((route) => route.isFirst);
                }
              },
            ),
            const Divider(color: AppTheme.border),
          ],
        ),
      ),
    );
  }
}
