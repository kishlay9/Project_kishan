package com.projectkisan.androidapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.ktx.storage
import com.projectkisan.androidapp.ui.theme.*
import java.io.File
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnoseScreen() {
    val context = LocalContext.current
    var diagnosisResult by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var loadingMessage by remember { mutableStateOf("") }
    var cameraImageUri by rememberSaveable { mutableStateOf<Uri?>(null) }

    // Launcher for picking an image from the gallery
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            startDiagnosis(it, onLoading = { l, m -> isLoading = l; loadingMessage = m }, onResult = { r -> diagnosisResult = r })
        }
    }

    // Launcher for taking a photo with the camera
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            cameraImageUri?.let {
                startDiagnosis(it, onLoading = { l, m -> isLoading = l; loadingMessage = m }, onResult = { r -> diagnosisResult = r })
            }
        }
    }

    // Launcher for asking for Camera Permission
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // Permission Granted: Launch the camera
            val uri = createImageUri(context)
            cameraImageUri = uri
            cameraLauncher.launch(uri)
        } else {
            // Permission Denied: Show a message to the user
            Toast.makeText(context, "Camera permission is required to take photos.", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = { TopBar() }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Crop Doctor",
                    style = MaterialTheme.typography.headlineLarge,
                    color = BlueSecondary,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = "Get an instant diagnosis for your crop by providing a photo.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = TextMutedLight,
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp, bottom = 24.dp)
                )
            }

            // Diagnosis Flow Diagram
            item {
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_image, title = "1. Provide a Picture", subtitle = "Use your camera or upload from your gallery.")
                FlowArrow()
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_analysis, title = "2. Get Diagnosis", subtitle = "Our AI will analyze the image for diseases.")
                FlowArrow()
                DiagnosisFlowStep(iconRes = R.drawable.ic_flow_remedy, title = "3. View Remedy", subtitle = "Receive instant organic and chemical solutions.")
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    ActionButton(iconRes = R.drawable.ic_action_upload, text = "Upload Photo", modifier = Modifier.weight(1f)) {
                        imagePickerLauncher.launch("image/*")
                    }
                    ActionButton(iconRes = R.drawable.ic_action_camera, text = "Take Photo", modifier = Modifier.weight(1f)) {
                        when (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)) {
                            PackageManager.PERMISSION_GRANTED -> {
                                val uri = createImageUri(context)
                                cameraImageUri = uri
                                cameraLauncher.launch(uri)
                            }
                            else -> {
                                permissionLauncher.launch(Manifest.permission.CAMERA)
                            }
                        }
                    }
                }
            }

            // Dynamic Result Display
            item {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.padding(vertical = 24.dp))
                    Text(loadingMessage, modifier = Modifier.padding(top = 8.dp))
                }
                if (diagnosisResult != null && !isLoading) {
                    ResultCard(resultText = diagnosisResult!!)
                }
            }

            // Recent Diagnoses Section
            item {
                Text(
                    text = "Recent Diagnoses",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 8.dp)
                )
                RecentDiagnosisCard()
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

// --- Helper Functions ---

private fun startDiagnosis(uri: Uri, onLoading: (Boolean, String) -> Unit, onResult: (String?) -> Unit) {
    onResult(null) // Clear previous result
    handleImageUpload(
        imageUri = uri,
        onLoading = onLoading,
        onResult = onResult
    )
}

private fun createImageUri(context: Context): Uri {
    val imageFile = File(context.cacheDir, "images/${UUID.randomUUID()}.jpg")
    imageFile.parentFile?.mkdirs()
    return FileProvider.getUriForFile(
        context,
        "com.projectkisan.androidapp.fileprovider", // MUST match the authorities in your manifest
        imageFile
    )
}

