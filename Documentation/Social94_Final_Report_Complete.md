# Social94: Final Project Report


## Chapter 1: Introduction

### 1.1 Project Background
Social media is no longer just a place to post photos. It functions as the primary marketing engine for businesses and independent creators alike. Platforms like Instagram, Facebook, TikTok, and YouTube dictate how audiences discover products, follow brands, and decide what to buy. But managing multiple platforms creates a logistical problem. Creators find themselves constantly switching between applications to track their follower growth, monitor post performance, and analyze audience reach. This fragmentation wastes time and causes data to slip through the cracks.

Marketing today requires data. You cannot just post content and hope for the best. You have to monitor reach, track engagement rates, and adjust your strategy based on what the algorithm rewards. Large corporations solve this by hiring dedicated social media managers and purchasing enterprise software. Small businesses, students, and independent creators do not have that luxury. The software available to them is either prohibitively expensive or too complicated for casual use. They need a tool that handles the heavy lifting without the enterprise price tag.

Social94 addresses this directly. It is an automated social media marketing platform built to track, manage, and analyze audience reach from a single dashboard. I built it using a decoupled architecture: a Next.js web application for deep desktop analysis and a Flutter mobile application for checking statistics on the go. More importantly, Social94 does not just display numbers. It integrates Google's Gemini AI to analyze content, generate marketing copy, and provide actionable audience insights. It also employs targeted web scraping to pull data from platforms like Instagram, Facebook, TikTok, and YouTube, bypassing the traditional bottlenecks of fragmented APIs.

The decision to build on two separate platforms (web and mobile) was deliberate. A desktop browser gives you the screen space for detailed charts, campaign configuration, and long-form AI interactions. A phone gives you quick access to reminders, follower counts, and daily check-ins. By connecting both clients to the same Firebase backend, any change made on one device appears on the other immediately. This is not a theoretical feature. The implementation uses real-time Firestore listeners and `StreamBuilder` widgets, which I will detail in later chapters.

### 1.2 Problem Statement
Despite the sheer volume of social media tools on the market, the average creator still struggles. The core problems fall into four distinct categories:

1. **Fragmented Data Ecosystems:** Instagram, TikTok, Facebook, and YouTube do not talk to each other. They actively prevent cross-platform data sharing to keep users inside their own walled gardens. A creator must log into three or four different developer portals or apps just to pull a weekly report. There is no single place where you can see your Instagram followers alongside your TikTok engagement rate and your YouTube subscriber growth.

2. **Enterprise Pricing Models:** Tools like Hootsuite and Sprout Social built their products for large teams. They removed their free tiers years ago. A single creator pulling basic analytics cannot justify spending hundreds of dollars a month. Buffer, which started as the affordable alternative, now paywalls its analytics features behind a paid plan. The free tier only lets you schedule posts without seeing how they performed.

3. **Overwhelming Interfaces:** When small creators do pay for these tools, they face dashboards flooded with irrelevant metrics. They don't need team collaboration features or complex CRM funnels. They don't need approval workflows or multi-seat admin panels. They need to know if their audience grew this week and what content caused that growth.

4. **The AI Gap:** Artificial intelligence can draft posts and analyze trends in seconds. But most affordable tools have not integrated LLMs (Large Language Models) natively into their dashboards. Creators have to copy their statistics, paste them into ChatGPT or Gemini, ask for insights, and then copy the advice back to their planning document. This copy-paste workflow is clumsy and breaks the creative flow.

### 1.3 Aims and Objectives

#### 1.3.1 Aim
The primary aim of this project is to engineer and evaluate a cross-platform social media marketing system. This system must centralize audience metrics, automate content analysis using artificial intelligence, and provide an interface that non-technical creators can actually use.

#### 1.3.2 Objectives
To achieve this aim, I set the following technical and research objectives:
- Evaluate existing social media management tools to document their pricing structures, technical limitations, and feature gaps.
- Gather functional requirements from independent creators to determine exactly what metrics matter to them.
- Design a scalable system architecture utilizing Next.js for the web client, Flutter for the mobile client, and Firebase for backend synchronization.
- Implement specialized API routes to handle web scraping for platforms that restrict data access, specifically targeting Instagram, Facebook, TikTok, and YouTube.
- Integrate the Gemini AI API to provide automated content analysis, copy generation, audience insights, and reminder message generation directly within the user dashboard.
- Develop manual and automated data entry mechanisms backed by a NoSQL Firestore database.
- Execute component, integration, and user acceptance testing to ensure data accuracy and system stability across web, iOS, and Android platforms.
- Evaluate the final product against the initial requirements and document the technical challenges overcome during development.

### 1.4 Scope of the Project
Social94 encompasses a web dashboard and a mobile application. The web dashboard, built on Next.js 16 with the App Router, serves as the primary control center. It provides large-scale data visualization using the Recharts library, campaign management, AI-powered content analysis with multimodal (text and image) support, and direct interaction with the AI generation tools. The Flutter mobile app serves as a companion, allowing users to check real-time statistics, manage reminders, view campaigns, and review audience data on their phones.

The project currently focuses on audience reach tracking across four platforms (Instagram, Facebook, TikTok, YouTube), AI-assisted content analysis, AI-generated marketing copy, campaign organization, and task reminders. I built separate web scraping routes for Instagram (`api/instagram-scrape/route.ts`) and for Facebook, TikTok, and YouTube (`api/social-scrape/route.ts`) to automatically pull specific profile data, supplementing the manual entry features. The system handles secure user authentication via Google Sign-In, profile management, and real-time database synchronization via Firebase.

The scope strictly excludes automated posting. The system advises the user on what to post and when, but it does not execute the final publish action. Direct posting requires full OAuth integration with the Graph API and TikTok API, which involves lengthy corporate approval processes that fall outside the timeline of a university project. The system also excludes team collaboration features, which are unnecessary for the solo-creator target audience.

### 1.5 Document Structure
I structured this report to follow the natural progression of the software development lifecycle:
- **Chapter 1: Introduction** defines the problem and the scope.
- **Chapter 2: Literature Review** examines the theoretical foundation of social media algorithms, web scraping, and AI integration, alongside an analysis of competitor software.
- **Chapter 3: Methodology** details the Agile framework used to manage the project.
- **Chapter 4: Investigation and Analysis** breaks down the functional and non-functional requirements gathered from users.
- **Chapter 5: Design** outlines the system architecture, database schema, AI pipeline design, and UI design system.
- **Chapter 6: Implementation** explains the actual code. It covers the Next.js routes, the Flutter widget tree, the web scraping logic, the Gemini AI integration, and the real-time synchronization mechanisms.
- **Chapter 7: Evaluation of Product** reviews the testing results and user feedback.
- **Chapter 8: Critical Evaluation** reflects on the technical failures, the successes, and the lessons learned.
- **Chapter 9: Conclusion** summarizes the project and outlines future technical updates.

---

## Chapter 2: Literature Review

### 2.1 The Context of Social Media Software
Before writing the first line of code for Social94, I needed to understand the technical and commercial landscape of social media marketing. This literature review does not just look at competitor apps. It breaks down the underlying technologies that make these apps work. Specifically, I looked at the shift from basic analytics to AI-driven insights, the technical hurdles of data aggregation, the friction between open web scraping and locked APIs, and the emerging role of large language models in content generation.

The barrier to entry for digital creators has never been lower, but the barrier to sustained success has never been higher. Ten years ago, you could build an audience simply by posting consistently. Now, you compete against millions of others in algorithmically curated feeds designed to maximize user retention. Software tools evolved to help creators navigate this complexity, but as the platforms changed, the tools became bloated. By analyzing how we got here, the technical decisions behind Social94 become clear.

### 2.2 The Technical Evolution of Audience Tracking
In 2010, tracking a social media audience meant looking at a follower count. It was a static, superficial number. You posted a photo, it went into a chronological feed, and a percentage of your followers saw it.

Today, algorithms power the platforms. They do not care how many followers you have; they care about engagement velocity, view duration, and watch-time completion rates. When platforms introduced the algorithmic feed-first Facebook, then Instagram, and most aggressively TikTok-reach decoupled from follower count. A creator with 1,000 followers can reach 1,000,000 people if the algorithm decides the content keeps users on the app.

Because of this, metrics shifted. "Audience Reach"-the number of unique accounts that see a post-became the primary indicator of digital health. "Engagement Rate"-the percentage of reached users who interact with the post through likes, comments, shares, or saves-became the secondary metric that drives algorithmic distribution. If a post gets high engagement in its first hour, the algorithm pushes it to a wider audience.

However, extracting this data programmatically is difficult. Ten years ago, platforms offered open APIs. A developer could easily pull a user's feed, statistics, and follower lists. Following major data privacy scandals like Cambridge Analytica in 2018, platforms locked down their data. They introduced strict OAuth requirements, rate limits, and aggressive review processes. They built "walled gardens" to ensure users-and developers-stayed within their ecosystems.

