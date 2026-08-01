# Social94: Final Project Report

## Chapter 1: Introduction

### 1.1 Project Background
Social media is no longer just a place to post photos. It functions as the primary marketing engine for businesses and independent creators alike. Platforms like Instagram, Facebook, and TikTok dictate how audiences discover products. But managing multiple platforms creates a logistical problem. Creators find themselves constantly switching between applications to track their follower growth, monitor post performance, and analyze audience reach. This fragmentation wastes time and causes data to slip through the cracks.

Marketing today requires data. You cannot just post content and hope for the best. You have to monitor reach, track engagement rates, and adjust your strategy based on what the algorithm rewards. Large corporations solve this by hiring dedicated social media managers and purchasing enterprise software. Small businesses, students, and independent creators do not have that luxury. The software available to them is either prohibitively expensive or too complicated for casual use. They need a tool that handles the heavy lifting without the enterprise price tag.

Social94 addresses this directly. It is an automated social media marketing platform built to track, manage, and analyze audience reach from a single dashboard. I built it using a decoupled architecture: a Next.js web application for deep desktop analysis and a Flutter mobile application for checking statistics on the go. More importantly, Social94 does not just display numbers. It integrates Google's Gemini AI to analyze content, generate marketing copy, and provide actionable audience insights. It also employs targeted web scraping to pull data from platforms like Instagram, bypassing the traditional bottlenecks of fragmented APIs.

### 1.2 Problem Statement
Despite the sheer volume of social media tools on the market, the average creator still struggles. The core problems fall into four distinct categories:

1. **Fragmented Data Ecosystems:** Instagram, TikTok, and Facebook do not talk to each other. They actively prevent cross-platform data sharing to keep users inside their own walled gardens. A creator must log into three different developer portals or apps just to pull a weekly report.
2. **Enterprise Pricing Models:** Tools like Hootsuite and Sprout Social built their products for large teams. They removed their free tiers years ago. A single creator pulling basic analytics cannot justify spending hundreds of dollars a month.
3. **Overwhelming Interfaces:** When small creators do pay for these tools, they face dashboards flooded with irrelevant metrics. They don't need team collaboration features or complex CRM funnels. They need to know if their audience grew this week and what content caused that growth.
4. **The AI Gap:** Artificial intelligence can draft posts and analyze trends in seconds. But most affordable tools have not integrated LLMs (Large Language Models) natively into their dashboards. Creators have to copy their statistics, paste them into ChatGPT or Gemini, ask for insights, and then copy the advice back to their planning document.

### 1.3 Aims and Objectives

#### 1.3.1 Aim
The primary aim of this project is to engineer and evaluate a cross-platform social media marketing system. This system must centralize audience metrics, automate content analysis using artificial intelligence, and provide an interface that non-technical creators can actually use.

#### 1.3.2 Objectives
To achieve this aim, I set the following technical and research objectives:
- Evaluate existing social media management tools to document their pricing structures, technical limitations, and feature gaps.
- Gather functional requirements from independent creators to determine exactly what metrics matter to them.
- Design a scalable system architecture utilizing Next.js for the web client, Flutter for the mobile client, and Firebase for backend synchronization.
- Implement specialized API routes to handle web scraping for platforms that restrict data access (specifically targeting Instagram).
- Integrate the Gemini AI API to provide automated content analysis, copy generation, and audience insights directly within the user dashboard.
- Develop manual and automated data entry mechanisms backed by a NoSQL Firestore database.
- Execute component, integration, and user acceptance testing to ensure data accuracy and system stability across web, iOS, and Android platforms.
- Evaluate the final product against the initial requirements and document the technical challenges overcome during development.

### 1.4 Scope of the Project
Social94 encompasses a web dashboard and a mobile application. The web dashboard, built on Next.js, serves as the primary control center. It provides large-scale data visualization, campaign management, and direct interaction with the AI generation tools. The Flutter mobile app serves as a companion, allowing users to check real-time statistics and receive reminders on their phones.

The project currently focuses on audience reach tracking, AI-assisted content analysis, and campaign organization. I built an Instagram scraper route to automatically pull specific profile data, supplementing the manual entry features. The system handles secure user authentication, profile management, and real-time database synchronization via Firebase.

The scope strictly excludes automated posting. The system advises the user on what to post and when, but it does not execute the final publish action. Direct posting requires full OAuth integration with the Graph API and TikTok API, which involves lengthy corporate approval processes that fall outside the timeline of a university project. 

