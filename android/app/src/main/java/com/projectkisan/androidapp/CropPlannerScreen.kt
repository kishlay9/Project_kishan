package com.projectkisan.androidapp

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.projectkisan.androidapp.ui.theme.*
import kotlinx.coroutines.delay

// --- 1. DATA MODELS ---
data class CropRecommendation(
    val cropName: String = "",
    val estimatedProfitInr: Int = 0,
    val estimatedCostInr: Int = 0,
    val pros: List<String> = emptyList(),
    val cons: List<String> = emptyList()
)

// --- 2. MAIN SCREEN COMPOSABLE ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropPlannerScreen(navController: NavController) { // Changed to NavController for consistency
    var selectedState by remember { mutableStateOf("") }
    var selectedWater by remember { mutableStateOf("") }
    var landSize by remember { mutableStateOf("") }
    var budget by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var recommendations by remember { mutableStateOf<List<CropRecommendation>?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Crop Planner", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                PlannerInputCard(
                    selectedState = selectedState, onStateChange = { selectedState = it },
                    selectedWater = selectedWater, onWaterChange = { selectedWater = it },
                    landSize = landSize, onLandSizeChange = { landSize = it },
                    budget = budget, onBudgetChange = { budget = it },
                    onPlanCropsClick = {
                        isLoading = true
                        recommendations = null
                    }
                )
            }
            item {
                LaunchedEffect(isLoading) {
                    if (isLoading) {
                        delay(2000) // Simulate network call
                        recommendations = getHardcodedRecommendations()
                        isLoading = false
                    }
                }

                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.padding(top = 32.dp))
                }

                AnimatedVisibility(visible = !recommendations.isNullOrEmpty()) {
                    Column {
                        Text(
                            "Top 3 Recommendations",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 32.dp, bottom = 16.dp)
                        )
                        recommendations?.forEach { rec ->
                            RecommendationCard(recommendation = rec)
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }
                }
            }
        }
    }
}

// --- 3. UI SUB-COMPONENTS ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlannerInputCard(
    selectedState: String, onStateChange: (String) -> Unit,
    selectedWater: String, onWaterChange: (String) -> Unit,
    landSize: String, onLandSizeChange: (String) -> Unit,
    budget: String, onBudgetChange: (String) -> Unit,
    onPlanCropsClick: () -> Unit
) {
    var isStateExpanded by remember { mutableStateOf(false) }
    var isWaterExpanded by remember { mutableStateOf(false) }
    val indianStatesAndUTs = listOf(
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
        "Kerala", "Ladakh", "Lakshadweeep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    )
    val waterLevels = listOf("Low (Rain-fed)", "Average (Canal/Borewell)", "High (Abundant)")

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text("AI Crop Planner", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            Text("Get recommendations based on your location, water, and budget.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(24.dp))

            Text("Location (State/UT)", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            ExposedDropdownMenuBox(expanded = isStateExpanded, onExpandedChange = { isStateExpanded = it }) {
                OutlinedTextField(value = selectedState, onValueChange = {}, readOnly = true, placeholder = { Text("Search & Select your State...") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isStateExpanded) }, modifier = Modifier.menuAnchor().fillMaxWidth())
                ExposedDropdownMenu(expanded = isStateExpanded, onDismissRequest = { isStateExpanded = false }) {
                    indianStatesAndUTs.forEach { state -> DropdownMenuItem(text = { Text(state) }, onClick = { onStateChange(state); isStateExpanded = false }) }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            Text("Water Access", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            ExposedDropdownMenuBox(expanded = isWaterExpanded, onExpandedChange = { isWaterExpanded = it }) {
                OutlinedTextField(value = selectedWater, onValueChange = {}, readOnly = true, placeholder = { Text("Select Water Availability") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isWaterExpanded) }, modifier = Modifier.menuAnchor().fillMaxWidth())
                ExposedDropdownMenu(expanded = isWaterExpanded, onDismissRequest = { isWaterExpanded = false }) {
                    waterLevels.forEach { level -> DropdownMenuItem(text = { Text(level) }, onClick = { onWaterChange(level); isWaterExpanded = false }) }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(value = landSize, onValueChange = onLandSizeChange, label = { Text("Land Size (in acres)") }, placeholder = { Text("e.g., 5") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(value = budget, onValueChange = onBudgetChange, label = { Text("Budget (in ₹)") }, placeholder = { Text("e.g., 50000") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onPlanCropsClick,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Plan Best Crops", fontSize = 16.sp)
            }
        }
    }
}

@Composable
fun RecommendationCard(recommendation: CropRecommendation) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.shadow(elevation = 1.dp, shape = RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        // ▼▼▼ FIX: Use 'TextColor' from your theme ▼▼▼
                        color = TextColor,
                        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
                    )
                    .padding(16.dp)
            ) {
                Text(
                    recommendation.cropName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Column(
                modifier = Modifier
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    // ▼▼▼ FIX: Use 'PrimaryGreen' from your theme ▼▼▼
                    MetricItem("Est. Profit / acre", "₹${recommendation.estimatedProfitInr.toLocaleString()}", PrimaryGreen, Modifier.weight(1f))
                    MetricItem("Est. Cost / acre", "₹${recommendation.estimatedCostInr.toLocaleString()}", MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
                }
                HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    // ▼▼▼ FIX: Use 'PrimaryGreen' from your theme ▼▼▼
                    ProsConsList("Pros", recommendation.pros, R.drawable.ic_arrow_up, PrimaryGreen, Modifier.weight(1f))
                    ProsConsList("Cons", recommendation.cons, R.drawable.ic_arrow_down, Color.Red, Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
fun MetricItem(label: String, value: String, valueColor: Color, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = valueColor)
    }
}

@Composable
fun ProsConsList(title: String, items: List<String>, iconRes: Int, iconColor: Color, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(painterResource(id = iconRes), contentDescription = title, tint = iconColor, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall, color = iconColor)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            items.forEach {
                Text(
                    it,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

// --- 4. HARDCODED DATA FOR PREVIEW ---
fun getHardcodedRecommendations(): List<CropRecommendation> {
    return listOf(
        CropRecommendation(
            cropName = "Hybrid Tomato",
            estimatedProfitInr = 50000,
            estimatedCostInr = 8500,
            pros = listOf("High market demand in your area", "Good profit margin", "Multiple harvests possible"),
            cons = listOf("Needs consistent watering", "Risk of fruit borer pests", "Sensitive to extreme weather")
        ),
        CropRecommendation(
            cropName = "Drought-Tolerant Millet",
            estimatedProfitInr = 22000,
            estimatedCostInr = 4000,
            pros = listOf("Excellent for low water access", "Low input costs", "Improves soil health"),
            cons = listOf("Lower market price than cash crops", "Risk of bird damage")
        ),
        CropRecommendation(
            cropName = "Quick-Turnaround Spinach",
            estimatedProfitInr = 15000,
            estimatedCostInr = 3500,
            pros = listOf("Very short growth cycle (40-50 days)", "Can be planted between main crops", "Consistent local demand"),
            cons = listOf("Highly perishable, needs quick sale", "Sensitive to high temperatures")
        )
    )
}

fun Int.toLocaleString(): String {
    return "%,d".format(this)
}