Today, if a developer wants to pull basic reach statistics from Instagram, they must navigate the Facebook Graph API, register a corporate business entity, submit screencasts of their application, and wait weeks for approval. This API fragmentation forced developers to find alternative ways to gather data, leading to the rise of specialized web scraping.

The evolution of tracking also introduced the concept of cross-platform analytics. A creator on Instagram, TikTok, and YouTube needs to understand which platform delivers the best return on their time investment. Comparing Instagram's "Reach" metric with TikTok's "Views" and YouTube's "Impressions" requires normalizing data from different sources into a consistent format. This normalization challenge is something Social94 addresses through its unified `UserStats` data model, which stores platform-specific follower counts in a single Firestore document.

### 2.3 NoSQL Databases and Real-Time Synchronization
The choice of database technology significantly affects how quickly a product can iterate. Traditional relational databases like MySQL and PostgreSQL use rigid table schemas. Every column must be defined before data can be inserted. If you need to add a new metric-like "saves" for Instagram or "stitches" for TikTok-you have to run a migration script that alters the table structure across every environment. This slows down development.

NoSQL databases, specifically document-oriented databases like Firebase Firestore, take a different approach. Each document is a JSON-like object that can contain any fields. If you need to add a metric to one user's statistics but not another's, you simply write a new field to that specific document. There are no migrations and no schema conflicts.

Firestore adds another critical capability: real-time listeners. Unlike a traditional REST API where the client must repeatedly poll the server for updates, Firestore allows clients to subscribe to a document or collection. When any field in that document changes, Firestore pushes the update to all subscribed clients over a persistent WebSocket connection.

This is the foundation of Social94's cross-platform sync. The web dashboard writes a new follower count to Firestore, and the Flutter app receives the updated value within one to two seconds, without any polling loop or manual refresh button. This technology choice was informed by studying real-time collaborative applications like Google Docs and Figma. The key insight from these applications is that perceived responsiveness matters more than raw speed. If a user sees their data update instantly after entering it, the system feels reliable.

### 2.4 Web Scraping vs. Official APIs
Data aggregation software relies on two methods to get information: Official APIs and Web Scraping. Understanding the difference is crucial because it dictated how Social94 handles data ingestion.

#### 2.4.1 Official APIs
An API (Application Programming Interface) is a sanctioned backdoor into a platform's database. When a user logs into a tool like Hootsuite, they authenticate via OAuth. The platform hands Hootsuite a token, and Hootsuite uses that token to ask the platform's database for the user's statistics.

The primary advantage is stability. If the platform updates its website design, the API usually remains unchanged. The data arrives structured in clean JSON formats. Rate limits are documented and predictable.

The disadvantage is the heavy restriction. Platforms frequently revoke tokens, change rate limits, or completely deprecate endpoints without warning. Twitter shut down its free API access entirely in 2023, breaking thousands of dependent apps overnight. Getting access in the first place requires jumping through corporate hoops, submitting application reviews, and often paying for expensive access tiers.

#### 2.4.2 Web Scraping
Web scraping bypasses the API entirely. A script acts like a human using a web browser. It navigates to a URL, reads the raw HTML of the page, searches for specific meta tags, Open Graph properties, or JSON-LD structured data, and extracts the text.

The main benefit is freedom. It does not require corporate approval. If the data is visible on a public webpage, a scraper can read it. This allows independent developers to build tools quickly without waiting on Meta or Google. It works across any platform that serves public HTML pages.

The downside is brittleness. Web scraping is a constant cat-and-mouse game. If Instagram changes a single meta tag format or starts rendering follower counts entirely through client-side JavaScript, the scraper breaks. The code must be updated immediately. Platforms also deploy anti-bot measures like rate limiting, CAPTCHAs, and login walls. This forces scrapers to rotate IP addresses or mimic human scrolling behavior to avoid getting blocked.

Social94 uses a hybrid approach. It relies on manual entry for secure, long-term tracking of private metrics like exact reach. But it implements custom scraping routes for four platforms: Instagram, Facebook, TikTok, and YouTube. The scraping logic targets Open Graph meta tags and JSON-LD structured data rather than visual DOM elements, making it slightly more resilient to front-end design changes.

### 2.5 The Integration of AI in Marketing Software
The most significant shift in marketing software over the last two years is the integration of Large Language Models (LLMs). Early marketing tools used basic automation. If you typed a post, the software published it on Tuesday at an optimal time. AI changed the paradigm from automation to generation.

Models like OpenAI's GPT-4 and Google's Gemini can analyze large datasets and return plain-English insights. In the context of social media, this means a user no longer has to look at a line graph and guess why it went down. An LLM can ingest the statistics of the last ten posts, analyze the text of the captions, and state exactly what changed.

The literature shows that users struggle most with "blank page syndrome." They know they need to post, but they don't know what to write. AI solves this. By feeding an LLM the user's campaign details-the campaign name, the target audience, the desired platforms, the tone of voice, and the budget-the AI can generate highly targeted copy with appropriate hashtags and calls-to-action.

However, many competitor tools bolt AI onto their platforms as an afterthought. They add a generic chatbot interface that the user must prompt manually. This is lazy integration. LLMs are prone to hallucination-inventing facts when unsure-and they return free-form text by default, which makes parsing the response in a frontend application unreliable.

Social94 embeds the AI natively. The Gemini API drives specific, focused features: analyzing content quality, suggesting campaign ideas, generating audience insights, and crafting reminder messages. Each feature uses a dedicated API route with tailored prompt engineering. To control the output format, Social94 includes strict JSON schema definitions in every prompt. The API routes extract JSON from the response using regex matching, parse it, and return clean, structured data to the frontend. This approach eliminates the formatting inconsistencies that plague generic chatbot integrations.

### 2.6 Analysis of Existing Market Solutions
To position Social94 correctly, I analyzed major incumbents in the social media management space. They fall into three broad categories: enterprise suites, legacy schedulers, and niche visual planners.

#### 2.6.1 Enterprise Suites (Hootsuite, Sprout Social)
Hootsuite and Sprout Social are the industry standards for large teams. They are massive, monolithic web applications that handle scheduling, granular analytics, customer support ticketing, and team management workflows. Their strength lies in unmatched API integrations. If a platform exists, they connect to it.

Their weakness is feature bloat and cost. A solo creator logs in and is overwhelmed by tools they will never use. They don't need multi-seat admin panels or approval workflows. The pricing reflects this enterprise focus, with plans often starting around $99 per month, making them entirely inaccessible to the demographic Social94 targets.

#### 2.6.2 Legacy Schedulers (Buffer)
Buffer started as a simple, affordable scheduling tool and evolved into a broader platform. It features a clean, modular architecture and focuses heavily on the publishing queue. It recently added a basic AI assistant.

Its primary strength is excellent UI/UX. The interface is intuitive, and they offer a free tier for basic scheduling. The onboarding experience is smooth.

The problem is the paywall. Their analytics are locked behind paid tiers. A free user cannot see historical growth data or engagement trends. Their AI integration is currently limited to basic text expansion rather than deep audience analysis. They do not offer cross-platform comparison dashboards on the free plan.

#### 2.6.3 Niche Visual Planners (Later)
Later carved out a niche by focusing entirely on visual planning for Instagram. It relies heavily on drag-and-drop interfaces and visual media libraries.

It offers the best visual calendar in the market. Users can see exactly what their Instagram grid will look like before posting. However, it is practically useless for text-heavy platforms like Twitter or LinkedIn. It forces users into a highly visual workflow that doesn't fit every marketing strategy. Like the others, deep analytics cost a premium, and there is no native AI content analysis feature.

#### 2.6.4 Native Platform Tools (Meta Business Suite)
Platforms offer their own free tools, like Meta Business Suite. These provide highly accurate data because they come directly from the source. However, they only track their own platforms. Meta Business Suite will not show you your TikTok views or YouTube subscribers. They actively perpetuate the fragmented data problem.

### 2.7 The Justification for Social94
The market analysis reveals a distinct gap. The tools that have the data are too expensive and complex. The tools that are affordable hide their analytics behind paywalls. The native tools refuse to talk to each other. And almost none of them have integrated LLMs deeply enough to actually replace a marketing manager.

Social94 exists to fill this gap. It drops the complex enterprise features to focus entirely on the solo creator.

By separating the Next.js frontend and the Flutter mobile app, the system ensures performance isn't bogged down by a monolithic codebase. The Next.js App Router enables server-side rendering for performance, while Flutter compiles to native code on iOS and Android.

Using localized web scraping alongside manual entry gives users immediate access to their cross-platform data without waiting on API approvals. The scraping covers four major platforms, which is broader than most free tools offer.

Natively integrating Google's Gemini models directly into the Next.js API routes means the user gets automated content analysis, copy generation, and audience insights without ever leaving the dashboard. The AI is not an add-on chat window; it drives the core workflow.