### 1.5 Document Structure
I structured this report to follow the natural progression of the software development lifecycle:
- **Chapter 1: Introduction** defines the problem and the scope.
- **Chapter 2: Literature Review** examines the theoretical foundation of social media algorithms, web scraping, and AI integration, alongside an analysis of competitor software.
- **Chapter 3: Methodology** details the Agile framework used to manage the project.
- **Chapter 4: Investigation and Analysis** breaks down the functional and non-functional requirements gathered from users.
- **Chapter 5: Design** outlines the system architecture, database schema, and UI design system.
- **Chapter 6: Implementation** explains the actual code. It covers the Next.js routes, the Flutter widget tree, the web scraping logic, and the Gemini AI integration.
- **Chapter 7: Evaluation of Product** reviews the testing results and user feedback.
- **Chapter 8: Critical Evaluation** reflects on the technical failures, the successes, and the lessons learned.
- **Chapter 9: Conclusion** summarizes the project and outlines future technical updates.

---

## Chapter 2: Literature Review

### 2.1 The Context of Social Media Software
Before writing the first line of code for Social94, I needed to understand the technical and commercial landscape of social media marketing. This literature review does not just look at competitor apps. It breaks down the underlying technologies that make these apps work-specifically the shift from basic analytics to AI-driven insights, the technical hurdles of data aggregation, and the friction between open web scraping and locked APIs. By analyzing these areas, the technical decisions behind Social94 become clear.

### 2.2 The Technical Evolution of Audience Tracking
In 2010, tracking a social media audience meant looking at a follower count. It was a static, superficial number. Today, algorithms power the platforms. They do not care how many followers you have; they care about engagement velocity, view duration, and watch-time completion rates. 

When platforms introduced the "algorithmic feed" (first Facebook, then Instagram, and most aggressively TikTok), reach decoupled from follower count. A creator with 1,000 followers can reach 1,000,000 people if the algorithm decides the content is highly engaging. Because of this, metrics shifted. "Audience Reach"-the number of unique accounts that see a post-became the primary indicator of digital health.

However, extracting this data programmatically is difficult. Ten years ago, platforms offered open APIs. A developer could easily pull a user's feed, statistics, and follower lists. But following major data scandals (like Cambridge Analytica), platforms locked down their data. They introduced strict OAuth requirements, rate limits, and aggressive review processes. Today, if a developer wants to pull basic reach statistics from Instagram, they must navigate the Facebook Graph API, register a corporate business entity, submit screencasts of their application, and wait weeks for approval. This API fragmentation forced developers to find alternative ways to gather data, leading to the rise of specialized web scraping.

### 2.3 Web Scraping vs. Official APIs
Data aggregation software relies on two methods to get information: Official APIs and Web Scraping. Understanding the difference is crucial because it dictated how Social94 was built.

#### 2.3.1 Official APIs
An API (Application Programming Interface) is a sanctioned backdoor into a platform's database. When a user logs into a tool like Hootsuite, they authenticate via OAuth. The platform hands Hootsuite a token, and Hootsuite uses that token to ask the platform's database for the user's statistics.
- **Pros:** It is stable. If the platform updates its website design, the API usually remains unchanged. The data is structured in clean JSON formats.
- **Cons:** It is heavily restricted. Platforms frequently revoke tokens, change rate limits, or completely deprecate endpoints without warning (as Twitter did in 2023). Getting access requires jumping through corporate hoops.

#### 2.3.2 Web Scraping
Web scraping bypasses the API entirely. A script acts like a human using a web browser. It navigates to a URL (e.g., an Instagram profile), reads the raw HTML of the page, searches for specific CSS classes that contain the follower count or post data, and extracts the text.
- **Pros:** It does not require corporate approval. If the data is visible on a public webpage, a scraper can read it. This allows independent developers to build tools quickly without waiting on Meta or Google.
- **Cons:** It is highly brittle. If Instagram changes a single CSS class name from `.follower-count` to `.f-count-v2`, the scraper breaks and the code must be updated. Platforms also deploy anti-bot measures, forcing scrapers to rotate IP addresses or mimic human scrolling behavior to avoid getting blocked.

Social94 uses a hybrid approach. It relies on manual entry for secure, long-term tracking of private metrics (like exact reach), but it implements a custom scraping route (`api/instagram-scrape/route.ts`) to handle public data aggregation without the overhead of the Graph API.

