# 🌾 Project Kisan - AI-Powered Farming Assistant

**Your Complete AI Farming Partner - From Diagnosis to Market Intelligence**

Project Kisan is a comprehensive agricultural technology platform that empowers Indian farmers with AI-powered tools for crop management, disease diagnosis, market intelligence, and government scheme access.

## 🚀 Features Overview

### Core Features
- **🤖 AI Crop Disease Diagnosis** - Instant photo-based disease identification
- **🛡️ Guardian AI** - Proactive disease prevention and weather-based alerts
- **📊 Market Price Intelligence** - Real-time market prices and trend analysis
- **🧮 Fertilizer Calculator** - Precise NPK calculations for optimal crop nutrition
- **📈 Yield Maximizer** - 14-week personalized growth and protection plans
- **🌱 Crop Planner** - AI recommendations for optimal crop selection
- **🏛️ Government Schemes Assistant** - Access to subsidies and financial support
- **🌍 Multi-language Support** - English, Hindi, and Kannada

## 🛠️ Tech Stack

### Frontend
- **Web Platform**: HTML5, CSS3, JavaScript (Vanilla)
- **Mobile App**: Kotlin, Jetpack Compose (Android)
- **UI Framework**: Material Design 3
- **Styling**: Custom CSS with responsive design
- **State Management**: Local Storage, Firebase Realtime Database

### Backend & Cloud Services
- **Cloud Platform**: Firebase (Google Cloud)
- **Functions**: Firebase Cloud Functions (Node.js)
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

### AI & Machine Learning
- **AI Platform**: Google Vertex AI
- **Language Models**: Gemini AI
- **Computer Vision**: Custom-trained models for crop disease detection
- **Speech Services**: Google Cloud Speech-to-Text & Text-to-Speech
- **Translation**: Google Cloud Translation API

### External APIs
- **Weather Data**: OpenWeatherMap API
- **Market Prices**: Government of India Open Data API
- **Maps & Location**: Google Maps API
- **Geocoding**: Google Geocoding API

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm (Node.js), Gradle (Android)
- **Build Tools**: Firebase CLI, Android Studio
- **Deployment**: Firebase CLI

## 📁 Project Structure