This combination of a decoupled modern stack, intelligent data aggregation, and structured AI integration positions Social94 as a lightweight but highly capable alternative to legacy marketing tools.


## Chapter 3: Methodology

### 3.1 Choosing the Development Framework
Building a software system requires a structured approach. I evaluated traditional frameworks like Waterfall and Prototyping, but they failed to meet the specific demands of this project. Waterfall demands strict, unchangeable requirements before a single line of code is written. But when you integrate external APIs like Google's Gemini or build web scrapers that rely on the shifting DOM structure of Instagram, requirements change daily. You cannot plan a rigid three-month roadmap when an API endpoint might deprecate next week or when a platform updates its HTML structure without notice.

Prototyping was considered briefly. The advantage of Prototyping is that you build a rough version of the product quickly and refine it based on feedback. However, Prototyping does not handle parallel development well. Building a Next.js web app and a Flutter mobile app simultaneously requires coordinating shared data models, authentication flows, and API contracts between two completely different technology stacks. A linear prototype cycle would force me to finish one platform before starting the other, wasting time.

I chose the Agile Software Development Methodology. Agile breaks the project down into short, time-boxed iterations called "sprints." It prioritizes working software over comprehensive documentation and allows for rapid pivoting. If a specific Next.js feature (like Server Components) conflicts with a Firebase client library mid-sprint, Agile dictates that you adjust the architecture immediately rather than sticking to a flawed initial design document.

### 3.2 The Agile Lifecycle in Practice
Working as a solo developer meant I had to adapt standard Agile ceremonies. I did not hold daily stand-ups with a team. Instead, I maintained a strict digital Kanban board. Every feature, bug, and API integration became a "ticket." I divided the development of Social94 into four distinct sprints, each lasting approximately two weeks.

#### 3.2.1 Sprint 1: Foundation and Dual Architecture
The goal of the first sprint was establishing the infrastructure. Because I decided to build both a web application and a mobile application simultaneously, this sprint required heavy configuration.

I initialized the Next.js project using the App Router with TypeScript, setting up strict type checking to catch errors early. The `tsconfig.json` configured path aliases (`@/components`, `@/lib`, `@/context`) so that imports remained clean and readable throughout the codebase. Simultaneously, I created the Flutter project targeting iOS, Android, and web. The Dart SDK version was set to `^3.12.2` in `pubspec.yaml`.

The primary technical hurdle was linking both of these entirely different codebases to a single Firebase backend. On the web side, I created `lib/firebase.ts`, which initializes the Firebase app using environment variables stored in `.env.local`. A critical implementation detail here was preventing re-initialization during Next.js hot reloads: `const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]`. Without this check, every hot reload would crash the application with a "Firebase app already initialized" error.

On the mobile side, I used the FlutterFire CLI to generate the `firebase_options.dart` file, configuring the App IDs and Project IDs so that an account created on the web would immediately exist on the mobile app. The FlutterFire CLI auto-generates a platform switch that selects the correct API keys based on whether the app compiles for iOS, Android, or web.

By the end of Sprint 1, I had two blank applications successfully reading and writing to the same Firestore database. Authentication on the web used `signInWithPopup` (Google Sign-In), while the mobile app used the `google_sign_in` package with Firebase Auth.

#### 3.2.2 Sprint 2: Core Data and The Dashboard
Sprint 2 focused on giving the user a place to put their data. I built the `users` collection in Firestore and established the `UserStats` schema in the `lib/firestore.ts` file. This schema defines the core data model: `totalReach`, `engagementRate`, `postsScheduled`, `activeCampaigns`, `newFollowers`, `avgReachPerPost`, along with nested arrays for `platformStats`, `reachOverTime`, `ageData`, `locationData`, and `engagementByDay`.

On the web client, I built the sidebar navigation (`Sidebar.tsx`) with five main navigation items (Dashboard, Audience Reach, Content Quality, Campaigns, Reminders) and three secondary items (Settings, Help and Support, Privacy Policy). I implemented an `AuthGuard.tsx` component to wrap the protected routes, ensuring unauthenticated users bounced back to the login screen. The AuthGuard listens to the `AuthContext` and checks the `user` and `loading` states before rendering children.

On the Flutter side, I built the `dashboard_screen.dart` and implemented a `StreamBuilder`. This was a critical Agile victory: the `StreamBuilder` listened to Firestore in real-time. If I manually entered a new follower count on the Next.js web app, the Flutter mobile app updated instantly without a refresh. The `FirestoreService` class in Dart exposes three stream methods: `streamUserStats`, `streamCampaigns`, and `streamReminders`. These streams are injected into the widget tree using the `provider` package's `MultiProvider` in `main.dart`.

#### 3.2.3 Sprint 3: The AI Integration
This sprint defined the project. I integrated Google's Gemini API into the Next.js backend. I created specific API routes, each targeting a distinct marketing task:
- `api/gemini/analyze-content/route.ts` - Analyzes post text and optional images for quality, sentiment, readability, engagement potential, and suggests hashtags and optimal posting times.
- `api/gemini/audience-insight/route.ts` - Takes audience statistics and generates a concise, actionable growth insight.
- `api/gemini/generate-copy/route.ts` - Generates three platform-specific post variants with captions, hashtags, and calls-to-action based on campaign details.
- `api/gemini/generate-reminder/route.ts` - Crafts engaging reminder messages for social media tasks.

Working with LLMs in an Agile environment requires constant iteration. You cannot just send a generic prompt to Gemini and expect good marketing advice. I spent days adjusting the prompt engineering within the API routes, ensuring the AI received structured context before generating a response. The `analyze-content` route, for example, defines a strict JSON schema (`ANALYSIS_SCHEMA`) in the prompt, demanding the AI return specific fields like `score`, `sentiment`, `readability`, `engagement`, `hashtags`, `improvements`, and `strengths`. This eliminates free-form text responses that would be impossible to parse on the frontend.

I also built a centralized `lib/gemini.ts` helper with automatic retry logic and exponential backoff. If the Gemini API fails (due to rate limiting or temporary outages), the system retries up to three times with delays of 2 seconds, 4 seconds, and 8 seconds before giving up. This retry mechanism uses the formula `Math.min(2000 * Math.pow(2, attempt), 15000)` to cap the maximum delay at 15 seconds.

#### 3.2.4 Sprint 4: Scraping, Multi-Platform, and Polish
The final sprint addressed the data entry bottleneck. Manual entry works, but it causes friction. I built `api/instagram-scrape/route.ts` to programmatically pull public Instagram profile data by parsing Open Graph meta tags and JSON-LD structured data from the raw HTML. I then expanded this approach to three additional platforms by building `api/social-scrape/route.ts`, which handles Facebook, TikTok, and YouTube scraping with platform-specific parsing logic.

This sprint also covered the implementation of the `Campaigns` and `Reminders` features on both web and mobile. The campaign system stores data including name, goal, target platforms, status (active, scheduled, completed, draft), dates, budget, reach, and engagement metrics. The reminders system stores titles, messages, platforms, datetime, recurrence patterns, and completion status. Both systems use Firestore's `onSnapshot` listener for real-time updates.

I finalized the "Social94 Design System," ensuring the light theme and "Outfit" typography remained consistent across every screen. On the Flutter side, I created a dedicated `theme.dart` file in `lib/core/` that defines the complete `ThemeData` including brand colours (primary purple `#7C3AED`, secondary cyan `#06B6D4`, emerald, amber), surface colours, text colours, platform-specific colours, and status indicator colours.

### 3.3 Project Management Tools
To execute these sprints, I relied heavily on Git for version control. When building experimental features-like the web scraper-I branched off the main codebase. If the scraper caused memory leaks or failed to parse the HTML correctly, I could abandon the branch without breaking the stable dashboard code. The Kanban board tracked progress, ensuring I did not start a new feature (like Campaign tracking) until the core dependencies (like user authentication) were fully tested and deployed.

I also used ESLint with the `eslint-config-next` configuration for code quality enforcement on the web side, and `flutter_lints` with custom `analysis_options.yaml` on the mobile side. These linting tools caught type errors, unused imports, and potential null reference issues before they reached production.

### 3.4 Testing Strategy Within Agile
Each sprint concluded with a testing phase before the code merged into the main branch. I adopted a three-tier testing strategy:

1. **Manual Component Testing:** After building each frontend component or API route, I tested it manually with expected inputs (valid data), boundary inputs (empty strings, very large numbers), and invalid inputs (malformed JSON, missing fields). This caught obvious bugs before they compounded.

2. **Integration Testing:** At the end of each sprint, I tested the complete data flow from frontend to backend to database and back. For example, I would type a campaign name on the web dashboard, verify it appeared in Firestore, then open the Flutter app and confirm it displayed there within two seconds. This end-to-end testing verified that the TypeScript interfaces in `firestore.ts` matched the Dart model classes in `campaign.dart`.