// --- Reusable UI Components ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopBar() {
    CenterAlignedTopAppBar(
        modifier = Modifier.padding(vertical = 8.dp),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painter = painterResource(id = R.drawable.ic_logo),
                    contentDescription = "Project Kisan Logo",
                    modifier = Modifier.size(32.dp).clip(CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Project Kisan", fontWeight = FontWeight.Bold, color = GreenPrimary)
            }
        },
        actions = {
            IconButton(onClick = { /*TODO*/ }) { Icon(painterResource(id = R.drawable.ic_top_home), contentDescription = "Home", tint = TextPrimaryLight) }
            IconButton(onClick = { /*TODO*/ }) { Icon(painterResource(id = R.drawable.ic_top_contact), contentDescription = "Contact", tint = TextPrimaryLight) }
            IconButton(onClick = { /*TODO*/ }) { Icon(painterResource(id = R.drawable.ic_top_sun), contentDescription = "Theme", tint = TextPrimaryLight) }
            IconButton(onClick = { /*TODO*/ }) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_top_profile),
                    contentDescription = "Profile",
                    modifier = Modifier
                        .background(GreenPrimary, CircleShape)
                        .padding(4.dp),
                    tint = Color.White
                )
            }
        },
        colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
            containerColor = Color.Transparent
        )
    )
}

@Composable
fun DiagnosisFlowStep(iconRes: Int, title: String, subtitle: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth(0.9f)
            .shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(painterResource(id = iconRes), contentDescription = null, modifier = Modifier.size(32.dp), tint = TextMutedLight)
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium, color = TextPrimaryLight)
            Text(subtitle, color = TextMutedLight, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun FlowArrow() {
    Text("→", fontSize = 24.sp, color = TextMutedLight, modifier = Modifier.padding(vertical = 8.dp))
}

@Composable
fun ActionButton(iconRes: Int, text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(120.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = ButtonGreenLight),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = text,
                modifier = Modifier.size(48.dp),
                tint = TextPrimaryLight
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(text, color = TextPrimaryLight, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun ResultCard(resultText: String) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp)
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Diagnosis Result", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(resultText, style = MaterialTheme.typography.bodyLarge, color = TextMutedLight)
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
            Box(
                modifier = Modifier
                    .width(6.dp)
                    .height(70.dp) // Give it a fixed height to match text
                    .background(OrangeAccent)
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Tomato Plant: Early Blight (High Confidence)", fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                Text("Viewed 2 days ago", style = MaterialTheme.typography.bodySmall, color = TextMutedLight)
            }
        }
    }
}

// --- Backend Logic ---

private fun handleImageUpload(
    imageUri: Uri,
    onLoading: (Boolean, String) -> Unit,
    onResult: (String?) -> Unit
) {
    val storage = Firebase.storage
    val firestore = Firebase.firestore
    var firestoreListener: ListenerRegistration? = null

    onLoading(true, "Uploading image...")

    val uniqueFileName = "image_${Date().time}_android.jpg"
    val storageRef = storage.reference.child("uploads/$uniqueFileName")

    storageRef.putFile(imageUri)
        .addOnProgressListener { taskSnapshot ->
            val progress = (100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount
            onLoading(true, "Uploading... ${progress.toInt()}%")
        }
        .addOnSuccessListener {
            onLoading(true, "Analyzing image with AI...")

            val docRef = firestore.collection("diagnoses").document(uniqueFileName)
            firestoreListener = docRef.addSnapshotListener { snapshot: DocumentSnapshot?, e: FirebaseFirestoreException? ->
                if (e != null) {
                    onLoading(false, "")
                    onResult("Error fetching result: ${e.message}")
                    Log.w("DiagnoseScreen", "Listen failed.", e)
                    firestoreListener?.remove()
                    return@addSnapshotListener
                }

                if (snapshot != null && snapshot.exists()) {
                    onLoading(false, "")
                    val data = snapshot.data
                    val resultString = formatResult(data)
                    onResult(resultString)
                    firestoreListener?.remove() // Stop listening after getting the result
                }
            }
        }
        .addOnFailureListener { exception ->
            onLoading(false, "")
            onResult("Upload failed: ${exception.message}")
            Log.e("DiagnoseScreen", "Upload failed", exception)
        }
}

private fun formatResult(data: Map<String, Any>?): String {
    if (data == null) return "Failed to parse diagnosis result."

    val diseaseName = data["disease_name_english"] as? String ?: "N/A"
    val plantType = data["plant_type"] as? String ?: "N/A"
    val description = data["description_english"] as? String ?: "No description provided."

    return """
        Plant: $plantType
        Disease: $diseaseName
        
        Description: $description
    """.trimIndent()
}