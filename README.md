# StudyOS

[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-3F51B5)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

StudyOS is a focused student workspace for organizing classes, assignments, exams, attendance, notes, grades, and study sessions in one calm interface.

Authentication is optional. The core study tools work in guest mode, while an account can be used to personalize the profile and connect authenticated services.

## Features

### Academic workspace

- Overview dashboard with attendance, upcoming exams, task progress, and next class
- Class schedule management
- Assignment and study-task tracking with completion states
- Exam planning
- Attendance tracking with target percentages
- Grade and GPA tracking
- Notes and study resources
- Focus session with a Pomodoro-style timer view
- Create and delete actions through shared modal forms

### Account and settings

- Guest mode with no login requirement
- Email/password login
- Account creation with required first name and optional last name
- Optional GitHub sign-in using GitHub Device Flow and Firebase Authentication
- Account popup anchored to the profile button
- Signed-in profile name and email display
- Settings screen with account information
- AMOLED-friendly dark mode with pure black backgrounds
- Android back navigation support for auth and settings screens

## Tech stack

- React Native 0.88
- TypeScript
- React Native Firebase App, Auth, and Firestore
- Firebase Authentication
- GitHub OAuth Device Flow
- React Native SVG for provider icons
- Jest-based test setup

## Requirements

- Node.js 22.11 or newer
- npm
- Android Studio and an Android SDK for Android development
- Xcode and CocoaPods for iOS development
- A Firebase project for authentication and native Firebase configuration

Follow the official [React Native environment setup guide](https://reactnative.dev/docs/environment-setup) before running the project.

## Getting started

Clone the repository and install dependencies:

```powershell
git clone https://github.com/rafiulrafi55/StudyOS.git
cd StudyOS
npm install
```

### Firebase setup

1. Create or select a Firebase project.
2. Register an Android app with the package name `com.studyos`.
3. Enable Email/Password and GitHub under Firebase Authentication sign-in providers.
4. Add the SHA-1 and SHA-256 fingerprints for the keystore used by your build.
5. Download `google-services.json`.
6. Place it at `android/app/google-services.json`.
7. Set the GitHub OAuth client ID in `src/config/authProviders.ts`.

The GitHub OAuth app must have Device Flow enabled. The GitHub client secret must remain in GitHub/Firebase provider configuration and must never be embedded in the mobile application.

### Run on Android

Start Metro:

```powershell
npm start
```

In another terminal:

```powershell
npm run android
```

After changing native dependencies or Firebase configuration, perform a clean rebuild:

```powershell
cd android
.\gradlew clean
cd ..
npm run android
```

### Run on iOS

Install CocoaPods dependencies after the first clone or any native dependency update:

```powershell
bundle install
bundle exec pod install
```

Then run:

```powershell
npm run ios
```

## Development commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Metro development server |
| `npm run android` | Build and run the Android app |
| `npm run ios` | Build and run the iOS app |
| `npm test -- --runInBand` | Run the Jest suite |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run the TypeScript compiler without emitting files |

If Fast Refresh reports stale hook or render state after a structural change, restart Metro with:

```powershell
npx react-native start --reset-cache
```

## Project structure

```text
App.tsx                         Application shell and navigation state
src/components/                 Screens, dashboard modules, auth, and settings
src/config/                     Firebase and provider configuration
src/data/                       Static module definitions
src/styles.ts                   Shared visual styles and theme overrides
src/types.ts                    Shared domain types
__tests__/                      Jest tests
android/                        Android native project
ios/                            iOS native project
```

## Authentication notes

StudyOS deliberately keeps authentication optional. Users can create and manage study data without signing in. The account menu is the entry point for login, logout, and settings.

The GitHub flow uses a public OAuth client ID and a device code. Do not commit:

- GitHub client secrets
- Private keys
- Release keystores
- Additional service-account credentials

The Firebase Android configuration file is required for native builds. Review it before publishing an application and use separate release credentials for production.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Keep changes focused and consistent with the existing component patterns.
2. Run `npx tsc --noEmit`.
3. Run `npm run lint`.
4. Run the relevant tests.
5. Do not include secrets or generated build artifacts.

## License

StudyOS is open source software licensed under the [MIT License](./LICENSE).