3. **Regression Testing:** Before starting a new sprint, I re-tested the features from previous sprints to ensure new code had not broken existing functionality. The most common regression was authentication state leaking across pages-a fixed bug that would reappear when I restructured the route hierarchy.

This testing strategy was not perfect. A full test suite with automated unit tests and integration tests would have saved time in later sprints. But as a solo developer working under academic deadlines, manual testing provided adequate coverage while keeping velocity high.

---

## Chapter 4: Investigation and Analysis

### 4.1 Uncovering the Real Problem
Before designing the architecture, I had to understand exactly what small creators needed. Building software based on assumptions leads to feature bloat. I conducted an investigation phase utilizing competitor analysis and informal interviews with independent digital creators.

The initial assumption was that creators wanted a tool to automatically post their content. The investigation proved this wrong. Creators actually enjoy the act of posting-it gives them a final chance to review the formatting, check the hashtags, and make last-minute adjustments. Their actual frustration lies in two specific phases: the planning phase and the post-analysis phase. They struggle to stare at a blank screen and write compelling copy, and they struggle to look at a week's worth of statistics and understand *why* they grew or shrank.

This finding directly shaped the product. Instead of building an auto-poster, I focused the AI integration on content generation (solving the blank-page problem) and content analysis (solving the post-analysis problem).

### 4.2 System Requirements
Based on this feedback, I drafted a strict set of system requirements. I split these into Functional Requirements (the actions the system must perform) and Non-Functional Requirements (the quality, security, and performance standards the system must uphold).

#### 4.2.1 Functional Requirements (FR)
- **FR1 (Authentication):** The system must allow users to register and log in securely using Google Sign-In via Firebase Authentication. On first sign-in, the system must automatically create a Firestore user profile document and initialize default statistics.
- **FR2 (Data Synchronization):** The system must provide a Next.js web dashboard and a Flutter mobile application that read from the exact same real-time database. Changes made on one platform must appear on the other within 2 seconds without manual refresh.
- **FR3 (Data Aggregation):** The system must allow users to input their audience statistics manually, while also providing web-scraping routes to fetch public profile data automatically from Instagram, Facebook, TikTok, and YouTube.
- **FR4 (AI Content Analysis):** The system must take user-provided post data (text and optionally an image), send it to the Gemini API, and return a structured analysis including quality score, sentiment, readability, engagement prediction, suggested hashtags, optimal posting time, improvement suggestions, and strengths.
- **FR5 (AI Copy Generation):** The system must generate three platform-specific marketing copy variants based on the user's campaign name, goal, target platforms, tone, target audience, and budget.
- **FR6 (AI Audience Insight):** The system must analyze the user's current audience statistics and return a concise, actionable growth insight.
- **FR7 (Campaign Management):** The system must allow users to create, update, delete, and track marketing campaigns, storing the campaign details in Firestore with real-time subscription updates.
- **FR8 (Reminders):** The system must allow users to set specific reminders with AI-generated message suggestions and view these reminders on both the web dashboard and the mobile app.

#### 4.2.2 Non-Functional Requirements (NFR)
- **NFR1 (Security):** The system must never store passwords in plain text (handled by Firebase Auth). Route guards must protect all API endpoints and frontend views from unauthorized access. Firestore Security Rules must explicitly reject any read/write request where the user's Auth UID does not match the Document ID. Environment variables must store all API keys and Firebase configuration values.
- **NFR2 (Performance):** The Next.js API routes handling the Gemini LLM requests must return a response within 15 seconds. The system must implement automatic retry with exponential backoff to handle temporary API failures.
- **NFR3 (Cross-Platform Consistency):** The UI must look and behave consistently whether the user accesses it via a desktop Chrome browser, an iOS device, or an Android device. The design system must use the same colour palette, typography (Outfit for headings, Inter for body text), and component patterns across both platforms.
- **NFR4 (Error Handling):** All API routes must return structured error responses with human-readable messages. If an external service fails (Gemini API, web scraping), the system must degrade gracefully with appropriate fallback messaging rather than crashing.

### 4.3 MoSCoW Prioritization
I categorized these requirements using the MoSCoW method to prevent scope creep during the tight academic schedule.

- **Must Have (The core product):** Secure authentication, the cross-platform Firestore connection, manual data entry, the core Gemini AI insight route, content analysis, and copy generation.
- **Should Have (High value, but bypassable):** The Campaigns and Reminders tracking system. The dedicated web scraping routes for Instagram, Facebook, TikTok, and YouTube. The multimodal image analysis feature.
- **Could Have (Quality of life features):** Custom visual components like the `QualityRing.tsx` (SVG-based circular progress indicator) and platform-specific icons (`PlatformIcon.tsx`). The AI-generated reminder messages. The `Toast.tsx` notification system.
- **Won't Have (Excluded from current scope):** Full OAuth integration with the Facebook Graph API for automated publishing. Complex team-collaboration features. Dark mode theme. PDF export of analytics reports.

### 4.4 Use Case Scenarios
To validate the requirements, I mapped out specific use cases. This process clarifies how the backend APIs need to interact with the frontend UI.

**Use Case 1: Analyzing Content Quality**
The user opens the Content Quality page on the web dashboard. They type a post caption and optionally upload an image. They select their target platforms (e.g., Instagram and TikTok) and click "Analyze." The Next.js frontend sends a multipart POST request (if an image is included) or a JSON POST request (text-only) to `api/gemini/analyze-content/route.ts`. The route constructs a detailed prompt including the analysis JSON schema, sends it to Google's Gemini servers (using `generateWithRetry` for text-only or `generateWithImage` for multimodal), parses the JSON from the response, and returns the structured analysis. The frontend renders the quality score in a `QualityRing` component, displays the sentiment, readability, and engagement scores, and lists the suggested hashtags, improvements, and strengths.

**Use Case 2: Generating Campaign Copy**
The user opens the Campaigns screen on the web dashboard. They click "New Campaign" and input the campaign details: name, goal, target platforms, tone, target audience, and budget. They click "Generate Copy." The frontend sends a POST request to `api/gemini/generate-copy/route.ts`. The backend constructs a prompt requesting three post variants, each with a platform-specific caption, hashtags, call-to-action, and character count. The AI returns JSON with three variants. The user reviews them, selects the best one, and saves the campaign to Firestore.

**Use Case 3: Checking Reminders on the Go**
The user is away from their computer. They open the Social94 Flutter app on their iPhone. The `main.dart` file initializes Firebase and checks the auth state using a `StreamBuilder` on `AuthService().authStateChanges`. Seeing a valid user, it wraps the navigation in a `MultiProvider` that injects `StreamProvider<UserStats?>`, `StreamProvider<List<Campaign>>`, and `StreamProvider<List<Reminder>>`. The user taps the bottom navigation bar to open the Reminders screen. The Flutter app displays the reminders pulled in real-time from Firestore.

**Use Case 4: Auto-Fetching Instagram Followers**
The user navigates to the Audience page on the web dashboard. Instead of manually entering their follower count, they type their Instagram username (or paste a profile URL). The frontend sends a POST request to `api/instagram-scrape/route.ts`. The route parses the username from various input formats (URL, @handle, bare username), fetches the public Instagram profile page with browser-like headers, extracts the follower count from Open Graph meta tags and JSON-LD data, estimates an engagement rate based on follower tier, and returns the data. The frontend automatically populates the audience statistics.

### 4.5 Conclusion of Investigation
The investigation phase prevented me from building a tool nobody wanted. By abandoning the idea of an automated poster and focusing instead on AI-driven insights, content analysis, and cross-platform campaign management, the project aligned perfectly with the actual pain points of independent creators. The MoSCoW prioritization ensured that the highly complex features-like the Gemini integration with multimodal support-took precedence over standard boilerplate features, setting a clear technical roadmap for the Design and Implementation phases.


## Chapter 5: Design

### 5.1 Architecture Under the Hood
Building a system that spans the web, iOS, and Android requires a decoupled architecture. If you tightly couple the frontend directly to the database logic without an API layer, you create technical debt instantly. Any change to the database breaks all three platforms simultaneously.

Social94 uses a strict Client-Server architecture. The Next.js web app and the Flutter mobile app are dumb clients. They do not calculate complex metrics or communicate directly with the Gemini LLM. They simply display data and send requests. The server layer handles the heavy lifting. In this case, the server layer is divided into two parts: Google Firebase handles data persistence and authentication, while Next.js API routes act as the middleman for all artificial intelligence and scraping requests.

This separation means the Flutter app never needs to know about the Gemini API key. All AI processing happens server-side through the Next.js routes. The Flutter app only communicates with Firebase for reading and writing user data. If I decide to switch from Gemini to a different LLM in the future, I only need to update the Next.js backend; the mobile app remains completely untouched.

