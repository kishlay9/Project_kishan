// ▼▼▼ THE MOST IMPORTANT FIX IS THIS LINE ▼▼▼
// This declares that all code in this file belongs to the 'ui' package.
package com.projectkisan.androidapp.ui

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.projectkisan.androidapp.models.LocationInfo
import com.projectkisan.androidapp.models.SprayingInfo
import com.projectkisan.androidapp.models.WeatherApiResponse
import com.projectkisan.androidapp.models.WeatherInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

// The compiler can now find this class because the package is correct.
sealed class WeatherUiState {
    object Loading : WeatherUiState()
    data class Success(val data: WeatherApiResponse) : WeatherUiState()
    data class Error(val message: String) : WeatherUiState()
}

// The compiler can now find this class because the package is correct.
class WeatherViewModel : ViewModel() {

    private val _weatherState = MutableStateFlow<WeatherUiState>(WeatherUiState.Loading)
    val weatherState: StateFlow<WeatherUiState> = _weatherState

    private val httpClient = OkHttpClient()

    fun fetchWeatherData(lat: Double, lon: Double) {
        viewModelScope.launch {
            _weatherState.value = WeatherUiState.Loading
            try {
                val functionUrl = "https://asia-south1-project-kisan-new.cloudfunctions.net/getWeatherAndAqi"
                val urlWithParams = "$functionUrl?lat=$lat&lon=$lon"

                val request = Request.Builder()
                    .url(urlWithParams)
                    .build()

                val responseJson = withContext(Dispatchers.IO) {
                    val response = httpClient.newCall(request).execute()
                    if (!response.isSuccessful) {
                        throw Exception("Failed to fetch weather: ${response.message}")
                    }
                    response.body?.string()
                }

                if (responseJson.isNullOrEmpty()) {
                    throw Exception("Received empty response from server")
                }

                val weatherData = parseWeatherResponse(JSONObject(responseJson))
                _weatherState.value = WeatherUiState.Success(weatherData)
                Log.d("WeatherViewModel", "Successfully fetched weather data: $weatherData")

            } catch (e: Exception) {
                Log.e("WeatherViewModel", "Error fetching weather data", e)
                _weatherState.value = WeatherUiState.Error(e.message ?: "An unknown error occurred")
            }
        }
    }

    private fun parseWeatherResponse(json: JSONObject): WeatherApiResponse {
        val locationJson = json.optJSONObject("location")
        val weatherJson = json.optJSONObject("weather")
        val sprayingJson = json.optJSONObject("sprayingConditions")

        return WeatherApiResponse(
            location = LocationInfo(
                city = locationJson?.optString("city"),
                date = locationJson?.optString("date")
            ),
            weather = WeatherInfo(
                currentTemp = weatherJson?.optDouble("currentTemp"),
                condition = weatherJson?.optString("condition"),
                minTemp = weatherJson?.optDouble("minTemp"),
                maxTemp = weatherJson?.optDouble("maxTemp"),
                iconUri = weatherJson?.optString("iconUri")
            ),
            sprayingConditions = SprayingInfo(
                condition = sprayingJson?.optString("condition"),
                reason = sprayingJson?.optString("reason")
            )
        )
    }
}