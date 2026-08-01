import 'package:flutter/material.dart';
import '../../core/theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: const Text(
          '''Privacy Policy for Social94

Last updated: July 2026

1. Introduction
Welcome to Social94. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.

2. Information We Collect
We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.

3. How We Use Your Information
We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.

4. Will Your Information Be Shared With Anyone?
We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.

5. How Long Do We Keep Your Information?
We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.

6. How Do We Keep Your Information Safe?
We aim to protect your personal information through a system of organizational and technical security measures.

7. What Are Your Privacy Rights?
You may review, change, or terminate your account at any time.

8. Updates to This Policy
We may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
''',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 14,
            height: 1.5,
          ),
        ),
      ),
    );
  }
}