### 5.2 Designing the Database Schema
Choosing a database involves deciding how strict your data needs to be. A traditional SQL database forces data into rigid tables with fixed columns. A NoSQL database, like Firebase Firestore, stores data in flexible, JSON-like documents. Because social media metrics constantly change-TikTok might introduce a new metric tomorrow that Facebook lacks-I chose Firestore for its flexibility.

I structured the database to avoid deep, unreadable nesting. Everything branches from the central `users` collection:
- **`users` Collection:** The root node. It uses the secure UID generated by Firebase Auth as the document ID. The user document stores `displayName`, `email`, `photoURL`, `plan` (free or pro), and `createdAt`.
  - **`meta/stats` Document:** Stores the complete `UserStats` object including `totalReach`, `engagementRate`, `postsScheduled`, `activeCampaigns`, `newFollowers`, `avgReachPerPost`, and nested arrays for `platformStats` (name, followers, growth for each platform), `reachOverTime` (monthly reach data per platform), `ageData` (audience age distribution), `locationData` (audience geography), and `engagementByDay` (daily engagement rates).
  - **`campaigns` Sub-Collection:** Stores campaign documents. Each document contains `name`, `goal`, `platforms` (array), `status`, `startDate`, `endDate`, `budget`, `reach`, `engagement`, `createdAt`, and `updatedAt`.
  - **`reminders` Sub-Collection:** Stores reminder documents with `title`, `message`, `platform`, `datetime`, `recurrence`, `status` (pending, sent, failed), and `createdAt`.
  - **`posts` Sub-Collection:** Stores post analysis history with the complete analysis data returned by the Gemini API, including `content`, `platforms`, `score`, `sentiment`, `readability`, `engagement`, `hashtags`, `emojis`, `bestTime`, `improvements`, `strengths`, `wordCount`, `characterCount`, and `analyzedAt`.

This shallow structure means the Flutter app does not have to download a user's entire dataset just to check if they have a reminder due today. It simply queries the `reminders` sub-collection directly with an `orderBy('createdAt', descending: true)` clause.

### 5.3 Designing the AI Pipeline
The most complex design challenge was the AI pipeline. You cannot simply pass user input directly to the Gemini API; users write vague prompts. If a user types "Make a post about shoes," the AI generates terrible, generic copy.

To fix this, I designed a prompt-engineering layer inside the backend API routes. Each route has a specific role and a specific prompt structure:

1. **Content Analysis Pipeline:** When a user requests analysis, the route builds a context-aware prompt that includes the post content, target platforms, and whether an image is attached. The prompt instructs Gemini to act as a "social media marketing expert" and demands a JSON response matching the `ANALYSIS_SCHEMA` definition. For multimodal requests (text with image), the route converts the uploaded image to base64, wraps it in a `Part` object with the correct MIME type, and sends it alongside the text prompt using `generateWithImage`.

2. **Copy Generation Pipeline:** The route takes six inputs (name, goal, platforms, tone, targetAudience, budget) and constructs a detailed prompt asking for three unique post variants. Each variant must include a platform-specific caption, five hashtags, a clear call-to-action, and a character count. The JSON output structure is defined in the prompt to ensure consistent parsing.

3. **Audience Insight Pipeline:** This is the simplest route. It takes the user's audience data (totalReach, engagementRate, platforms, activeCampaigns), serializes it as JSON in the prompt, and asks Gemini for "ONE concise, actionable insight (2-3 sentences max)." The response is plain text, not JSON, since a single insight does not need structured parsing.

4. **Reminder Generation Pipeline:** The route takes a title, platform, and optional context, then asks Gemini to craft "1-3 sentences, punchy and engaging" with appropriate emojis and a soft call-to-action. This keeps reminder messages platform-appropriate and professional.

By designing the APIs to demand structured JSON output (where applicable) instead of raw text, the Next.js frontend can easily parse the response and render it cleanly without broken formatting.

### 5.4 The User Interface System
I built the "Social94 Design System (Light Theme)" to counter the visual clutter found in enterprise tools. The primary goal was focus. If the user logs in to check their audience reach, that number should be the largest element on the screen.

- **Typography:** I chose "Outfit," a modern, geometric sans-serif font, for all headers and titles. "Inter" serves as the body text font. Both are loaded from Google Fonts. On the Flutter side, these fonts are applied through the `google_fonts` package using `GoogleFonts.outfit()` and `GoogleFonts.inter()` with specific weight and size configurations.
- **Colour Palette:** The primary brand colour is a vibrant purple (`#7C3AED`) paired with a secondary cyan (`#06B6D4`). The background uses light neutrals (white `#FFFFFF` and faint gray `#FAFAFA`), drawing the eye directly to the data cards and interactive elements. Accent colours include emerald green (`#10B981`) for success states, amber (`#F59E0B`) for warnings and scheduled items, and rose (`#F43F5E`) for errors. Platform-specific colours are defined for Instagram (`#E1306C`), Facebook (`#1877F2`), TikTok (`#010101`), and YouTube (`#FF0000`).
- **Custom Components:** I designed specific UI components for data visualization. The `QualityRing.tsx` component uses SVG circles to render a circular progress indicator with animated stroke-dashoffset transitions. The colour changes dynamically based on the score (green for 80+, amber for 60-79, rose for below 60). The `PlatformIcon.tsx` standardizes the logos for Instagram, TikTok, Facebook, and YouTube. The `Toast.tsx` component provides non-intrusive notification popups that auto-dismiss after 4 seconds.
- **Responsive Layout:** The web dashboard uses a sidebar layout for desktop screens and a bottom navigation bar for mobile viewports. The `Sidebar.tsx` component includes a hamburger menu toggle for mobile, with an overlay backdrop that closes the sidebar when tapped. The sidebar hides completely on the login page to provide a clean authentication experience.

---

## Chapter 6: Implementation

### 6.1 Turning Design into Code
Implementation is where theoretical design hits the reality of compilers and package managers. I split the development cleanly between the web environment (Next.js/React with TypeScript) and the mobile environment (Flutter/Dart). The web project uses Next.js 16.2.10 with React 19.2.4, while the Flutter project targets Dart SDK 3.12.2.

### 6.2 The Web Implementation (Next.js)
I built the web dashboard using Next.js App Router and TypeScript. The App Router fundamentally changed how React handles data by introducing Server Components. By default, Next.js renders components on the server before sending them to the browser. This means the heavy JavaScript required to parse the Gemini API responses executes on my server, not on the user's slow laptop.

However, components that need browser APIs (like `useState`, `useEffect`, or `useRouter`) must be marked with the `'use client'` directive at the top of the file. Every component that interacts with user state, Firebase listeners, or browser events carries this directive. The root `layout.tsx` keeps the overall structure server-rendered, but wraps children in client-side providers: `AuthProvider`, `ToastProvider`, and `AuthGuard`.

#### 6.2.1 The Authentication Layer
The authentication system consists of three interconnected files. First, `lib/firebase.ts` initializes the Firebase app, exports the `auth` instance, the Firestore `db` instance, and the `googleProvider` with custom parameters (`prompt: 'select_account'`) to force the account chooser on every sign-in.

Second, `context/AuthContext.tsx` creates a React Context that wraps the entire application. The `AuthProvider` component listens to Firebase's `onAuthStateChanged` stream. When a user signs in, the provider calls `createUserProfile` to initialize the Firestore document (only on first sign-in, using a `getDoc` check to avoid overwriting existing data). The context exposes `user`, `loading`, `signInWithGoogle`, and `signOut` to all child components.

Third, `components/AuthGuard.tsx` wraps the main layout. It checks the `user` and `loading` states from the context. If the user is not authenticated and the current path is not `/login`, it redirects to the login page using `router.replace('/login')`. During the loading state, it shows a branded loading screen with the Social94 logo and a spinner.

#### 6.2.2 The Gemini API Routes
The core AI logic lives inside the `src/app/api/gemini/` directory, with four dedicated route files. The centralized `lib/gemini.ts` helper initializes the Google Generative AI SDK using the `GEMINI_API_KEY` stored in `.env.local`. It uses the `gemini-3.1-flash-lite` model for fast responses and exports two main functions:

1. `generateWithRetry(prompt, options)` - Sends a text-only prompt with automatic retry and exponential backoff. On each failed attempt, it logs a warning with the first 120 characters of the error message and waits before retrying.

2. `generateWithImage(prompt, imageBase64, mimeType, options)` - Handles multimodal requests by packaging the image as an `inlineData` Part alongside the text prompt. This function is used by the `analyze-content` route when users upload images for visual analysis.

The `analyze-content/route.ts` is the most complex API route. It handles two content types: `multipart/form-data` (when an image is uploaded) and `application/json` (text-only, backward-compatible). For image uploads, it reads the file from the FormData, converts the ArrayBuffer to base64, and passes it to `generateWithImage`. The prompt includes a strict JSON schema defining 13 fields. After receiving the response, the route extracts the JSON using a regex match (`text.match(/\{[\s\S]*\}/)`), parses it, and returns the structured analysis.

