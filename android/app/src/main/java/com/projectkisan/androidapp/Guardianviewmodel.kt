package com.projectkisan.androidapp.ui

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.projectkisan.androidapp.models.GuardianThreat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.UUID

// Defines the possible states of the Guardian feature UI
sealed class GuardianUiState {
    object Idle : GuardianUiState() // The initial state
    object Loading : GuardianUiState()
    data class Success(val threats: List<GuardianThreat>) : GuardianUiState()
    data class Error(val message: String) : GuardianUiState()
}

class GuardianViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<GuardianUiState>(GuardianUiState.Idle)
    val uiState: StateFlow<GuardianUiState> = _uiState.asStateFlow()

    private val functions = Firebase.functions("asia-south1")

    fun activateGuardian(crop: String, sowingDate: String, locationCity: String) {
        viewModelScope.launch {
            _uiState.value = GuardianUiState.Loading
            try {
                // Using hardcoded IDs for demonstration purposes
                val farmId = "farm_${UUID.randomUUID()}"
                val userId = "user_placeholder_id"

                val data = hashMapOf(
                    "currentCrop" to crop,
                    "sowingDate" to sowingDate,
                    "locationCity" to locationCity,
                    "farmId" to farmId,
                    "userId" to userId
                )

                Log.d("GuardianViewModel", "Calling activateGuardian with data: $data")
                val result = functions.getHttpsCallable("activateGuardian").call(data).await()

                val responseData = result.data as? Map<String, Any>
                if (responseData == null || responseData["success"] != true) {
                    throw Exception("Backend function returned an error or was unsuccessful.")
                }

                @Suppress("UNCHECKED_CAST")
                val threatsList = responseData["initialThreats"] as? List<Map<String, String>> ?: emptyList()

                val threats = threatsList.map { threatMap ->
                    GuardianThreat(
                        threatName = threatMap["threatName"] ?: "Unknown Threat",
                        riskLevel = threatMap["riskLevel"] ?: "Unknown",
                        reasoning = threatMap["reasoning"] ?: "No reasoning provided."
                    )
                }

                _uiState.value = GuardianUiState.Success(threats)
                Log.d("GuardianViewModel", "Successfully activated Guardian. Threats: $threats")

            } catch (e: Exception) {
                Log.e("GuardianViewModel", "Error activating Guardian", e)
                _uiState.value = GuardianUiState.Error(e.message ?: "An unknown error occurred.")
            }
        }
    }

    // Function to reset the state when the user is done viewing the results
    fun resetState() {
        _uiState.value = GuardianUiState.Idle
    }
}