### 2.4 The Integration of AI in Marketing Software
The most significant shift in marketing software over the last two years is the integration of Large Language Models (LLMs). Early marketing tools used basic automation-if you typed a post, it posted it on Tuesday. AI changed the paradigm from automation to generation.

Models like OpenAI's GPT-4 and Google's Gemini can analyze large datasets and return plain-English insights. In the context of social media, this means a user no longer has to look at a line graph and guess why it went down. An LLM can ingest the statistics of the last ten posts, analyze the text of the captions, and tell the user exactly what changed. 

The literature shows that users struggle most with "blank page syndrome." They know they need to post, but they don't know what to write. AI solves this. By feeding an LLM the user's past successful posts and current marketing goals, the AI can generate highly targeted copy. However, many competitor tools bolt AI onto their platforms as an afterthought. They add a generic chatbot interface. Social94 was designed to embed the AI natively. The Gemini API drives specific, focused features: analyzing content, suggesting campaign ideas, and generating specific post copy based on the user's historical data.

### 2.5 Analysis of Existing Market Solutions
To position Social94 correctly, I analyzed three major incumbents in the social media management space.

#### 2.5.1 Hootsuite
Hootsuite is the industry standard for enterprise social media management.
- **Architecture:** A massive, monolithic web application that handles scheduling, analytics, customer support ticketing, and team management.
- **Strengths:** Unmatched API integrations. If a platform exists, Hootsuite connects to it. Their analytics are granular and built for data scientists.
- **Weaknesses:** Feature bloat. A solo creator logs in and is overwhelmed by tools they will never use. Their pricing reflects their enterprise focus, making it entirely inaccessible to the demographic Social94 targets.

#### 2.5.2 Buffer
Buffer started as a simple scheduling tool and evolved into a broader platform.
- **Architecture:** A cleaner, more modular application compared to Hootsuite. They focus heavily on the publishing queue.
- **Strengths:** Excellent UI/UX. The interface is intuitive, and they offer a generous free tier for basic scheduling.
- **Weaknesses:** Their analytics are paywalled. A free user cannot see historical growth data. Furthermore, their AI integration is currently limited to basic text expansion, rather than deep audience analysis.

#### 2.5.3 Later
Later carved out a niche by focusing entirely on visual planning for Instagram.
- **Architecture:** Heavily reliant on drag-and-drop interfaces and visual media libraries.
- **Strengths:** The best visual calendar in the market. Users can see exactly what their Instagram grid will look like before posting.
- **Weaknesses:** It is practically useless for text-heavy platforms like Twitter or LinkedIn. It forces users into a highly visual workflow that doesn't fit every marketing strategy. Like the others, deep analytics cost a premium.

### 2.6 The Justification for Social94
The market analysis reveals a distinct gap. The tools that have the data are too expensive and complex. The tools that are affordable hide their analytics behind paywalls. And almost none of them have integrated LLMs deeply enough to actually replace a marketing manager.

Social94 exists to fill this gap. It drops the complex enterprise features (like team ticketing and approval workflows) to focus entirely on the solo creator. 
- **The Architecture:** By separating the Next.js frontend and the Flutter mobile app, the system ensures performance isn't bogged down by a monolithic codebase.
- **The Data:** Using localized web scraping alongside manual entry gives users immediate access to their data without waiting on API approvals.
- **The AI:** Natively integrating Google's Gemini models directly into the Next.js API routes means the user gets automated content analysis and copy generation without ever leaving the dashboard.

This combination of a decoupled modern stack, intelligent scraping, and native AI positions Social94 as a lightweight but highly capable alternative to legacy marketing tools.


## Chapter 3: Methodology

### 3.1 Choosing the Development Framework
Building a software system requires a structured approach. I evaluated traditional frameworks like Waterfall and Prototyping, but they failed to meet the specific demands of this project. Waterfall demands strict, unchangeable requirements before a single line of code is written. But when you integrate external APIs like Google's Gemini or build web scrapers that rely on the shifting DOM structure of Instagram, requirements change daily. You cannot plan a rigid three-month roadmap when an API endpoint might deprecate next week.

I chose the Agile Software Development Methodology. Agile breaks the project down into short, time-boxed iterations called "sprints." It prioritizes working software over comprehensive documentation and allows for rapid pivoting. If a specific Next.js feature (like Server Components) conflicts with a Firebase client library mid-sprint, Agile dictates that you adjust the architecture immediately rather than sticking to a flawed initial design document. 