#### 6.2.3 The Web Scraper Routes
I implemented two scraper routes to cover four platforms. The `instagram-scrape/route.ts` focuses exclusively on Instagram, while `social-scrape/route.ts` handles Facebook, TikTok, and YouTube.

The Instagram scraper is the most detailed. It accepts multiple input formats: full URLs (`https://www.instagram.com/nasa/`), short URLs (`instagram.com/nasa`), @handles (`@nasa`), or bare usernames (`nasa`). The `parseUsername` function normalizes all of these into a clean username string. The route then fetches the public profile page using browser-like HTTP headers (a Chrome User-Agent string, standard Accept headers, and Sec-Fetch headers) to avoid immediate 403 blocks. An `AbortSignal.timeout(10_000)` prevents the request from hanging indefinitely.

The parsing logic is multi-layered. First, it extracts Open Graph meta tags (`og:description`, `og:title`, `og:image`) using regex pattern matching. The `og:description` typically contains a string like "42.5M Followers, 100 Following, 5,342 Posts," which the `parseOgDescription` function parses into numeric values. It handles abbreviations like "K" (thousands) and "M" (millions). Second, it tries to parse JSON-LD structured data (`<script type="application/ld+json">`) for supplemental information like the user's full name, bio, and profile picture. Third, it checks for the verified badge by searching for `"is_verified":true` in the HTML.

If the scraper cannot extract follower data (because Instagram rendered the page entirely through client-side JavaScript), it returns a friendly error message suggesting manual entry. It also handles specific HTTP status codes: 404 for non-existent profiles, 429 for rate-limited requests, and login redirects for when Instagram blocks the automated request.

The `social-scrape/route.ts` follows the same pattern but implements three separate scraping functions. The Facebook scraper uses a `facebookexternalhit` User-Agent (which Facebook treats more favorably), parses `og:description` for follower/like counts, and falls back to searching for `"follower_count"` in the page source. The TikTok scraper parses the `og:description` format ("X Followers, Y Following, Z Likes") and also searches for `"followerCount"` in TikTok's rehydration JSON blob. The YouTube scraper handles multiple URL formats (`/@handle`, `/channel/ID`, `/c/name`, `/user/name`) and parses `"subscriberCountText"` from the `ytInitialData` object embedded in the HTML.

#### 6.2.4 The Firestore Service Layer
The `lib/firestore.ts` file serves as the data access layer for the entire web application. It defines TypeScript interfaces for every data model (`Campaign`, `Reminder`, `PostAnalysis`, `PlatformStats`, `ReachDataPoint`, `UserStats`, `UserProfile`) and exports CRUD functions for each collection.

The key architectural decision was using Firestore's `onSnapshot` for real-time subscriptions rather than one-time `getDocs` reads. The `subscribeToCampaigns`, `subscribeToReminders`, and `subscribeToPostHistory` functions return an `Unsubscribe` callback that the React components store and call in their cleanup effects. This ensures that when a component unmounts, the Firestore listener is properly torn down to prevent memory leaks.

The `defaultStats` constant defines a sensible initial state for new users, including zero values for all metrics and an empty array for reach history. Platform stats default to Instagram, Facebook, TikTok, and YouTube, each with 0 followers and "0%" growth. This prevents null reference errors throughout the UI.

#### 6.2.5 The Dashboard Implementation
The main `page.tsx` (Dashboard) ties everything together. It reads the user from `AuthContext`, fetches stats with `getUserStats`, and subscribes to campaigns and reminders with real-time listeners. The dashboard calculates derived metrics like `activeCampaigns` (filtered by status) and `pendingReminders`, renders four stat cards with colour-coded icons, shows a Recent Activity feed combining campaigns and reminders, and displays a Platform Pulse card with progress bars scaled relative to the platform with the most followers.

The AI Insight button triggers a POST request to `api/gemini/audience-insight`, passing the current audience statistics. The response renders in a gradient banner at the top of the dashboard with a purple-to-cyan gradient background. The banner includes a dismiss button that clears the insight from state.

The dashboard also implements several smaller but important UX patterns. The time-based greeting calculates the current hour and displays "Good morning," "Good afternoon," or "Good evening" accordingly. The stat cards use colour-coded icons (purple for reach, emerald for engagement, amber for campaigns, cyan for reminders) to create visual distinction. Each card shows a trend indicator with the relevant secondary metric. The Quick Actions grid at the bottom provides one-click navigation to the four primary features, with hover effects that include a subtle upward translation and shadow increase.

### 6.2.6 The Data Flow Architecture
Understanding the complete data flow helps clarify how the pieces fit together. Here is a typical flow for the AI content analysis feature:

1. The user types post content and selects target platforms on the Content Quality page.
2. The React component calls `fetch('/api/gemini/analyze-content', { method: 'POST', body: JSON.stringify({ content, platforms }) })`.
3. The Next.js API route receives the request in `route.ts`, validates the input, constructs the AI prompt with the JSON schema, and calls `generateWithRetry(prompt)`.
4. The `generateWithRetry` function in `lib/gemini.ts` calls `model.generateContent(prompt)` using the Google Generative AI SDK. If the call fails, it retries with exponential backoff.
5. The Gemini API returns a text response containing JSON. The route extracts the JSON using regex, parses it with `JSON.parse`, and returns `{ success: true, analysis }` to the frontend.
6. The React component receives the response, updates local state, and renders the analysis in the QualityRing and detail panels.
7. Optionally, the user can save the analysis to Firestore by calling `savePostAnalysis(uid, analysis)`, which writes to the `users/{uid}/posts` sub-collection.
8. The saved analysis appears in the post history, accessible on both the web dashboard and the Flutter mobile app through Firestore's real-time listeners.

This flow demonstrates the clear separation of concerns: the frontend handles user interaction and display, the API routes handle business logic and external API communication, and Firestore handles persistence and cross-platform synchronization.

### 6.3 The Mobile Implementation (Flutter)
While Next.js handles the heavy data processing and API bridging, the Flutter app serves as the lightweight companion. I wrote it entirely in Dart.

#### 6.3.1 Application Entry Point and State Management
The `main.dart` file follows a clean initialization pattern: `WidgetsFlutterBinding.ensureInitialized()` followed by `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)`. The `AuthWrapper` widget listens to the authentication state stream. When a user is authenticated, it wraps the entire navigation tree in a `MultiProvider` that injects three stream providers:
- `StreamProvider<UserStats?>` connected to `firestore.streamUserStats(user.uid)`
- `StreamProvider<List<Campaign>>` connected to `firestore.streamCampaigns(user.uid)`
- `StreamProvider<List<Reminder>>` connected to `firestore.streamReminders(user.uid)`

This means any widget in the tree can access live data using `Provider.of<UserStats?>(context)` or `context.watch<List<Campaign>>()` without manually managing stream subscriptions. The data updates push automatically from Firestore through the stream, through the provider, and into the widget tree.

#### 6.3.2 Data Models in Dart
I created three Dart model classes mirroring the Firestore schema. The `UserStats` class in `models/user_stats.dart` includes a `fromMap` factory constructor that safely handles null values with fallback defaults (`map['totalReach'] ?? 0`). It also includes nested model parsing for `PlatformStats` and `ReachDataPoint`. The `Campaign` class uses a `fromFirestore(DocumentSnapshot doc)` factory that extracts the document ID and maps all fields. The `Reminder` class follows the same pattern.

A practical detail: the `UserStats` class stores the engagement rate as a `num` type (`engagementRateNum`) rather than a `double` because Firestore sometimes returns integers for whole-number values. The class provides a getter `formattedEngagementRate` that converts this to a display-ready string like "3.5%".

#### 6.3.3 Cross-Platform Configuration
The most frustrating implementation hurdle had nothing to do with writing code. It involved configuring the environment. Getting the Flutter app to compile for iOS required navigating Xcode, CocoaPods, and the `GoogleService-Info.plist` files. Android required modifying Gradle build scripts. I utilized the FlutterFire CLI, which automatically generated the `firebase_options.dart` file. This file contains platform-specific Firebase configuration that the `DefaultFirebaseOptions.currentPlatform` getter selects at runtime based on the compilation target. Without this automated generation, maintaining three separate configurations would have been impossible for a solo developer.

### 6.4 Overcoming Technical Debt
I faced a massive issue midway through implementation regarding the Gemini AI routes. The Next.js frontend was timing out before Gemini could finish generating the long marketing copy. The default serverless function timeout on hosting platforms is typically 10 seconds. Gemini often took 12 to 15 seconds to return complex campaign strategies, especially for the `analyze-content` route with image processing.

I solved this with two strategies. First, I implemented the retry mechanism with exponential backoff in `lib/gemini.ts`, which handles transient failures gracefully. Second, I switched to the `gemini-3.1-flash-lite` model instead of the heavier `gemini-pro` model. The flash-lite variant returns responses significantly faster while maintaining acceptable quality for marketing content. This trade-off between response quality and response speed was a deliberate engineering decision. For the use case of generating social media copy and basic analytics insights, the flash-lite model's speed advantage outweighed the marginal quality difference.

