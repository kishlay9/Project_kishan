package com.projectkisan.androidapp.models

// Represents a single threat returned from the activateGuardian function
data class GuardianThreat(
    val threatName: String = "Unknown Threat",
    val riskLevel: String = "Unknown",
    val reasoning: String = "No reasoning provided."
)