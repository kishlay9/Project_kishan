package com.projectkisan.androidapp

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.projectkisan.androidapp.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosisResultScreen(
    viewModel: DiagnosisViewModel,
    result: DiagnosisResult,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val isPlaying by viewModel.isPlaying.collectAsState()

    LaunchedEffect(result.audio_remedy_url) {
        viewModel.initializePlayer(context, result.audio_remedy_url ?: "")
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Diagnosis Result") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(painterResource(id = R.drawable.ic_arrow_back), contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    navigationIconContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
                .padding(16.dp)
        ) {
            item {
                Header(
                    title = result.disease_name_english.takeIf { it != "N/A" } ?: result.diagnosis_status,
                    subtitle = "(${result.plant_type})",
                    confidence = result.confidence_score.toFloat()
                )
                Divider(modifier = Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.surfaceVariant)
            }
            item { InfoCards(severity = result.severity, risk = result.contagion_risk) }
            item { InfoSection(label = "DESCRIPTION", englishText = result.description_english, kannadaText = result.description_kannada) }
            item { InfoSection(label = "ORGANIC REMEDY", englishText = result.organic_remedy_english, kannadaText = result.organic_remedy_kannada) }
            item { InfoSection(label = "CHEMICAL REMEDY", englishText = result.chemical_remedy_english, kannadaText = result.chemical_remedy_kannada) }
            item { PreventionTips(tips = result.prevention_tips_english) }
            item {
                if (!result.audio_remedy_url.isNullOrBlank()) {
                    ListenButton(
                        isPlaying = isPlaying,
                        onClick = { viewModel.togglePlayback() }
                    )
                }
            }
        }
    }
}

// --- Reusable UI Components for the Result Screen ---

@Composable
fun Header(title: String, subtitle: String, confidence: Float) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        ConfidenceBadge(score = confidence)
    }
}

@Composable
fun ConfidenceBadge(score: Float) {
    val confidencePercent = (score * 100).toInt()
    val backgroundColor = when {
        confidencePercent > 80 -> GreenPrimary.copy(alpha = 0.1f)
        confidencePercent > 60 -> OrangeAccent.copy(alpha = 0.1f)
        else -> MaterialTheme.colorScheme.surfaceVariant
    }
    val textColor = when {
        confidencePercent > 80 -> GreenPrimary
        confidencePercent > 60 -> OrangeAccent
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = "$confidencePercent% Confident",
            color = textColor,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun InfoCards(severity: String, risk: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        InfoCard(label = "Severity", value = severity, modifier = Modifier.weight(1f))
        InfoCard(label = "Contagion Risk", value = risk, modifier = Modifier.weight(1f))
    }
}

@Composable
fun InfoCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun InfoSection(label: String, englishText: String, kannadaText: String?) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 24.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        if (englishText != "N/A") {
            TextBubble(text = englishText, isKannada = false)
        }
        if (!kannadaText.isNullOrBlank() && kannadaText != "N/A") {
            Spacer(modifier = Modifier.height(8.dp))
            TextBubble(text = kannadaText, isKannada = true)
        }
    }
}

@Composable
fun TextBubble(text: String, isKannada: Boolean) {
    val backgroundColor = if (isKannada) MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp) else MaterialTheme.colorScheme.surface
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(16.dp),
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
fun PreventionTips(tips: List<String>?) {
    if (!tips.isNullOrEmpty()) {
        Column(modifier = Modifier.fillMaxWidth().padding(top = 24.dp)) {
            Text(
                text = "PREVENTION TIPS",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    tips.forEach { tip ->
                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                            Text("• ", color = MaterialTheme.colorScheme.onSurface)
                            Text(text = tip, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ListenButton(isPlaying: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp)
            .height(56.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
    ) {
        Text(
            text = if (isPlaying) "Pause Summary" else "Listen to Summary",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
    }
}