plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinAndroid)
    alias(libs.plugins.google.services)
    // ▼▼▼ THIS IS THE ONLY CHANGE YOU NEED TO MAKE ▼▼▼
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.projectkisan.androidapp"
    compileSdk = 34 // NOTE: Changed from 36 to 34, as 36 is likely a typo and not yet released.
    defaultConfig {
        applicationId = "com.projectkisan.androidapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1"
        vectorDrawables {
            useSupportLibrary = true
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {

    implementation("com.google.code.gson:gson:2.10.1")
    implementation("com.google.android.gms:play-services-location:21.2.0")
    // This library provides the complete set of Material Design icons
    implementation("androidx.compose.material:material-icons-extended:1.6.8")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    // Add the Firebase Bill of Materials (BoM) - This manages library versions for you
    implementation(platform("com.google.firebase:firebase-bom:33.1.1"))
    // For fetching device location
    implementation("com.google.android.gms:play-services-location:21.2.0")

// For loading the weather icon from the URL provided by the backend
    implementation("io.coil-kt:coil-compose:2.6.0")
// Add the dependency for Firebase Cloud Functions
    implementation("com.google.firebase:firebase-functions-ktx")

// Add the dependency for Firebase Firestore (you likely have this already, but ensure it's there)
    implementation("com.google.firebase:firebase-firestore")

// IMPORTANT: Add this for easier async calls with .await()
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.0")
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.3")
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("io.ktor:ktor-client-core:2.3.11")
    implementation("io.ktor:ktor-client-cio:2.3.11")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.11")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.11")

// Kotlinx Serialization for parsing JSON responses
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    // Compose Dependencies
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    // Coil (Image Loading)
    implementation(libs.coil.compose)

    // Ktor (Networking)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)

    // Firebase Dependencies
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.storage.ktx)
    implementation(libs.firebase.firestore.ktx)

    // Debug
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}