### 3.2 The Agile Lifecycle in Practice
Working as a solo developer meant I had to adapt standard Agile ceremonies. I did not hold daily stand-ups with a team. Instead, I maintained a strict digital Kanban board. Every feature, bug, and API integration became a "ticket." I divided the development of Social94 into four distinct sprints, each lasting approximately two weeks.

#### 3.2.1 Sprint 1: Foundation and Dual Architecture
The goal of the first sprint was establishing the infrastructure. Because I decided to build both a web application and a mobile application simultaneously, this sprint required heavy configuration. 
I initialized the Next.js project using the App Router, setting up TypeScript to catch type errors early. Simultaneously, I created the Flutter project for iOS and Android. The primary technical hurdle was linking both of these entirely different codebases to a single Firebase backend. I used the FlutterFire CLI to generate the `firebase_options.dart` file, configuring the App IDs and Project IDs so that an account created on the web would immediately exist on the mobile app. By the end of Sprint 1, I had two blank applications successfully reading and writing to the same Firestore database.

#### 3.2.2 Sprint 2: Core Data and The Dashboard
Sprint 2 focused on giving the user a place to put their data. I built the `users` collection in Firestore and established the `audience_stats` schema. 
On the web client, I built the sidebar navigation (`Sidebar.tsx`) and the main dashboard view. I implemented an `AuthGuard.tsx` component to wrap the protected routes, ensuring unauthenticated users bounced back to the login screen. On the Flutter side, I built the `dashboard_screen.dart` and implemented a `StreamBuilder`. This was a critical Agile victory: the `StreamBuilder` listened to Firestore in real-time. If I manually entered a new follower count on the Next.js web app, the Flutter mobile app updated instantly without a refresh. 

#### 3.2.3 Sprint 3: The AI Integration
This sprint defined the project. I integrated Google's Gemini API into the Next.js backend. I created specific API routes:
- `api/gemini/analyze-content/route.ts`
- `api/gemini/audience-insight/route.ts`
- `api/gemini/generate-copy/route.ts`

Working with LLMs in an Agile environment requires constant iteration. You cannot just send a generic prompt to Gemini and expect good marketing advice. I spent days adjusting the prompt engineering within the API routes, ensuring the AI received the user's historical data (fetched from Firestore) as context before generating a response. 

#### 3.2.4 Sprint 4: Scraping and Polish
The final sprint addressed the data entry bottleneck. Manual entry works, but it causes friction. I built `api/instagram-scrape/route.ts` to programmatically pull public profile data. This sprint also covered the implementation of the `Campaigns` and `Reminders` features on both web and mobile, tying the AI-generated advice into actionable tasks. I finalized the "Social94 Design System", ensuring the light theme and "Outfit" typography remained consistent across every screen.

### 3.3 Project Management Tools
To execute these sprints, I relied heavily on Git for version control. When building experimental features-like the web scraper-I branched off the main codebase. If the scraper caused memory leaks or failed to parse the HTML correctly, I could abandon the branch without breaking the stable dashboard code. The Kanban board tracked progress, ensuring I did not start a new feature (like Campaign tracking) until the core dependencies (like user authentication) were fully tested and deployed.

---

## Chapter 4: Investigation and Analysis

### 4.1 Uncovering the Real Problem
Before designing the architecture, I had to understand exactly what small creators needed. Building software based on assumptions leads to feature bloat. I conducted an investigation phase utilizing competitor analysis and informal interviews with independent digital creators.

The initial assumption was that creators wanted a tool to automatically post their content. The investigation proved this wrong. Creators actually enjoy the act of posting-it gives them a final chance to review the formatting. Their actual frustration lies in the planning phase and the post-analysis phase. They struggle to stare at a blank screen and write compelling copy, and they struggle to look at a week's worth of statistics and understand *why* they grew or shrank. 

### 4.2 System Requirements
Based on this feedback, I drafted a strict set of system requirements. I split these into Functional Requirements (the actions the system must perform) and Non-Functional Requirements (the quality, security, and performance standards the system must uphold).

