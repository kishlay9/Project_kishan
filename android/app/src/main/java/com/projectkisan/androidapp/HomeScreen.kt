package com.projectkisan.androidapp

import android.Manifest
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.google.android.gms.location.LocationServices
import com.projectkisan.androidapp.models.WeatherApiResponse
import com.projectkisan.androidapp.ui.WeatherUiState
import com.projectkisan.androidapp.ui.WeatherViewModel
import com.projectkisan.androidapp.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HomeScreen(navController: NavController, weatherViewModel: WeatherViewModel = viewModel()) {
    val context = LocalContext.current
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    val weatherState by weatherViewModel.weatherState.collectAsState()

    // Launcher for requesting location permission
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                try {
                    fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                        if (location != null) {
                            // Location found, fetch weather for it
                            weatherViewModel.fetchWeatherData(location.latitude, location.longitude)
                        } else {
                            // Handle null location (e.g., on emulator or if location is off)
                            Log.e("HomeScreen", "Location is null, fetching with default.")
                            weatherViewModel.fetchWeatherData(28.7041, 77.1025) // Default to Delhi
                        }
                    }
                } catch (e: SecurityException) {
                    // Catch SecurityException and use default location
                    Log.e("HomeScreen", "Location permission error, using default.", e)
                    weatherViewModel.fetchWeatherData(28.7041, 77.1025) // Default to Delhi
                }
            } else {
                // Handle permission denial and use default location
                Log.w("HomeScreen", "Permission denied, fetching with default location.")
                weatherViewModel.fetchWeatherData(28.7041, 77.1025) // Default to Delhi
            }
        }
    )

    // Trigger the permission request once when the composable is first displayed
    LaunchedEffect(Unit) {
        permissionLauncher.launch(Manifest.permission.ACCESS_COARSE_LOCATION)
    }

    // Main UI Layout
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(16.dp)) }
        item {
            WeatherRow(state = weatherState)
            Spacer(modifier = Modifier.height(24.dp))
        }
        item {
            Text(
                text = "Guardian AI Status",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        item {
            StatusCard(
                icon = painterResource(id = R.drawable.ic_pest),
                title = "Pest Risk:",
                value = "Low",
                valueColor = AccentRed
            )
            Spacer(modifier = Modifier.height(12.dp))
        }
        item {
            StatusCard(
                icon = painterResource(id = R.drawable.ic_moisture),
                title = "Soil Moisture:",
                value = "Optimal",
                valueColor = AccentLightBlue
            )
            Spacer(modifier = Modifier.height(24.dp))
        }
        item {
            ActionCard(
                icon = painterResource(id = R.drawable.ic_calculator),
                title = "Fertilizer Calculator",
                description = "Plan your nutrient application",
                color = DarkThemeActionBlue,
                onClick = { /* Handle click */ }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        item {
            // Note: Ensure you have an 'ic_crop_planner.png' in your drawable folder for this card
            ActionCard(
                icon = painterResource(id = R.drawable.ic_crop_planner),
                title = "Crop Planner",
                description = "Smart crop recommendations",
                color = DarkThemeActionGreen,
                onClick = { /* Handle click */ }
            )
        }
    }
}

// =================================================================
//  HELPER COMPOSABLES FOR HomeScreen
// =================================================================

@Composable
fun WeatherRow(state: WeatherUiState) {
    when (state) {
        is WeatherUiState.Loading -> {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(88.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        is WeatherUiState.Error -> {
            Text(
                text = "Failed to load weather: ${state.message}",
                color = MaterialTheme.colorScheme.error
            )
        }
        is WeatherUiState.Success -> {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
            ) {
                item { CurrentWeatherCardV2(data = state.data) }
                item { SprayingConditionsCardV2(data = state.data) }
            }
        }
    }
}

@Composable
fun CurrentWeatherCardV2(data: WeatherApiResponse) {
    val weather = data.weather
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = WeatherCardMintBackground),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .width(260.dp)
            .height(80.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 20.dp)
                .fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.Center
            ) {
                val todayDate = SimpleDateFormat("d MMM", Locale.getDefault()).format(Date())
                Text(
                    text = "Today, $todayDate",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextColor
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${weather?.condition ?: ""} • ${weather?.maxTemp?.toInt() ?: "N/A"}°C / ${weather?.minTemp?.toInt() ?: "N/A"}°C",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "${weather?.maxTemp?.toInt() ?: "N/A"}°C",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
        }
    }
}

@Composable
fun SprayingConditionsCardV2(data: WeatherApiResponse) {
    val spraying = data.sprayingConditions
    val isFavourable = spraying?.condition.equals("Favourable", ignoreCase = true)
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = WeatherCardBackground),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .width(260.dp)
            .height(80.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Spraying conditions",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = spraying?.condition ?: "Unknown",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isFavourable) PrimaryGreen else TextColor
                )
            }
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(SprayingCardWarningIconBg, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                if (!isFavourable) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_warning_outline),
                        contentDescription = "Warning",
                        tint = SprayingCardWarningIconTint,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun StatusCard(icon: Painter, title: String, value: String, valueColor: Color) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = icon,
                contentDescription = title,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = value,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
                color = valueColor
            )
        }
    }
}

@Composable
fun ActionCard(icon: Painter, title: String, description: String, color: Color, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = icon,
                contentDescription = title,
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Go",
                tint = Color.White,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}