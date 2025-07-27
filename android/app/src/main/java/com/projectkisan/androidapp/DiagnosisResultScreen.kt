package com.projectkisan.androidapp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.projectkisan.androidapp.models.DiagnosisResult
import com.projectkisan.androidapp.ui.theme.*
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosisResultScreen(
    viewModel: DiagnosisViewModel,
    result: DiagnosisResult,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    var isPlaying by remember { mutableStateOf(false) }

    // Stop audio when the user leaves the screen
    DisposableEffect(Unit) {
        onDispose {
            viewModel.stopAudio()
        }
    }

    val languageCode = "en" // This can be made dynamic later
    val diseaseName = viewModel.getTranslatedText(result.disease_name, languageCode)
    val plantType = viewModel.getTranslatedText(result.plant_type, languageCode)
    val description = viewModel.getTranslatedText(result.description, languageCode)
    val organicRemedy = viewModel.getTranslatedText(result.organic_remedy, languageCode)
    val chemicalRemedy = viewModel.getTranslatedText(result.chemical_remedy, languageCode)
    val preventionTips = viewModel.getTranslatedPreventionTips(result.prevention_tips, languageCode)
    val audioUrl = viewModel.getTranslatedText(result.audio_remedy_url, languageCode)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Diagnosis Result", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.stopAudio()
                        onNavigateBack()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = LightGrayUI)
            )
        },
        containerColor = LightGrayUI
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Header Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column {
                        Text(
                            text = if (diseaseName != "N/A") diseaseName else result.diagnosis_status,
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = DarkBlueText
                        )
                        Text(
                            text = "($plantType)",
                            style = MaterialTheme.typography.titleMedium,
                            color = MutedGrayText
                        )
                    }
                    Text(
                        text = "${(result.confidence_score * 100).toInt()}% Confident",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = when {
                            result.confidence_score >= 0.75 -> HealthyGreen
                            result.confidence_score >= 0.5 -> WarningOrange
                            else -> CriticalRed
                        }
                    )
                }
            }

            // Severity and Risk Section
            if (result.diagnosis_status == "Diseased") {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        InfoCard(modifier = Modifier.weight(1f), label = "Severity", value = result.severity)
                        InfoCard(modifier = Modifier.weight(1f), label = "Contagion Risk", value = result.contagion_risk)
                    }
                }
            }


            // Detailed sections
            item { ResultSection("DESCRIPTION", description) }
            item { ResultSection("ORGANIC REMEDY", organicRemedy) }
            item { ResultSection("CHEMICAL REMEDY", chemicalRemedy) }

            // Prevention Tips Section
            if (preventionTips.isNotEmpty()) {
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "PREVENTION TIPS",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = MutedGrayText
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                preventionTips.forEach { tip ->
                                    Row(verticalAlignment = Alignment.Top) {
                                        Text("• ", color = DarkBlueText)
                                        Text(tip, style = MaterialTheme.typography.bodyLarge, color = DarkBlueText)
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                }
                            }
                        }
                    }
                }
            }

            // Listen to Summary Button
            if (audioUrl.isNotBlank()) {
                item {
                    Button(
                        onClick = {
                            isPlaying = !isPlaying
                            if (isPlaying) viewModel.playAudio(audioUrl, context) else viewModel.stopAudio()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                    ) {
                        Text(if (isPlaying) "Stop Summary" else "Listen to Summary", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

// Helper Composables for DiagnosisResultScreen
@Composable
fun InfoCard(modifier: Modifier = Modifier, label: String, value: String) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label.uppercase(Locale.ROOT), style = MaterialTheme.typography.labelMedium, color = MutedGrayText)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = when (value.lowercase()) {
                    "high" -> CriticalRed
                    "medium" -> WarningOrange
                    else -> DarkBlueText // Default color
                }
            )
        }
    }
}

@Composable
fun ResultSection(title: String, content: String) {
    if (content != "N/A" && content.isNotBlank()) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MutedGrayText
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Text(
                    text = content,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyLarge,
                    color = DarkBlueText
                )
            }
        }
    }
}