Another significant technical debt issue involved the Firebase initialization on the web. During Next.js development, hot module reloading caused the Firebase app to reinitialize on every code change, crashing the application. The fix was a simple but critical guard in `lib/firebase.ts`: checking `getApps().length === 0` before calling `initializeApp`. This pattern is now standard in Next.js-Firebase projects, but discovering it required debugging several cryptic runtime errors.


## Chapter 7: Evaluation of Product

### 7.1 Testing the System
Code that compiles is not code that works. Evaluation proves whether the software actually solves the problem defined in Chapter 1. I tested Social94 in three stages: Unit Testing for individual logic, Integration Testing for cross-platform data flow, and User Acceptance Testing (UAT) to see if independent creators actually found it useful.

### 7.2 Technical Testing Results

#### 7.2.1 The Gemini API Edge Cases
I spent significant time testing the `api/gemini/analyze-content/route.ts` endpoint. LLMs are prone to hallucinations-they invent facts if the prompt is too loose. I ran fifty test cases feeding the API erratic data. For instance, I submitted a campaign where the follower count dropped by 500, but engagement increased by 200%.

Early tests failed. The AI hallucinated a response suggesting the user should "buy more followers." I had to rewrite the system prompt in the backend code, explicitly forbidding the AI from suggesting black-hat marketing tactics. After tightening the prompt engineering and demanding JSON output matching the `ANALYSIS_SCHEMA`, the API passed the remaining tests, returning mathematically sound advice consistently.

I also tested the multimodal analysis by uploading various image types (JPEG, PNG, WebP) with and without accompanying text. The `generateWithImage` function handled all MIME types correctly. However, images larger than 4MB occasionally caused timeout errors on the first attempt. The retry mechanism successfully recovered in all but two of the thirty multimodal test cases.

#### 7.2.2 The Scraper Brittle Test
Testing the `api/instagram-scrape/route.ts` proved why developers prefer official APIs. During integration testing, the scraper worked perfectly for three days. On the fourth day, Instagram pushed an invisible update to their web client, changing some meta tag formats. The scraper's `parseOgDescription` function temporarily returned zeros for some profiles.

I implemented a multi-layered fallback mechanism. The scraper first tries the `og:description` meta tag. If that returns zero followers, it tries JSON-LD structured data. If both fail, it returns a friendly error to the UI through the `Toast.tsx` component, prompting the user: "Automated sync failed. Please enter data manually." This test highlighted the fragility of web scraping but confirmed the robustness of the error-handling logic.

The TikTok and YouTube scrapers proved more stable than Instagram. TikTok's `og:description` format has remained consistent, and YouTube's `ytInitialData` JSON blob is deeply embedded in the page source, making it less susceptible to front-end CSS changes. The Facebook scraper had intermittent issues when Facebook detected the automated request and served a login page instead of the profile, but the route correctly detects this by checking for login-related HTML patterns and returns an appropriate error message.

#### 7.2.3 The Retry Mechanism Test
I specifically tested the `generateWithRetry` function by simulating Gemini API failures. Using a mock that failed on the first two attempts and succeeded on the third, I verified that:
- The first retry happened after approximately 2 seconds
- The second retry happened after approximately 4 seconds
- The total elapsed time was within expected bounds
- The function correctly threw an error after all retries were exhausted

The exponential backoff formula (`Math.min(2000 * Math.pow(2, attempt), 15000)`) was validated to produce delays of 2s, 4s, 8s for three retries, with a maximum cap of 15 seconds preventing excessive wait times.

#### 7.2.4 Cross-Platform Synchronization Test
I tested the real-time sync between the web and mobile applications extensively. The test procedure was straightforward but critical:

1. Open the Social94 web dashboard on a laptop browser.
2. Open the Social94 Flutter app on an iPhone simultaneously.
3. Create a new campaign on the web dashboard.
4. Time how long until the campaign appears on the Flutter app.

Across twenty tests, the average sync time was 1.4 seconds. The fastest sync was 0.8 seconds and the slowest was 2.6 seconds. The slow outlier occurred on a congested Wi-Fi network. These results confirmed that the Firestore real-time listener architecture meets the NFR2 performance requirement of sub-2-second sync times under normal conditions.

I also tested the reverse direction: creating a reminder on the Flutter app and verifying it appeared on the web dashboard. The results were consistent, confirming that the `onSnapshot` listeners on the web side and the `StreamBuilder` widgets on the mobile side are both functioning correctly.

#### 7.2.5 Authentication Flow Test
The authentication system was tested for security and usability:
- **Happy path:** Google Sign-In on web completed in under 3 seconds. The user profile was created in Firestore on first sign-in and correctly detected (not overwritten) on subsequent sign-ins.
- **Route protection:** Manually navigating to `/campaigns` while logged out correctly redirected to `/login`. The AuthGuard rendered the branded loading screen during the authentication check, preventing a flash of unauthorized content.
- **Session persistence:** Closing the browser and reopening it maintained the user's session (Firebase Auth persists tokens in localStorage). The Flutter app similarly maintained sessions between cold starts.
- **Sign-out:** Clicking the sign-out button on the web sidebar or the Flutter settings screen correctly cleared the auth state and redirected to the login page. Protected routes immediately became inaccessible.

### 7.3 User Acceptance Testing (UAT)
I handed the completed platform to a group of five users-three independent artists and two marketing students. I asked them to manage their social media for one week using Social94 instead of their usual spreadsheets.

**The Feedback:**
1. **The AI Content Analysis:** Users loved the `analyze-content` feature. The `QualityRing` component gave them an immediate, visual understanding of their post quality. One user said the hashtag suggestions alone saved them twenty minutes per post. The image analysis feature impressed users the most-uploading a product photo and getting visual feedback on its marketing appeal was something none of them had seen in free tools before.
2. **The AI Copy Generation:** The `generate-copy` feature saved users roughly an hour of staring at a blank screen. However, they pointed out that the AI occasionally used overly enthusiastic language. I used this feedback to refine the Gemini prompt, instructing it to use a more natural, direct tone. One user specifically asked for the copy variants to include character counts, which was already implemented in the JSON schema.
3. **The Mobile Experience:** The Flutter app received the highest praise. Users liked the Reminders screen. Because the app connects to the same Firestore database, they could plan a campaign on their laptop on Sunday and get reminders on their iPhone on Tuesday. The real-time sync between web and mobile was "like magic," according to one tester.
4. **The Scraper:** When the scraper worked, users preferred it over manual entry. But when Instagram blocked the request, users found it frustrating. They universally requested full OAuth integration in future updates, confirming my initial assumption that scraping is a temporary patch, not a permanent solution. The Facebook and YouTube scrapers received better feedback because they failed less frequently.
5. **The Dashboard:** Users appreciated the clean layout and stat cards. The time-based greeting ("Good morning," "Good afternoon," "Good evening") was a small touch that multiple users mentioned positively. The quick action grid at the bottom of the dashboard made navigation intuitive for first-time users.

---

## Chapter 8: Critical Evaluation of Project

### 8.1 The Reality of Development
Building Social94 taught me more about software engineering than any textbook. The project succeeded in delivering a cross-platform, AI-integrated marketing dashboard. But it also exposed flaws in my time management and architectural planning.

### 8.2 The Successes
1. **The Dual-Client Architecture:** Choosing Next.js and Flutter was highly ambitious. Maintaining two distinct codebases (TypeScript and Dart) simultaneously is difficult. But the risk paid off. The web dashboard handles complex data visualization effortlessly using Recharts and custom SVG components, and the mobile app feels fast and native. Linking both to Firestore via `StreamBuilder` in Flutter and `onSnapshot` subscriptions in React created a seamless real-time experience that rivals commercial software. The `MultiProvider` pattern in Flutter was particularly elegant-it injects three live data streams into the widget tree with minimal boilerplate.

2. **AI as a Feature, Not a Gimmick:** Many developers slap an AI chatbot onto an app and call it innovative. By integrating Gemini directly into four dedicated API routes (`analyze-content`, `audience-insight`, `generate-copy`, `generate-reminder`), the AI acts as an invisible engine. The user does not chat with an AI; they simply press "Analyze" and receive structured marketing data. The multimodal support (analyzing images alongside text) adds a dimension that most free tools completely lack. The strict JSON schema enforcement in prompts ensures reliable, parseable responses rather than unpredictable free-text outputs.

3. **Multi-Platform Scraping:** Building scrapers for four different platforms (Instagram, Facebook, TikTok, YouTube) was a stretch goal that I completed. Each scraper handles multiple input formats, parses data from different HTML structures, and degrades gracefully when blocked. The `parseCount` helper function that handles "42.5M", "1,200", and "999K" formats proved reusable across all four scrapers.

