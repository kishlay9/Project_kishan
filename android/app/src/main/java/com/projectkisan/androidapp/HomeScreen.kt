package com.projectkisan.androidapp

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.projectkisan.androidapp.ui.theme.*

@Composable
fun HomeScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Dashboard", style = MaterialTheme.typography.headlineLarge, color = BlueSecondary, fontWeight = FontWeight.ExtraBold)
            Spacer(modifier = Modifier.height(16.dp))
        }

        item { WeatherCard() }

        item {
            Text("Guardian AI Status", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 24.dp, bottom = 8.dp))
            StatusCard(iconRes = R.drawable.ic_status_pest, text = "Pest Risk:", status = "Low", statusColor = Color(0xFFC0392B))
            StatusCard(iconRes = R.drawable.ic_status_moisture, text = "Soil Moisture:", status = "Optimal", statusColor = BlueSecondary)
        }

        item {
            Text("Community & News", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 24.dp, bottom = 8.dp))
            NewsCard(
                iconRes = R.drawable.ic_news_announcement,
                title = "New Subsidy Scheme Announced",
                description = "The state government has announced a new 50% subsidy on drip irrigation systems. ",
                linkText = "Read more..."
            )
            NewsCard(
                iconRes = R.drawable.ic_news_tip,
                title = "Tip of the Day",
                description = "Prevent blight on tomato plants by ensuring good air circulation and avoiding overhead watering. ",
                linkText = "Learn how..."
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// Reusable UI components for the Home Screen

@Composable
fun WeatherCard() {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text("Rohtak, 19 Jul", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Clear • 27°C / 35°C", style = MaterialTheme.typography.bodyMedium, color = TextMutedLight)
            }
            Box(
                modifier = Modifier.size(48.dp).clip(CircleShape).background(Color(0xFFFFF4DE)),
                contentAlignment = Alignment.Center
            ) {
                Icon(painterResource(id = R.drawable.ic_weather_sun), contentDescription = "Weather", tint = Color(0xFFFFA800), modifier = Modifier.size(32.dp))
            }
        }
    }
}

@Composable
fun StatusCard(iconRes: Int, text: String, status: String, statusColor: Color) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.padding(bottom = 8.dp).shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(painterResource(id = iconRes), contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                buildAnnotatedString {
                    append("$text ")
                    withStyle(style = SpanStyle(color = statusColor, fontWeight = FontWeight.Bold)) {
                        append(status)
                    }
                },
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
fun NewsCard(iconRes: Int, title: String, description: String, linkText: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.padding(bottom = 8.dp).shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(56.dp).clip(CircleShape).background(BlueSecondary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(painterResource(id = iconRes), contentDescription = null, tint = BlueSecondary, modifier = Modifier.size(32.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(
                    buildAnnotatedString {
                        append(description)
                        withStyle(style = SpanStyle(color = GreenPrimary, fontWeight = FontWeight.Bold)) {
                            append(linkText)
                        }
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextMutedLight
                )
            }
        }
    }
}