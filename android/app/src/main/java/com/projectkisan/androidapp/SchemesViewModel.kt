package com.projectkisan.androidapp

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.projectkisan.androidapp.models.ChatMessage
import com.projectkisan.androidapp.models.SchemeResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json

class SchemesViewModel : ViewModel() {

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    var selectedState by mutableStateOf<String?>(null)

    private val ktorClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }

    fun onStateSelected(state: String) {
        selectedState = state
        // ▼▼▼ FIX: REMOVE this line. The initial message will be handled by the UI now. ▼▼▼
        // _messages.value = listOf(...)

        // ▼▼▼ ADD this line to add the AI's standard greeting instead. ▼▼▼
        _messages.value = listOf(
            ChatMessage(
                text = "Hello! Ask me about schemes for irrigation, seeds, loans, etc. in **$state**.",
                isFromUser = false
            )
        )
    }


    fun sendQuery(query: String) {
        if (query.isBlank() || selectedState == null) return

        val userMessage = ChatMessage(text = query, isFromUser = true)
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _isLoading.value = true
            try {
                val aiResponse = getAiResponse(query, selectedState!!)
                _messages.value = _messages.value + aiResponse
            } catch (e: Exception) {
                Log.e("SchemesViewModel", "Error fetching AI response", e)
                val errorMessage = ChatMessage("I'm sorry, I'm having trouble connecting. Please try again.", false)
                _messages.value = _messages.value + errorMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    private suspend fun getAiResponse(query: String, location: String): ChatMessage {
        val apiUrl = "https://asia-south1-project-kisan-new.cloudfunctions.net/getSchemeAnswer"
        val requestBody = mapOf(
            "question" to query,
            "stateName" to location
        )

        Log.d("SchemesViewModel", "🚀 Sending POST request to URL: $apiUrl with body: $requestBody")

        val response: SchemeResponse = ktorClient.post(apiUrl) {
            setBody(requestBody)
            headers.append("Content-Type", "application/json")
        }.body()

        Log.d("SchemesViewModel", "✅ Received successful response: $response")

        return if (response.schemesFound && response.schemes.isNotEmpty()) {
            ChatMessage(
                text = "Based on your query, here are some schemes I found for **$location**:",
                isFromUser = false,
                schemes = response.schemes
            )
        } else {
            ChatMessage(
                text = response.messageIfNoSchemes ?: "I couldn't find any specific schemes for that query in $location.",
                isFromUser = false
            )
        }
    }
}