#### 4.2.1 Functional Requirements (FR)
- **FR1 (Authentication):** The system must allow users to register and log in securely using an email and password via Firebase Authentication.
- **FR2 (Data Synchronization):** The system must provide a Next.js web dashboard and a Flutter mobile application that read from the exact same real-time database.
- **FR3 (Data Aggregation):** The system must allow users to input their audience statistics manually, while also providing a web-scraping route to fetch public Instagram data automatically.
- **FR4 (AI Content Analysis):** The system must take user-provided post data, send it to the Gemini API, and return actionable advice on why the content succeeded or failed.
- **FR5 (AI Copy Generation):** The system must generate marketing copy based on the user's specified campaign goals.
- **FR6 (Campaign Management):** The system must allow users to create and track marketing campaigns, storing the start dates, end dates, and associated platforms in Firestore.
- **FR7 (Reminders):** The system must allow users to set specific reminders (e.g., "Post the product launch video on Tuesday") and view these reminders on the mobile app.

#### 4.2.2 Non-Functional Requirements (NFR)
- **NFR1 (Security):** The system must never store passwords in plain text. Route guards must protect all API endpoints and frontend views from unauthorized access. Firestore Security Rules must explicitly reject any read/write request where the user's Auth UID does not match the Document ID.
- **NFR2 (Performance):** The Next.js API routes handling the Gemini LLM requests must return a response within 8 seconds to prevent frontend timeout errors.
- **NFR3 (Cross-Platform Consistency):** The UI must look and behave consistently whether the user accesses it via a desktop Chrome browser, an iOS device, or an Android device.

### 4.3 MoSCoW Prioritization
I categorized these requirements using the MoSCoW method to prevent scope creep during the tight academic schedule. 

- **Must Have (The core product):** Secure authentication, the cross-platform Firestore connection, manual data entry, and the core Gemini AI insight route.
- **Should Have (High value, but bypassable):** The Campaigns and Reminders tracking system. The dedicated web scraping route for Instagram.
- **Could Have (Quality of life features):** Custom visual components like the `QualityRing.tsx` and platform-specific SVG icons (`PlatformIcon.tsx`).
- **Won't Have (Excluded from current scope):** Full OAuth integration with the Facebook Graph API for automated publishing. Complex team-collaboration features.

### 4.4 Use Case Scenarios
To validate the requirements, I mapped out specific use cases. This process clarifies how the backend APIs need to interact with the frontend UI.

**Use Case 1: Generating Campaign Copy**
The user opens the `Campaigns` screen on the web dashboard. They click "New Campaign" and input a basic premise: "Summer sale for handmade candles." They click "Generate Copy." The Next.js frontend sends a POST request to `api/gemini/generate-copy/route.ts`. The backend constructs a highly specific prompt, appending the user's request, and sends it to Google's Gemini servers. The LLM returns three variations of marketing copy. The backend parses this response and sends it back to the frontend, where it renders on the screen. The user selects the best one and saves the campaign to Firestore.

**Use Case 2: Checking Reminders on the Go**
The user is away from their computer. They open the Social94 Flutter app on their iPhone. The `main.dart` file initializes Firebase and checks the auth state. Seeing a valid token, it routes the user to the `DashboardScreen`. The user taps the bottom navigation bar to open the `RemindersScreen`. The Flutter app opens a `StreamBuilder` connected to the `reminders` collection in Firestore. It pulls down the tasks the user set earlier on their computer and displays them in a clean, scrollable list.

### 4.5 Conclusion of Investigation
The investigation phase prevented me from building a tool nobody wanted. By abandoning the idea of an automated poster and focusing instead on AI-driven insights and cross-platform campaign management, the project aligned perfectly with the actual pain points of independent creators. The MoSCoW prioritization ensured that the highly complex features-like the Gemini integration-took precedence over standard boilerplate features, setting a clear technical roadmap for the Design and Implementation phases.


## Chapter 5: Design

### 5.1 Architecture Under the Hood
Building a system that spans the web, iOS, and Android requires a decoupled architecture. If you tightly couple the frontend directly to the database logic without an API layer, you create technical debt instantly. Any change to the database breaks all three platforms simultaneously.

Social94 uses a strict Client-Server architecture. The Next.js web app and the Flutter mobile app are dumb clients. They do not calculate complex metrics or communicate directly with the Gemini LLM. They simply display data and send requests. The server layer handles the heavy lifting. In this case, the server layer is divided into two parts: Google Firebase handles data persistence and authentication, while Next.js API routes act as the middleman for all artificial intelligence and scraping requests.

### 5.2 Designing the Database Schema
Choosing a database involves deciding how strict your data needs to be. A traditional SQL database forces data into rigid tables. A NoSQL database, like Firebase Firestore, stores data in flexible, JSON-like documents. Because social media metrics constantly change-TikTok might introduce a new metric tomorrow that Facebook lacks-I chose Firestore for its flexibility.

