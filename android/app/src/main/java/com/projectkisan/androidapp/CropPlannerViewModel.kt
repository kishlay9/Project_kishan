package com.projectkisan.androidapp

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.firestore.GeoPoint
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

// Sealed class to represent the different states of the UI
sealed class PlannerUiState {
    object Idle : PlannerUiState()
    object Loading : PlannerUiState()
    data class Success(val recommendations: List<CropRecommendation>) : PlannerUiState()
    data class Error(val message: String) : PlannerUiState()
}

class CropPlannerViewModel : ViewModel() {

    private val functions: FirebaseFunctions = Firebase.functions("asia-south1")

    private val _uiState = MutableStateFlow<PlannerUiState>(PlannerUiState.Idle)
    val uiState = _uiState.asStateFlow()

    fun generateRecommendations(
        location: GeoPoint,
        landSize: Double,
        budget: Int,
        waterAccess: String
    ) {
        viewModelScope.launch {
            _uiState.value = PlannerUiState.Loading
            try {
                // Prepare the data payload exactly as the backend expects
                val requestData = hashMapOf(
                    "location" to hashMapOf(
                        "latitude" to location.latitude,
                        "longitude" to location.longitude
                    ),
                    "landSize" to landSize,
                    "budget" to budget,
                    "waterAccess" to waterAccess
                )

                Log.d("CropPlannerViewModel", "Calling generateOpportunity with data: $requestData")

                // Call the 'generateOpportunity' Callable Function
                val result = functions.getHttpsCallable("generateOpportunity")
                    .call(requestData)
                    .await()

                // The result.data is a HashMap. We need to extract 'crop_plans' and parse it.
                val resultMap = result.data as? Map<*, *>
                val cropPlansList = resultMap?.get("crop_plans")

                if (cropPlansList == null) {
                    throw Exception("Backend response did not contain 'crop_plans' field.")
                }

                // Use Gson to safely convert the list of maps into our data class list
                val gson = Gson()
                val json = gson.toJson(cropPlansList)
                val type = object : TypeToken<List<CropRecommendation>>() {}.type
                val recommendations: List<CropRecommendation> = gson.fromJson(json, type)

                Log.d("CropPlannerViewModel", "Successfully parsed recommendations: $recommendations")
                _uiState.value = PlannerUiState.Success(recommendations)

            } catch (e: Exception) {
                Log.e("CropPlannerViewModel", "Failed to generate recommendations", e)
                _uiState.value = PlannerUiState.Error(e.message ?: "An unknown error occurred.")
            }
        }
    }

    // Function to reset the state back to idle
    fun resetState() {
        _uiState.value = PlannerUiState.Idle
    }
}