```
Project_kishan/
├── public/                 # Web frontend
│   ├── index.html         # Main landing page
│   ├── assistant.html     # AI chat interface
│   ├── guardian.html      # Proactive disease prevention
│   ├── market.html        # Market price intelligence
│   ├── fertilizer.html    # Fertilizer calculator
│   ├── yield.html         # Yield maximizer
│   ├── cropplanner.html   # Crop planning tool
│   ├── schemes.html       # Government schemes assistant
│   ├── images/            # Static assets
│   ├── videos/            # Media files
│   ├── app.js            # Main JavaScript logic
│   ├── style.css         # Global styles
│   └── *.js              # Feature-specific scripts
├── android/              # Android mobile app
│   ├── app/              # Main app module
│   ├── build.gradle.kts  # Build configuration
│   └── src/              # Source code
├── functions/            # Firebase Cloud Functions
│   ├── index.js         # Main functions file
│   └── package.json     # Node.js dependencies
├── firebase.json        # Firebase configuration
├── firestore.rules      # Database security rules
└── storage.rules        # Storage security rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase CLI
- Android Studio (for mobile development)
- Google Cloud account with billing enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Project_kishan.git
   cd Project_kishan
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**
   ```bash
   firebase login
   ```

4. **Install dependencies**
   ```bash
   # Install web dependencies
   npm install
   
   # Install Cloud Functions dependencies
   cd functions
   npm install
   cd ..
   ```

5. **Set up Firebase project**
   ```bash
   firebase init
   # Select your Firebase project
   ```

6. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## 🎯 How to Navigate the Frontend

### 1. **Main Landing Page** (`index.html`)
- **Hero Section**: Upload crop photos for instant diagnosis
- **Features Grid**: Quick access to all tools
- **Process Timeline**: Understanding of AI analysis workflow

**Key Actions:**
- Click "Diagnose Your Crop" to upload photos
- Click "Ask a Question" for AI chat assistance
- Navigate to specific tools via the features grid

### 2. **AI Assistant** (`assistant.html`)
- **Voice/Text Chat**: Ask farming questions in your language
- **Real-time Responses**: Get instant AI-powered answers
- **Multi-language Support**: English, Hindi, Kannada

**How to Use:**
- Type your question or click the microphone for voice input
- Ask about crop diseases, farming techniques, or general advice
- Receive detailed, contextual responses

### 3. **Guardian AI** (`guardian.html`)
- **Weather Dashboard**: Real-time weather information
- **Proactive Alerts**: Disease and pest threat assessment
- **Customized Schedules**: Location and crop-specific recommendations

**How to Use:**
- Select your crop and sowing date
- Enter your location
- Receive threat assessments and preventive schedules

### 4. **Market Intelligence** (`market.html`)
- **Price Analysis**: Current market prices and trends
- **Market Selection**: Choose optimal selling locations
- **Historical Data**: Price history and forecasting

**How to Use:**
- Select your state and market
- Choose your crop
- View detailed price analysis and recommendations

### 5. **Fertilizer Calculator** (`fertilizer.html`)
- **NPK Calculations**: Precise nutrient requirements
- **Crop-specific Recommendations**: Tailored to your crop type
- **Plot Size Optimization**: Based on your field size

**How to Use:**
- Select your crop
- Enter plot size and unit (acre/hectare/gunta)
- Get precise fertilizer recommendations

### 6. **Yield Maximizer** (`yield.html`)
- **14-Week Plans**: Complete growth cycle management
- **Daily Tasks**: Actionable daily recommendations
- **Crop-specific Guidance**: Tailored to your crop variety

**How to Use:**
- Select crop and variety
- Enter sowing date and location
- Receive comprehensive growth and protection plan

### 7. **Crop Planner** (`cropplanner.html`)
- **AI Recommendations**: Best crops for your conditions
- **Resource Optimization**: Based on water, land, and budget
- **Risk Assessment**: Consideration of local factors

**How to Use:**
- Enter your location and farming conditions
- Specify water access, land size, and budget
- Get AI-recommended crop options

### 8. **Government Schemes** (`schemes.html`)
- **AI Chat Interface**: Ask about available schemes
- **Location-based Results**: State-specific information
- **Financial Support**: Loans, subsidies, and assistance

**How to Use:**
- Select your state
- Ask about specific schemes or general assistance
- Get detailed information and application procedures

## 🔧 Configuration

### Environment Variables
Set up the following in your Firebase project:

```bash
# Google Cloud APIs
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Firebase Configuration
Update `public/app.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📱 Mobile App Development

### Android Setup
1. Open `android/` folder in Android Studio
2. Sync Gradle files
3. Configure Firebase in Android app
4. Build and run on device/emulator

### Key Android Features
- **Offline Capability**: Works without constant internet
- **Location Services**: GPS-based recommendations
- **Camera Integration**: Direct photo capture for diagnosis
- **Push Notifications**: Weather and disease alerts

## 🌐 Deployment

### Web Platform
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

### Mobile App
- Build APK: `./gradlew assembleRelease`
- Build AAB: `./gradlew bundleRelease`
- Upload to Google Play Console

## 🔒 Security

### Firestore Rules
- User authentication required for sensitive operations
- Data validation and sanitization
- Rate limiting on API calls

### Storage Rules
- Image upload restrictions
- File type validation
- Size limits enforcement

## 🧪 Testing

### Web Testing
```bash
# Run local development server
firebase serve

# Test functions locally
firebase emulators:start
```

### Mobile Testing
- Unit tests: `./gradlew test`
- Instrumented tests: `./gradlew connectedAndroidTest`

## 📊 Analytics & Monitoring

### Firebase Analytics
- User engagement tracking
- Feature usage analytics
- Performance monitoring

### Error Tracking
- Firebase Crashlytics (Android)
- Console error logging (Web)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

### Team Contact
- **Lakshay Pal**: +91 9315674123 | llakshaydev@gmail.com
- **Kishlay**: +91 8368139841 | kishlay.ranj@gmail.com
- **Jatin Gupta**: +91 9034602219 | jatin.gupta4208@gmail.com
- **Krrish Barsiwal**: +91 8094951456 | krrishbarsiwal777@gmail.com

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud AI Documentation](https://cloud.google.com/ai/docs)
- [Android Development Guide](https://developer.android.com/guide)

## 📄 License

© 2025 Project Kisan. All Rights Reserved. A new dawn for Indian agriculture.

---

**Built with ❤️ by Team Algo Agni for Indian Farmers**