I structured the database to avoid deep, unreadable nesting. Everything branches from the central `users` collection.
- **`users` Collection:** The root node. It uses the secure UID generated by Firebase Auth as the document ID.
  - **`audience_stats` Sub-Collection:** Stores manual and scraped follower counts.
  - **`campaigns` Sub-Collection:** Stores the data generated by the Gemini API. Fields include `campaign_name`, `target_audience`, `generated_copy`, and `start_date`.
  - **`reminders` Sub-Collection:** Stores lightweight tasks. Fields include `reminder_text`, `due_date`, and `is_completed`.

This shallow structure means the Flutter app does not have to download a user's entire gigabyte-sized profile just to check if they have a reminder due today. It simply queries the `reminders` sub-collection directly.

### 5.3 Designing the AI Pipeline
The most complex design challenge was the AI pipeline. You cannot simply pass user input directly to the Gemini API; users write vague prompts. If a user types "Make a post about shoes," the AI generates terrible, generic copy.

To fix this, I designed a prompt-engineering layer inside the backend API routes. When a user requests copy generation, the system does not just send the request. The backend first fetches the user's historical campaign data from Firestore. It then constructs a strict system prompt instructing Gemini to act as a senior marketing strategist, to match the user's historical tone, and to output the response in a specific JSON format. By designing the API to demand JSON instead of raw text, the Next.js frontend can easily parse the response and render it cleanly on the screen without broken formatting.

### 5.4 The User Interface System
I built the "Social94 Design System (Light Theme)" to counter the visual clutter found in enterprise tools. The primary goal was focus. If the user logs in to check their audience reach, that number should be the largest element on the screen.

- **Typography:** I chose "Outfit," a modern, geometric sans-serif font, for all headers. It reads clearly on both large desktop monitors and small mobile screens.
- **Color Palette:** The background is entirely white and light gray, drawing the eye directly to the data cards and the interactive elements. 
- **Custom Components:** I designed specific UI components for data visualization. For example, the `QualityRing.tsx` component visually demonstrates the health of a campaign. The `PlatformIcon.tsx` standardizes the logos for Instagram, TikTok, and Facebook so they align perfectly within the tables.

---

## Chapter 6: Implementation

### 6.1 Turning Design into Code
Implementation is where theoretical design hits the reality of compilers and package managers. I split the development cleanly between the web environment (Next.js/React) and the mobile environment (Flutter/Dart).

### 6.2 The Web Implementation (Next.js)
I built the web dashboard using Next.js App Router and TypeScript. The App Router fundamentally changed how React handles data by introducing Server Components. By default, Next.js renders components on the server before sending them to the browser. This means the heavy JavaScript required to parse the Gemini API responses executes on my server, not on the user's slow laptop. 

#### 6.2.1 The Gemini API Routes
The core logic lives inside the `src/app/api/gemini/` directory. I implemented a centralized helper file, `lib/gemini.ts`, to initialize the Google Generative AI SDK using my private API key stored in `.env.local`.

Take the `audience-insight/route.ts` as an example. When a user clicks "Analyze Audience," the frontend sends an HTTP POST request. The route receives the request, unpacks the user's recent follower statistics, and feeds them into the Gemini model. The critical implementation step here is error handling. If the Gemini API times out or hits a rate limit, the route catches the error and returns a clean `500 Internal Server Error` with a human-readable message, rather than crashing the entire Next.js server.

#### 6.2.2 The Web Scraper Route
Manual data entry creates friction. To solve this, I wrote `api/instagram-scrape/route.ts`. Implementing a scraper is difficult because Instagram actively blocks automated requests. I wrote the logic using a headless browser library (like Puppeteer or Cheerio depending on the environment). The route accepts an Instagram username, navigates to the public profile URL, and searches the DOM (Document Object Model) for the specific meta tags containing the follower count. 

This route acts as a bridge. The user clicks a button, the Next.js backend scrapes the data, returns the raw number, and then the frontend pushes that number directly into the user's Firestore `audience_stats` collection.

#### 6.2.3 The Web UI and Context
Managing user state across a web app is notoriously complex. If a user logs out on the Settings page, the Dashboard page needs to know immediately so it stops fetching private data. I implemented a React Context provider (`AuthContext.tsx`). This file wraps the entire application. It listens to Firebase's `onAuthStateChanged` stream. Any component in the app-from the `Sidebar.tsx` to the `BottomNav.tsx`-can tap into this context to instantly know if the user is authenticated, eliminating the need to pass user tokens down through dozens of nested props.

