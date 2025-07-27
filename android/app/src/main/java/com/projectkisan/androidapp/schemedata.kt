package com.projectkisan.androidapp.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// This file is now the single source of truth for all Scheme-related data models.

@Serializable
data class Scheme(
    @SerialName("scheme_name") val schemeName: String = "N/A",
    @SerialName("government_level") val governmentLevel: String = "N/A",
    @SerialName("brief_description") val briefDescription: String = "No description available.",
    @SerialName("key_benefits") val keyBenefits: List<String> = emptyList(),
    @SerialName("how_to_apply") val howToApply: String = "Application details not specified."
)

@Serializable
data class SchemeResponse(
    @SerialName("schemes_found") val schemesFound: Boolean = false,
    val schemes: List<Scheme> = emptyList(),
    @SerialName("message_if_no_schemes") val messageIfNoSchemes: String? = null
)

data class ChatMessage(
    val text: String,
    val isFromUser: Boolean,
    val schemes: List<Scheme>? = null
)