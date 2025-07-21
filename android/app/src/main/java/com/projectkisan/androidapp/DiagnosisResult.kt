package com.projectkisan.androidapp

import com.google.firebase.firestore.IgnoreExtraProperties

// This annotation tells Firestore to ignore any fields in the document
// that are not in our data class, preventing crashes.
@IgnoreExtraProperties
data class DiagnosisResult(
    val plant_type: String = "N/A",
    val diagnosis_status: String = "N/A",
    val disease_name_english: String = "N/A",
    val confidence_score: Double = 0.0,
    val severity: String = "None",
    val contagion_risk: String = "None",
    val description_english: String = "No description available.",
    // Note: Add Kannada fields from your backend. Simulating them for now.
    val description_kannada: String = "ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.",
    val organic_remedy_english: String = "N/A",
    val organic_remedy_kannada: String = "N/A",
    val chemical_remedy_english: String = "N/A",
    val chemical_remedy_kannada: String = "N/A",
    val prevention_tips_english: List<String> = emptyList(),
    val audio_remedy_url: String = ""
)