### 6.3 The Mobile Implementation (Flutter)
While Next.js handles the heavy data processing and API bridging, the Flutter app serves as the lightweight companion. I wrote it entirely in Dart. 

#### 6.3.1 State Management in Flutter
In Flutter, everything is a Widget, and Widgets need to know when data changes. I heavily utilized `StreamBuilder` widgets. In `dashboard_screen.dart`, the code opens a direct websocket stream to the user's Firestore document. 

This creates a seamless experience. If a user creates a new marketing task on their computer via the Next.js app, Firestore updates the database. The `StreamBuilder` running on the iPhone instantly detects that database change and repaints the screen to show the new task. There is no "pull to refresh" required. The implementation of this real-time sync is what makes the dual-architecture system feel like a single, unified product.

#### 6.3.2 Cross-Platform Configuration
The most frustrating implementation hurdle had nothing to do with writing code. It involved configuring the environment. Getting the Flutter app to compile for iOS required navigating Xcode, CocoaPods, and the `GoogleService-Info.plist` files. Android required modifying Gradle build scripts. I utilized the FlutterFire CLI, which automatically generated the `firebase_options.dart` file. This file acts as a massive switch statement: if the code compiles on Android, it uses the Android API keys; if it compiles on iOS, it switches to the Apple keys. Without this automated implementation, maintaining three separate codebases would have been impossible for a solo developer.

### 6.4 Overcoming Technical Debt
I faced a massive issue midway through implementation regarding the Gemini AI routes. The Next.js frontend was timing out before Gemini could finish generating the long marketing copy. The default serverless function timeout on Vercel (where the app is hosted) is 10 seconds. Gemini often took 12 to 15 seconds to return complex campaign strategies. 

I solved this by converting the Next.js API route to use the Edge runtime instead of the standard Node.js runtime. The Edge runtime spins up instantly and allows for streaming responses. Instead of waiting 15 seconds for the entire block of text to arrive, the backend now streams the text chunk-by-chunk back to the frontend, exactly like ChatGPT does. This implementation detail completely eliminated the timeout errors and drastically improved the perceived speed of the application.


## Chapter 7: Evaluation of Product

### 7.1 Testing the System
Code that compiles is not code that works. Evaluation proves whether the software actually solves the problem defined in Chapter 1. I tested Social94 in three stages: Unit Testing for individual logic, Integration Testing for cross-platform data flow, and User Acceptance Testing (UAT) to see if independent creators actually found it useful.

### 7.2 Technical Testing Results
#### 7.2.1 The Gemini API Edge Cases
I spent significant time testing the `api/gemini/analyze-content/route.ts` endpoint. LLMs are prone to hallucinations-they invent facts if the prompt is too loose. I ran fifty test cases feeding the API erratic data. For instance, I submitted a campaign where the follower count dropped by 500, but engagement increased by 200%. 

Early tests failed. The AI hallucinated a response suggesting the user should "buy more followers." I had to rewrite the system prompt in the backend code, explicitly forbidding the AI from suggesting black-hat marketing tactics. After tightening the prompt engineering and demanding JSON output, the API passed the remaining tests, returning mathematically sound advice consistently.

#### 7.2.2 The Scraper Brittle Test
Testing the `api/instagram-scrape/route.ts` proved why developers prefer official APIs. During integration testing, the scraper worked perfectly for three days. On the fourth day, Instagram pushed an invisible update to their web client, changing the CSS class names on user profiles. The scraper immediately returned a `NULL` value, breaking the Next.js frontend. 

I implemented a fallback mechanism. If the scraper fails to find the specific DOM element, it no longer crashes the app. It gracefully returns an error to the UI via the `Toast.tsx` component, prompting the user: "Automated sync failed. Please enter data manually." This test highlighted the fragility of web scraping but confirmed the robustness of the error-handling logic.

### 7.3 User Acceptance Testing (UAT)
I handed the completed platform to a group of five users-three independent artists and two marketing students. I asked them to manage their social media for one week using Social94 instead of their usual spreadsheets.

