package com.projectkisan.androidapp

import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.GeoPoint
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.projectkisan.androidapp.ui.cropData
import com.projectkisan.androidapp.ui.indianStatesAndUTs
import com.projectkisan.androidapp.ui.theme.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

// Data structure to hold a parsed weekly plan item
data class WeeklyPlanItem(
    val weekNumber: Int,
    val title: String,
    val description: String
)

// ▼▼▼ FIX: Removed unused 'navController' parameter ▼▼▼
@Composable
fun PlanScreen() {
    var selectedCrop by remember { mutableStateOf<String?>(null) }
    var selectedVariety by remember { mutableStateOf<String?>(null) }
    var sowingDate by remember { mutableStateOf("") }
    var selectedLocation by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var masterPlan by remember { mutableStateOf<List<WeeklyPlanItem>>(emptyList()) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val coroutineScope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(LightGrayBackground)
            .padding(16.dp)
    ) {
        item {
            Text(
                text = "Yield Maximizer",
                style = MaterialTheme.typography.headlineMedium,
                color = TextColor,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Enter your crop details to generate a customized growth and protection plan.",
                style = MaterialTheme.typography.bodyLarge,
                color = TextColor.copy(alpha = 0.7f)
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        item {
            GeneratePlanCard(
                selectedCrop = selectedCrop,
                onCropChange = {
                    selectedCrop = it
                    selectedVariety = null
                },
                selectedVariety = selectedVariety,
                onVarietyChange = { selectedVariety = it },
                sowingDate = sowingDate,
                onDateChange = { sowingDate = it },
                selectedLocation = selectedLocation,
                onLocationChange = { selectedLocation = it },
                onGenerateClick = {
                    coroutineScope.launch {
                        isLoading = true
                        masterPlan = emptyList()
                        errorMessage = null

                        try {
                            val plan = generateAndFetchMasterPlan(
                                crop = selectedCrop!!,
                                variety = selectedVariety!!,
                                sowingDate = sowingDate,
                                location = selectedLocation!!
                            )
                            masterPlan = plan
                        } catch (e: Exception) {
                            Log.e("PlanScreen", "Plan generation failed", e)
                            errorMessage = e.message ?: "An unknown error occurred."
                        } finally {
                            isLoading = false
                        }
                    }
                }
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        item {
            if (isLoading) {
                Box(modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryGreen)
                }
            } else if (errorMessage != null) {
                Text(
                    text = "Error: $errorMessage",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        item {
            AnimatedVisibility(visible = masterPlan.isNotEmpty() && !isLoading) {
                MasterPlanSection(plan = masterPlan)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeneratePlanCard(
    selectedCrop: String?, onCropChange: (String) -> Unit,
    selectedVariety: String?, onVarietyChange: (String) -> Unit,
    sowingDate: String, onDateChange: (String) -> Unit,
    selectedLocation: String?, onLocationChange: (String) -> Unit,
    onGenerateClick: () -> Unit
) {
    var isCropMenuExpanded by remember { mutableStateOf(false) }
    var isVarietyMenuExpanded by remember { mutableStateOf(false) }
    var isLocationMenuExpanded by remember { mutableStateOf(false) }
    var showDatePicker by remember { mutableStateOf(false) }

    val crops = cropData.keys.sorted()
    val varieties = if (selectedCrop != null) cropData[selectedCrop] ?: emptyList() else emptyList()
    val locations = indianStatesAndUTs

    val isFormComplete = selectedCrop != null && selectedVariety != null && sowingDate.isNotBlank() && selectedLocation != null

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                "Generate Your Plan",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
            Spacer(modifier = Modifier.height(24.dp))

            Text("Your Crop", style = MaterialTheme.typography.bodySmall, color = TextColor.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.height(8.dp))
            ExposedDropdownMenuBox(expanded = isCropMenuExpanded, onExpandedChange = { isCropMenuExpanded = it }) {
                OutlinedTextField(
                    value = selectedCrop ?: "",
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Select Crop") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isCropMenuExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
                ExposedDropdownMenu(expanded = isCropMenuExpanded, onDismissRequest = { isCropMenuExpanded = false }) {
                    crops.forEach { crop ->
                        DropdownMenuItem(
                            text = { Text(crop) },
                            onClick = {
                                onCropChange(crop)
                                isCropMenuExpanded = false
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            Text("Variety", style = MaterialTheme.typography.bodySmall, color = TextColor.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.height(8.dp))
            ExposedDropdownMenuBox(expanded = isVarietyMenuExpanded, onExpandedChange = { isVarietyMenuExpanded = !isVarietyMenuExpanded }) {
                OutlinedTextField(
                    value = selectedVariety ?: "",
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Select Variety") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isVarietyMenuExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    enabled = selectedCrop != null
                )
                ExposedDropdownMenu(
                    expanded = isVarietyMenuExpanded && varieties.isNotEmpty(),
                    onDismissRequest = { isVarietyMenuExpanded = false }
                ) {
                    varieties.forEach { variety ->
                        DropdownMenuItem(
                            text = { Text(variety) },
                            onClick = {
                                onVarietyChange(variety)
                                isVarietyMenuExpanded = false
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            Text("Sowing Date", style = MaterialTheme.typography.bodySmall, color = TextColor.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = sowingDate,
                onValueChange = {},
                readOnly = true,
                placeholder = { Text("dd/mm/yyyy") },
                trailingIcon = {
                    IconButton(onClick = { showDatePicker = true }) {
                        Icon(painter = painterResource(id = R.drawable.ic_calendar), contentDescription = "Select Date", tint = TextColor.copy(alpha = 0.7f))
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))

            Text("Your Location (State/UT)", style = MaterialTheme.typography.bodySmall, color = TextColor.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.height(8.dp))
            ExposedDropdownMenuBox(expanded = isLocationMenuExpanded, onExpandedChange = { isLocationMenuExpanded = it }) {
                OutlinedTextField(
                    value = selectedLocation ?: "",
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Select Location") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isLocationMenuExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
                ExposedDropdownMenu(expanded = isLocationMenuExpanded, onDismissRequest = { isLocationMenuExpanded = false }) {
                    locations.forEach { location ->
                        DropdownMenuItem(
                            text = { Text(location) },
                            onClick = {
                                onLocationChange(location)
                                isLocationMenuExpanded = false
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onGenerateClick,
                enabled = isFormComplete,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text("Generate Plan", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showDatePicker) {
        DatePickerComponent(
            onDateSelected = { onDateChange(it) },
            onDismiss = { showDatePicker = false }
        )
    }
}

@Composable
fun MasterPlanSection(plan: List<WeeklyPlanItem>) {
    // The container for the weekly plan. We add a top green border here.
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // A simple Box to draw the green line at the top of the section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .background(PrimaryGreen)
        )

        // The main content area with a white background
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    color = CardBackground,
                    shape = RoundedCornerShape(bottomStart = 12.dp, bottomEnd = 12.dp)
                )
                .padding(20.dp)
        ) {
            Text(
                text = "Your Weekly Master Plan",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "A strategic overview for your crop's entire lifecycle, from seed to harvest.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted
            )
            Spacer(modifier = Modifier.height(20.dp))

            // The list of weekly plan cards
            plan.forEach { weekPlan ->
                WeekPlanCard(item = weekPlan)
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}
@Composable
fun WeekPlanCard(item: WeeklyPlanItem) {
    val cornerRadius = 16.dp
    val barThickness = 6.dp

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(cornerRadius))
    ) {
        // Layer 1: The Blue Background Bar
        Box(
            modifier = Modifier
                .width(barThickness)
                .fillMaxHeight()
                // ▼▼▼ THIS IS THE FIX ▼▼▼
                // Using a named argument 'color =' resolves the ambiguity.
                .background(color = PlanBorderBlue)
                .align(Alignment.CenterStart)
        )

        // Layer 2: The Content Column
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(color = PlanCardBackground) // Also being explicit here for consistency
                .padding(start = barThickness)
                .padding(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Week ${item.weekNumber}: ${item.title}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = item.description,
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted,
                lineHeight = 22.sp
            )
        }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DatePickerComponent(
    onDateSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val datePickerState = rememberDatePickerState()
    // ▼▼▼ FIX: The state object is now wrapped in `remember` ▼▼▼
    val confirmEnabled by remember { derivedStateOf { datePickerState.selectedDateMillis != null } }

    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    datePickerState.selectedDateMillis?.let {
                        val sdf = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
                        onDateSelected(sdf.format(Date(it)))
                    }
                    onDismiss()
                },
                enabled = confirmEnabled // use the remembered state
            ) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    ) {
        DatePicker(state = datePickerState)
    }
}


// --- Backend Interaction Logic ---

private fun getFunctionsInstance(): FirebaseFunctions = Firebase.functions("asia-south1")
private val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

private val locationCoordinates = mapOf(
    "Delhi" to GeoPoint(28.7041, 77.1025),
    "Haryana" to GeoPoint(29.0588, 76.0856), // Using general state coordinates
    "Punjab" to GeoPoint(31.1471, 75.3412),
    "Maharashtra" to GeoPoint(19.7515, 75.7139)
    // You can expand this map or use a geocoding API for a more dynamic solution
)

private suspend fun generateAndFetchMasterPlan(
    crop: String,
    variety: String,
    sowingDate: String,
    location: String,
): List<WeeklyPlanItem> {
    val farmId = "farm_${UUID.randomUUID()}"
    val locationGeoPoint = locationCoordinates[location]
        ?: GeoPoint(20.5937, 78.9629) // Default to India's center if not found

    val data = hashMapOf(
        "farmId" to farmId,
        "crop" to crop,
        "variety" to variety,
        "sowingDate" to sowingDate,
        "location" to hashMapOf(
            "latitude" to locationGeoPoint.latitude,
            "longitude" to locationGeoPoint.longitude
        )
    )

    getFunctionsInstance().getHttpsCallable("generateMasterPlan").call(data).await()
    val documentSnapshot = firestore.collection("userFarms").document(farmId).get().await()

    if (documentSnapshot.exists()) {
        // ▼▼▼ FIX: Added @Suppress annotation to dismiss the harmless warning ▼▼▼
        @Suppress("UNCHECKED_CAST")
        val activePlanData = documentSnapshot.get("activePlan") as? Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val masterPlanList = activePlanData?.get("masterPlan") as? List<Map<String, Any>>

        if (masterPlanList != null) {
            return masterPlanList.mapNotNull { planMap ->
                val activities = planMap["activities"] as? String ?: ""
                val weekNumber = planMap["weekNumber"] as? Long ?: 0
                val (title, description) = parseWeekActivity(activities)
                WeeklyPlanItem(
                    weekNumber = weekNumber.toInt(),
                    title = title,
                    description = description
                )
            }
        } else {
            throw Exception("Master plan data is missing or in the wrong format in the database.")
        }
    } else {
        throw Exception("Could not find the generated plan in the database. It might still be processing.")
    }
}

private fun parseWeekActivity(activity: String): Pair<String, String> {
    val parts = activity.split(":", limit = 2)
    return if (parts.size == 2) {
        parts[0].trim() to parts[1].trim()
    } else {
        val firstSentenceEnd = activity.indexOf('.')
        if (firstSentenceEnd != -1) {
            activity.substring(0, firstSentenceEnd).trim() to activity.substring(firstSentenceEnd + 1).trim()
        } else {
            "Activity" to activity
        }
    }
}