package com.projectkisan.androidapp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.projectkisan.androidapp.models.GuardianThreat
import com.projectkisan.androidapp.ui.GuardianUiState
import com.projectkisan.androidapp.ui.GuardianViewModel
import com.projectkisan.androidapp.ui.theme.*

@Composable
fun GuardianResultScreen(navController: NavController, viewModel: GuardianViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    // Reset state when leaving the screen
    DisposableEffect(Unit) {
        onDispose {
            viewModel.resetState()
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(LightGrayBackground)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                "Threat Assessment",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = PrimaryGreen
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        when (val state = uiState) {
            is GuardianUiState.Success -> {
                if (state.threats.isEmpty()) {
                    item {
                        Text("No significant threats were identified based on the current forecast. Continue to monitor your crops regularly.")
                    }
                } else {
                    items(state.threats.size) { index ->
                        ThreatAssessmentCard(threat = state.threats[index])
                    }
                }
            }
            is GuardianUiState.Error -> {
                item { Text("Error: ${state.message}", color = MaterialTheme.colorScheme.error) }
            }
            GuardianUiState.Loading -> {
                item { Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
            }
            GuardianUiState.Idle -> {
                item { Text("No assessment available. Please go back and activate the Guardian.") }
            }
        }
    }
}

@Composable
fun ThreatAssessmentCard(threat: GuardianThreat) {
    val riskColor = when (threat.riskLevel.lowercase()) {
        "high" -> Color(0xFFEF5350)
        "medium" -> Color(0xFFFFA726)
        else -> Color(0xFF66BB6A)
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Identified Threat", style = MaterialTheme.typography.labelMedium, color = TextMuted)
                Text(threat.threatName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = TextColor)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("Risk Level", style = MaterialTheme.typography.labelMedium, color = TextMuted)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(riskColor)
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(threat.riskLevel, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        ReasoningCard(text = threat.reasoning)
    }
}

@Composable
fun ReasoningCard(text: String) {
    val cornerRadius = 12.dp
    val barThickness = 4.dp
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(cornerRadius))
    ) {
        Box(
            modifier = Modifier
                .width(barThickness)
                .fillMaxHeight()
                .background(PrimaryGreen)
                .align(Alignment.CenterStart)
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(start = barThickness)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_reasoning_icon),
                contentDescription = "Reasoning",
                tint = PrimaryGreen,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = text, style = MaterialTheme.typography.bodyMedium, color = TextMuted, lineHeight = 22.sp)
        }
    }
}