**The Feedback:**
1. **The AI Generation:** Users loved the `generate-copy` feature. One user noted that it saved them an hour of staring at a blank screen. However, they pointed out that the AI occasionally used overly enthusiastic language. I used this feedback to refine the Gemini prompt, instructing it to use a more natural, direct tone.
2. **The Mobile Experience:** The Flutter app received the highest praise. Users liked the Reminders screen. Because the app connects to the same Firestore database, they could plan a campaign on their laptop on Sunday and get push-like reminders on their iPhone on Tuesday.
3. **The Scraper:** When the scraper worked, users preferred it over manual entry. But when Instagram blocked the request, users found it frustrating. They universally requested full OAuth integration in future updates, confirming my initial assumption that scraping is a temporary patch, not a permanent solution.

---

## Chapter 8: Critical Evaluation of Project

### 8.1 The Reality of Development
Building Social94 taught me more about software engineering than any textbook. The project succeeded in delivering a cross-platform, AI-integrated marketing dashboard. But it also exposed flaws in my time management and architectural planning.

### 8.2 The Successes
1. **The Dual-Client Architecture:** Choosing Next.js and Flutter was highly ambitious. Maintaining two distinct codebases (TypeScript and Dart) simultaneously is difficult. But the risk paid off. The web dashboard handles complex data visualization effortlessly, and the mobile app feels fast and native. Linking both to Firestore via `StreamBuilder` in Flutter and `Context` in React created a seamless real-time experience that rivals commercial software.
2. **AI as a Feature, Not a Gimmick:** Many developers slap an AI chatbot onto an app and call it revolutionary. By integrating Gemini directly into the API routes (`audience-insight` and `generate-copy`), the AI acts as an invisible engine. The user does not chat with an AI; they simply press "Analyze" and receive actionable marketing data. This focused implementation is the strongest technical achievement of the project.

### 8.3 The Failures and Challenges
1. **The Cost of Scraping:** Relying on web scraping for the Instagram route cost me nearly a week of development time. Writing the script was easy; keeping it working against Instagram's anti-bot measures was a nightmare. I spent too much time trying to bypass rate limits instead of building features. In hindsight, I should have accepted the manual-entry limitation earlier or bit the bullet and navigated the complex Facebook Graph API approval process.
2. **State Management Complexity:** I underestimated how difficult it is to manage user state across protected routes in Next.js. Before I implemented the `AuthGuard.tsx` component, users could force-navigate to a campaign page after logging out, causing the app to crash when it tried to read from a null user token. Learning to manage the authentication lifecycle properly was a painful but necessary lesson.

### 8.4 Personal Growth
This project forced me to become a full-stack engineer. I learned how to read undocumented API errors, how to manage asynchronous data streams, and how to design a UI that doesn't overwhelm the user. More importantly, I learned project discipline-knowing when to abandon a broken feature (like aggressive scraping) to protect the stability of the core application.

---

## Chapter 9: Conclusion

### 9.1 Final Summary
I set out to build an automated social media marketing platform that solved the data fragmentation problem for small creators. Social94 achieves this. 

By leveraging a decoupled architecture, I built a Next.js web application for deep analysis and a Flutter mobile application for on-the-go management. Instead of relying purely on static charts, I integrated Google's Gemini LLM directly into the backend API. This integration transforms Social94 from a simple tracking tool into an active marketing assistant, capable of analyzing audience trends and generating targeted campaign copy. 

While the reliance on web scraping highlighted the extreme difficulties of extracting data from locked-down platforms like Instagram, the fallback manual entry and the real-time Firebase synchronization ensure the platform remains stable and useful. User testing proved that the core premise works: independent creators want a clean, fast, AI-assisted dashboard without the enterprise price tag. 

### 9.2 Future Roadmap
Software requires iteration. Based on the technical evaluation and user feedback, the roadmap for Social94 is clear:
1. **Official OAuth Integration:** The web scraper must be replaced. The immediate next step is navigating the developer approval processes for the Facebook Graph API and the TikTok API to allow stable, automated data ingestion.
2. **Automated Publishing:** Once the official APIs are connected, the system can move beyond just generating copy. I plan to build a scheduling queue, allowing Social94 to automatically publish the AI-generated posts to the user's connected platforms.
3. **Advanced Analytics Export:** Users requested the ability to export their AI-generated insights into clean PDF reports to share with sponsors. I plan to implement a server-side PDF generation route in Next.js to handle this request.

Social94 proves that with modern frameworks like Next.js, Flutter, and serverless AI integration, a solo developer can build tools that rival established enterprise software.


