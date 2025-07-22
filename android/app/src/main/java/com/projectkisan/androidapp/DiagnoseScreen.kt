package com.projectkisan.androidapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.ktx.storage
import com.projectkisan.androidapp.ui.theme.*
import java.io.File
import java.util.*

@Composable
fun DiagnoseScreen(viewModel: DiagnosisViewModel, onNavigateToResult: () -> Unit) {
    val context = LocalContext.current
    val uiState = viewModel.uiState
    var cameraImageUri by rememberSaveable { mutableStateOf<Uri?>(null) }

    LaunchedEffect(uiState) {
        if (uiState is DiagnosisUiState.Success) {
            onNavigateToResult()
            viewModel.resetState()
        }
    }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            handleImageUpload(uri = it, viewModel = viewModel)
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            cameraImageUri?.let { handleImageUpload(uri = it, viewModel = viewModel) }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            val uri = createImageUri(context)
            cameraImageUri = uri
            cameraLauncher.launch(uri)
        } else {
            Toast.makeText(context, "Camera permission is required.", Toast.LENGTH_LONG).show()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "Crop Doctor", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.secondary, fontWeight = FontWeight.ExtraBold, modifier = Modifier.fillMaxWidth())
                Text(text = "Get an instant diagnosis for your crop by providing a photo.", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth().padding(top = 4.dp, bottom = 24.dp))
            }
            item {
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_image, title = "1. Provide a Picture", subtitle = "Use your camera or upload from your gallery.")
                FlowArrow()
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_analysis, title = "2. Get Diagnosis", subtitle = "Our AI will analyze the image for diseases.")
                FlowArrow()
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_remedy, title = "3. View Remedy", subtitle = "Receive instant organic and chemical solutions.")
            }
            item {
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    ActionButton(iconRes = R.drawable.ic_action_upload, text = "Upload Photo", modifier = Modifier.weight(1f)) { imagePickerLauncher.launch("image/*") }
                    ActionButton(iconRes = R.drawable.ic_action_camera, text = "Take Photo", modifier = Modifier.weight(1f)) {
                        when (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)) {
                            PackageManager.PERMISSION_GRANTED -> { val uri = createImageUri(context); cameraImageUri = uri; cameraLauncher.launch(uri) }
                            else -> permissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    }
                }
            }
            item {
                Text(text = "Recent Diagnoses", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 8.dp))
                RecentDiagnosisCard()
                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        if (uiState is DiagnosisUiState.Loading) {
            Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.5f)), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Color.White)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(uiState.message, color = Color.White)
                }
            }
        }

        if (uiState is DiagnosisUiState.Error) {
            LaunchedEffect(uiState) {
                Toast.makeText(context, uiState.message, Toast.LENGTH_LONG).show()
                viewModel.resetState()
            }
        }
    }
}

private fun handleImageUpload(uri: Uri, viewModel: DiagnosisViewModel) {
    val storage = Firebase.storage
    val uniqueFileName = "image_${Date().time}_android.jpg"
    val storageRef = storage.reference.child("uploads/$uniqueFileName")

    viewModel.setLoading("Uploading image...")

    storageRef.putFile(uri)
        .addOnProgressListener { taskSnapshot ->
            val progress = (100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount
            viewModel.setLoading("Uploading... ${progress.toInt()}%")
        }
        .addOnSuccessListener {
            viewModel.setLoading("Analyzing image with AI...")
            viewModel.startListening(uniqueFileName)
        }
        .addOnFailureListener { exception ->
            Log.e("DiagnoseScreen", "Upload failed", exception)
            viewModel.setError("Upload failed: ${exception.message}")
        }
}

private fun createImageUri(context: Context): Uri {
    val imageFile = File(context.cacheDir, "images/${UUID.randomUUID()}.jpg")
    imageFile.parentFile?.mkdirs()
    return FileProvider.getUriForFile(context, "com.projectkisan.androidapp.fileprovider", imageFile)
}

@Composable
fun DiagnosisFlowStep(iconRes: Int, title: String, subtitle: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth(0.9f).shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(painterResource(id = iconRes), contentDescription = null, modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun FlowArrow() {
    Text("→", fontSize = 24.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(vertical = 8.dp))
}

@Composable
fun ActionButton(iconRes: Int, text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(120.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(painter = painterResource(id = iconRes), contentDescription = text, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.onSurface)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun RecentDiagnosisCard() {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp))
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(modifier = Modifier.width(6.dp).height(70.dp).background(OrangeAccent))
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Tomato Plant: Early Blight (High Confidence)", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                Text("Viewed 2 days ago", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}