4. **The Design System Consistency:** Maintaining visual consistency between a React web app and a Flutter mobile app is not trivial. By defining the colour palette, typography, and component patterns in both `globals.css` (web) and `theme.dart` (mobile), I ensured that a user switching between their laptop and phone would recognize the same brand identity. The purple-to-cyan gradient, the Outfit heading font, and the card-based layout are consistent across both platforms.

### 8.3 The Failures and Challenges
1. **The Cost of Scraping:** Relying on web scraping for the Instagram route cost me nearly a week of development time. Writing the initial script was easy; keeping it working against Instagram's anti-bot measures was a nightmare. I spent too much time trying to parse edge cases (profiles with special characters, private accounts, accounts with very large follower counts using abbreviations) instead of building features. In hindsight, I should have accepted the manual-entry limitation earlier or invested time in the Graph API approval process from the start.

2. **State Management Complexity:** I underestimated how difficult it is to manage user state across protected routes in Next.js. Before I implemented the `AuthGuard.tsx` component, users could force-navigate to a campaign page after logging out, causing the app to crash when it tried to read from a null user token. The `AuthContext` pattern ultimately solved this cleanly, but getting to that solution involved several failed attempts with different state management approaches.

3. **The LLM Response Parsing Problem:** Even with strict JSON schema instructions, Gemini occasionally returned malformed JSON wrapped in markdown code blocks (using triple backticks). The regex extraction (`text.match(/\{[\s\S]*\}/)`) handles this case, but early versions of the code did not account for it. Several hours were spent debugging "Invalid response format from AI" errors that only occurred intermittently. The lesson: never trust an LLM to follow formatting instructions perfectly every time. Always build robust parsing with fallbacks.

4. **Mobile Build Complexity:** The iOS build process was particularly painful. CocoaPods dependency resolution for Firebase packages sometimes took ten minutes per build. Android Gradle builds had their own issues with SDK version conflicts. These platform-specific build problems consumed time that could have been spent on features.

### 8.4 Personal Growth
This project forced me to become a full-stack engineer. I learned how to read undocumented API errors from Firebase and Google's Generative AI SDK. I learned how to manage asynchronous data streams across two completely different programming languages (TypeScript async/await and Dart Futures/Streams). I learned how to design a UI that doesn't overwhelm the user, using colour hierarchy, whitespace, and progressive disclosure to guide attention.

More importantly, I learned project discipline-knowing when to abandon a broken feature (like aggressive IP-rotating scraping) to protect the stability of the core application. The Agile methodology proved its worth here: when a sprint goal became unachievable, I adjusted the next sprint's scope instead of forcing a broken feature to production.

The prompt engineering experience was particularly valuable. Understanding how to structure instructions for an LLM, how to enforce output formats, how to prevent hallucinations through context injection, and how to handle the inherent unreliability of AI responses are skills that will be directly applicable in any future software project involving AI integration.

### 8.5 Comparison Against Initial Requirements
Looking back at the requirements defined in Chapter 4, I can evaluate how well Social94 met each one:

- **FR1 (Authentication):** Fully implemented. Google Sign-In works on both web and mobile with automatic profile creation.
- **FR2 (Data Synchronization):** Fully implemented. Real-time sync works within 1-2 seconds as verified in testing.
- **FR3 (Data Aggregation):** Fully implemented. Manual entry and web scraping for four platforms are both functional.
- **FR4 (AI Content Analysis):** Fully implemented. Includes multimodal image analysis, which exceeded the original scope.
- **FR5 (AI Copy Generation):** Fully implemented. Three variants with platform-specific formatting.
- **FR6 (AI Audience Insight):** Fully implemented. Returns actionable, concise insights.
- **FR7 (Campaign Management):** Fully implemented. Full CRUD operations with real-time updates.
- **FR8 (Reminders):** Fully implemented. Includes AI-generated reminder messages.
- **NFR1 (Security):** Met. Firebase Auth handles password security. Environment variables protect API keys. Route guards protect all authenticated pages.
- **NFR2 (Performance):** Partially met. Most API routes respond within 8 seconds. The `analyze-content` route with large images occasionally exceeds 15 seconds on the first attempt but succeeds on retry.
- **NFR3 (Cross-Platform Consistency):** Met. The design system ensures consistent branding across web and mobile.
- **NFR4 (Error Handling):** Met. All API routes return structured error responses with user-friendly messages.

Out of twelve requirements, eleven were fully met and one was partially met. The partial miss on NFR2 is acceptable given the inherent latency of LLM APIs, and the retry mechanism ensures eventual success.

### 8.6 Ethical Considerations
Web scraping raises ethical questions that deserve acknowledgment. While scraping publicly available data is generally legal, it can violate platform terms of service. Instagram's, Facebook's, TikTok's, and YouTube's terms all restrict automated data collection. Social94's scrapers only access publicly visible profile pages and do not log into accounts, access private data, or download user content. The scraped data is limited to aggregate statistics (follower counts, post counts) that the platforms themselves display publicly.

The AI integration also carries ethical responsibility. LLMs can generate misleading or manipulative marketing content if not properly constrained. Social94's prompts explicitly instruct the AI to avoid black-hat marketing tactics, deceptive claims, and aggressive sales language. The generated copy is presented as suggestions, not automated actions. The user always has the final say on what gets published.

---

## Chapter 9: Conclusion

### 9.1 Final Summary
I set out to build an automated social media marketing platform that solved the data fragmentation problem for small creators. Social94 achieves this.

By leveraging a decoupled architecture, I built a Next.js 16 web application for deep analysis and a Flutter mobile application for on-the-go management. Both platforms connect to a shared Firebase backend using real-time Firestore listeners, creating a unified experience where data entered on one device appears on the other within seconds.

Instead of relying purely on static charts, I integrated Google's Gemini LLM directly into four backend API routes. The `analyze-content` route provides detailed post quality analysis with multimodal image support. The `generate-copy` route creates platform-specific marketing content with hashtags and calls-to-action. The `audience-insight` route translates raw statistics into actionable growth advice. And the `generate-reminder` route crafts engaging task reminders. This integration transforms Social94 from a simple tracking tool into an active marketing assistant.

The web scraping system, while fragile, successfully pulls public profile data from Instagram, Facebook, TikTok, and YouTube without requiring corporate API approval. The multi-layered parsing approach (Open Graph meta tags, JSON-LD structured data, embedded JavaScript objects) provides redundancy against platform changes. When scraping fails, the graceful fallback to manual entry ensures the platform remains usable.

User testing proved that the core premise works: independent creators want a clean, fast, AI-assisted dashboard without the enterprise price tag. The real-time synchronization, the focused AI features, and the clean design system received positive feedback across all testers.

### 9.2 Technical Contributions
This project makes several technical contributions worth noting:
- **A reusable Gemini integration pattern** with retry logic, exponential backoff, and structured JSON output enforcement that can be applied to any Next.js project requiring LLM integration.
- **A multi-platform scraping architecture** that normalizes data from four different social media platforms into a consistent format, with comprehensive error handling and graceful degradation.
- **A cross-platform real-time synchronization pattern** using Firebase, Next.js Context, and Flutter StreamProviders that keeps two entirely different client applications in sync.
- **A design system specification** that maintains brand consistency across React (CSS) and Flutter (ThemeData) implementations.

### 9.3 Future Roadmap
Software requires iteration. Based on the technical evaluation and user feedback, the roadmap for Social94 is clear:

1. **Official OAuth Integration:** The web scrapers must be replaced with stable, official API connections. The immediate next step is navigating the developer approval processes for the Facebook Graph API and the TikTok API to allow stable, automated data ingestion. This eliminates the brittleness that web scraping introduces.

2. **Automated Publishing:** Once the official APIs are connected, the system can move beyond just generating copy. I plan to build a scheduling queue, allowing Social94 to automatically publish the AI-generated posts to the user's connected platforms at optimal times suggested by the AI.

3. **Advanced Analytics Export:** Users requested the ability to export their AI-generated insights into clean PDF reports to share with sponsors and collaborators. I plan to implement a server-side PDF generation route in Next.js to handle this request.

4. **Dark Mode:** The current design system only implements a light theme. A dark mode option would reduce eye strain for users who manage their social media in the evening and align with modern UI expectations.

5. **Push Notifications:** The Flutter app currently shows reminders only when the user opens the app. Implementing Firebase Cloud Messaging (FCM) would allow the system to send actual push notifications, making the reminder feature genuinely useful for time-sensitive tasks.

6. **Historical Trend Analysis:** The `reachOverTime` data structure already supports monthly data points per platform. Building dedicated chart views (using the existing Recharts and fl_chart libraries) with trend lines, growth projections, and comparative analysis would give users deeper insights into their long-term performance.

Social94 proves that with modern frameworks like Next.js, Flutter, and serverless AI integration, a solo developer can build tools that rival established enterprise software. The key is focus: knowing what to build, what to skip, and when to stop adding features and start polishing what you have.


