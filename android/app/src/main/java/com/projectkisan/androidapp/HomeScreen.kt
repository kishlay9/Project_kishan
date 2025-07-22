package com.projectkisan.androidapp

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@Composable
fun HomeScreen(navController: NavController) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background) // Use theme color
            .padding(16.dp)
    ) {
        item {
            Text(
                text = "Dashboard",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.secondary, // Use theme color
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        item {
            WeatherHeader()
            Spacer(modifier = Modifier.height(24.dp))
        }
        item {
            Text(
                "Guardian AI Status",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground // Use theme color
            )
            Spacer(modifier = Modifier.height(8.dp))
            StatusCard(
                iconResId = R.drawable.ic_pest,
                text = "Pest Risk:",
                status = "Low",
                statusColor = MaterialTheme.colorScheme.primary // Use theme color
            )
            Spacer(modifier = Modifier.height(12.dp))
            StatusCard(
                iconResId = R.drawable.ic_moisture,
                text = "Soil Moisture:",
                status = "Optimal",
                statusColor = MaterialTheme.colorScheme.secondary // Use theme color
            )
            Spacer(modifier = Modifier.height(24.dp))
        }
        item {
            FertilizerCalculatorButton(
                onClick = {
                    navController.navigate("fertilizer_calculator")
                }
            )
        }
    }
}

@Composable
fun WeatherHeader() {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface) // Use theme color
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    "Rohtak, 19 Jul",
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface // Use theme color
                )
                Text(
                    "Clear • 27°C / 35°C",
                    color = MaterialTheme.colorScheme.onSurfaceVariant, // Use theme color
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Image(
                painter = painterResource(id = R.drawable.ic_weather_sunny),
                contentDescription = "Weather",
                modifier = Modifier.size(48.dp)
            )
        }
    }
}

@Composable
fun StatusCard(iconResId: Int, text: String, status: String, statusColor: Color) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface) // Use theme color
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = iconResId),
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text,
                modifier = Modifier.weight(1f),
                color = MaterialTheme.colorScheme.onSurface // Use theme color
            )
            Text(status, fontWeight = FontWeight.Bold, color = statusColor)
        }
    }
}

@Composable
fun FertilizerCalculatorButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(70.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary), // Use theme color
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_calculator),
                contentDescription = null,
                tint = Color.White
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text("Fertilizer Calculator", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Plan your nutrient application", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
            }
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                painter = painterResource(id = R.drawable.ic_arrow_right),
                contentDescription = "Navigate",
                tint = Color.White
            )
        }
    }
}