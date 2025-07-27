package com.projectkisan.androidapp.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

// This data class now correctly matches the multilingual structure in your Firestore database.
data class DiagnosisResult(
    @DocumentId val id: String = "",

    val object_category: String = "Loading...",
    val diagnosis_status: String = "",
    val confidence_score: Double = 0.0,
    val severity: String = "None",
    val contagion_risk: String = "None",

    // FIX: These fields are now Maps to handle multiple languages
    val plant_type: Map<String, String> = emptyMap(),
    val disease_name: Map<String, String> = emptyMap(),
    val description: Map<String, String> = emptyMap(),
    val organic_remedy: Map<String, String> = emptyMap(),
    val chemical_remedy: Map<String, String> = emptyMap(),
    val prevention_tips: Map<String, List<String>> = emptyMap(), // Prevention tips is a map of string to list of strings
    val audio_remedy_url: Map<String, String> = emptyMap(),

    @ServerTimestamp val last_updated: Date? = null
)