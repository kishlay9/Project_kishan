package com.projectkisan.androidapp.models

// This structure exactly matches the JSON response from your backend function

data class WeatherApiResponse(
    val location: LocationInfo? = null,
    val weather: WeatherInfo? = null,
    val sprayingConditions: SprayingInfo? = null
)

data class LocationInfo(
    val city: String? = null,
    val date: String? = null
)

data class WeatherInfo(
    val currentTemp: Double? = null,
    val condition: String? = null,
    val minTemp: Double? = null,
    val maxTemp: Double? = null,
    val iconUri: String? = null // This will be the URL for the weather icon
)

data class SprayingInfo(
    val condition: String? = null,
    val reason: String? = null
)