package com.projectkisan.androidapp

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.launch
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.projectkisan.androidapp.ui.theme.*

@Composable
fun DiagnoseScreen(
    viewModel: DiagnosisViewModel,
    onNavigateToResult: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    var bitmap by remember { mutableStateOf<Bitmap?>(null) }

    // This handles navigation when the analysis is successful
    LaunchedEffect(key1 = uiState) {
        if (uiState is DiagnosisUiState.Success) {
            onNavigateToResult()
        }
    }

    // Camera Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { btm: Bitmap? ->
        btm?.let {
            bitmap = it
            viewModel.analyzeImage(it, "en") // Analyze immediately
        }
    }

    // Gallery Launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            bitmap = if (Build.VERSION.SDK_INT < 28) {
                MediaStore.Images.Media.getBitmap(context.contentResolver, it)
            } else {
                val source = ImageDecoder.createSource(context.contentResolver, it)
                ImageDecoder.decodeBitmap(source)
            }
            bitmap?.let { btm ->
                viewModel.analyzeImage(btm, "en") // Analyze immediately
            }
        }
    }

    // Main UI
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(LightGrayUI)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Crop Doctor",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = DarkBlueText
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Get an instant diagnosis for your crop by providing a photo.",
                style = MaterialTheme.typography.bodyLarge,
                color = MutedGrayText,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(32.dp))
        }

        // How-to steps
        item { HowToStep(icon = painterResource(id = R.drawable.ic_step_picture), title = "1. Provide a Picture", description = "Use your camera or gallery.") }
        item { StepDivider() }
        item { HowToStep(icon = painterResource(id = R.drawable.ic_step_diagnose), title = "2. Get Diagnosis", description = "Our AI will analyze the image.") }
        item { StepDivider() }
        item { HowToStep(icon = painterResource(id = R.drawable.ic_step_remedy), title = "3. View Remedy", description = "Receive instant solutions.") }
        item { Spacer(modifier = Modifier.height(32.dp)) }

        // Action Buttons: Upload and Take Photo
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ActionButton(
                    modifier = Modifier.weight(1f),
                    icon = painterResource(id = R.drawable.ic_upload_cloud),
                    text = "Upload Photo",
                    onClick = { galleryLauncher.launch("image/*") }
                )
                ActionButton(
                    modifier = Modifier.weight(1f),
                    icon = painterResource(id = R.drawable.ic_take_photo),
                    text = "Take Photo",
                    onClick = { cameraLauncher.launch() }
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Processing Indicator
        item {
            AnimatedVisibility(visible = uiState is DiagnosisUiState.Processing) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(vertical = 24.dp)
                ) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Analyzing your crop...",
                        style = MaterialTheme.typography.bodyLarge,
                        color = DarkBlueText,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        // Error Message Display
        item {
            val errorState = uiState
            if (errorState is DiagnosisUiState.Error) {
                Text(
                    text = "Analysis Failed: ${errorState.message}",
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        // Recent Diagnoses Section
        item { Spacer(modifier = Modifier.height(24.dp)) }
        item {
            Text(
                text = "Recent Diagnoses",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextColor,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        item {
            RecentDiagnosisCard(
                title = "Tomato Plant: Early Blight (High Confidence)",
                subtitle = "Viewed 2 days ago",
                onClick = { /* TODO: Handle click to view old result */ }
            )
        }
    }
}

// =================================================================
//  HELPER COMPOSABLES FOR DiagnoseScreen
// =================================================================

@Composable
fun HowToStep(icon: Painter, title: String, description: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(painter = icon, contentDescription = title, tint = DarkBlueText, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = title, fontWeight = FontWeight.Bold, color = DarkBlueText, fontSize = 18.sp)
            Text(text = description, color = MutedGrayText, fontSize = 14.sp)
        }
    }
}

@Composable
fun StepDivider() {
    Icon(
        painter = painterResource(id = R.drawable.ic_arrow_downward),
        contentDescription = "Next step",
        modifier = Modifier.padding(vertical = 12.dp),
        tint = MutedGrayText.copy(alpha = 0.5f)
    )
}

@Composable
fun ActionButton(modifier: Modifier = Modifier, icon: Painter, text: String, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.05f)), // Subtle border
        modifier = modifier
            .aspectRatio(1f) // Makes it a square
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(painter = icon, contentDescription = text, tint = TextColor, modifier = Modifier.size(48.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = text, fontWeight = FontWeight.Bold, color = TextColor, fontSize = 16.sp)
        }
    }
}

@Composable
fun RecentDiagnosisCard(title: String, subtitle: String, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.05f)), // Subtle border
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(vertical = 16.dp, horizontal = 20.dp)) {
            val annotatedTitle = buildAnnotatedString {
                val parts = title.split(":", limit = 2)
                if (parts.isNotEmpty()) {
                    withStyle(style = SpanStyle(fontWeight = FontWeight.ExtraBold)) {
                        append(parts[0])
                    }
                    if (parts.size > 1) {
                        append(": ")
                        append(parts[1].trim())
                    }
                }
            }
            Text(
                text = annotatedTitle,
                color = TextColor,
                fontSize = 16.sp,
                lineHeight = 24.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = subtitle, color = MutedGrayText, fontSize = 14.sp)
        }
    }
}