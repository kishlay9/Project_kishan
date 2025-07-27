package com.projectkisan.androidapp.models

import kotlinx.serialization.Serializable

// This represents the general chat message for the Ask AI screen
// It's separate from the Schemes ChatMessage to keep concerns separated
@Serializable
data class AskMessage(
    val content: String,
    val isFromUser: Boolean
)

// This represents the JSON response from the askAiAssistant function
@Serializable
data class AskAIResponse(
    val type: String, // "navigation" or "answer"
    val tool: String? = null,
    val message: String? = null,
    val content: String? = null
)