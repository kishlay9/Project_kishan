package com.projectkisan.androidapp

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.projectkisan.androidapp.models.AskAIResponse
import com.projectkisan.androidapp.models.AskMessage
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

class AskViewModel : ViewModel() {

    private val _messages = MutableStateFlow<List<AskMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val ktorClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }

    init {
        // Add the initial greeting message when the ViewModel is created
        _messages.value = listOf(AskMessage("Hello! I'm KisanAI. How can I help you today?", false))
    }

    fun sendQuery(query: String) {
        if (query.isBlank()) return

        val userMessage = AskMessage(content = query, isFromUser = true)
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _isLoading.value = true
            try {
                val aiResponse = getAiResponse(query)
                _messages.value = _messages.value + aiResponse
            } catch (e: Exception) {
                Log.e("AskViewModel", "Error fetching AI response", e)
                val errorMessage = AskMessage("Sorry, I'm having trouble connecting. Please try again.", false)
                _messages.value = _messages.value + errorMessage
            } finally {
                _isLoading.value = false
            }
        }
    }

    private suspend fun getAiResponse(query: String): AskMessage {
        val apiUrl = "https://asia-south1-project-kisan-new.cloudfunctions.net/askAiAssistant"
        val requestBody = mapOf("query" to query)

        Log.d("AskViewModel", "🚀 Sending POST request to URL: $apiUrl with body: $requestBody")

        val response: AskAIResponse = ktorClient.post(apiUrl) {
            setBody(requestBody)
            headers.append("Content-Type", "application/json")
        }.body()

        Log.d("AskViewModel", "✅ Received successful response: $response")

        // The response will either have a 'message' (for navigation) or 'content' (for an answer)
        val responseText = response.message ?: response.content ?: "I'm sorry, I didn't understand that."

        return AskMessage(content = responseText, isFromUser = false)
    }
}