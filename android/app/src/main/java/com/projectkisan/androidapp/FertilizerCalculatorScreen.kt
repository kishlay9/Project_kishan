package com.projectkisan.androidapp

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.projectkisan.androidapp.ui.theme.*

// --- 1. DATA MODELS AND DATABASE ---

data class CropInfo(
    val name: String,
    val iconResId: Int,
    val inputType: String, // 'plot' or 'trees'
    val nutrientsPerAcre: Nutrients? = null,
    val nutrientsPerTree: Nutrients? = null
)

data class Nutrients(val n: Double, val p: Double, val k: Double)

data class FertilizerResult(
    val dapKg: Double = 0.0, val mopKg: Double = 0.0, val ureaKg: Double = 0.0,
    val tspKg: Double = 0.0,
    val dapBags: Double = 0.0, val mopBags: Double = 0.0, val ureaBags: Double = 0.0,
    val tspBags: Double = 0.0
)

// Hardcoded database using correct drawable resource IDs
val fertilizerCropData = mapOf(
    "cabbage" to CropInfo("Cabbage", R.drawable.cabbage, "plot", nutrientsPerAcre = Nutrients(80.0, 40.0, 40.0)),
    "tomato" to CropInfo("Tomato", R.drawable.tomatoes, "plot", nutrientsPerAcre = Nutrients(100.0, 60.0, 60.0)),
    "apple" to CropInfo("Apple", R.drawable.apple, "trees", nutrientsPerTree = Nutrients(0.6, 0.3, 0.7)),
    "banana" to CropInfo("Banana", R.drawable.banana, "plot", nutrientsPerAcre = Nutrients(200.0, 60.0, 250.0)),
    "brinjal" to CropInfo("Brinjal", R.drawable.brinjal, "plot", nutrientsPerAcre = Nutrients(100.0, 50.0, 50.0)),
    "bean" to CropInfo("Bean", R.drawable.bean, "plot", nutrientsPerAcre = Nutrients(20.0, 60.0, 40.0)),
    "chickpea" to CropInfo("Chickpea", R.drawable.chickpea, "plot", nutrientsPerAcre = Nutrients(20.0, 60.0, 20.0)),
    "cotton" to CropInfo("Cotton", R.drawable.cotton, "plot", nutrientsPerAcre = Nutrients(120.0, 60.0, 60.0)),
    "cucumber" to CropInfo("Cucumber", R.drawable.cucumber, "plot", nutrientsPerAcre = Nutrients(90.0, 50.0, 100.0)),
    "maize" to CropInfo("Maize", R.drawable.corn, "plot", nutrientsPerAcre = Nutrients(120.0, 60.0, 40.0)),
    "mango" to CropInfo("Mango", R.drawable.mango, "trees", nutrientsPerTree = Nutrients(0.5, 0.2, 0.5)),
    "onion" to CropInfo("Onion", R.drawable.onion, "plot", nutrientsPerAcre = Nutrients(100.0, 50.0, 80.0)),
    "potato" to CropInfo("Potato", R.drawable.potato, "plot", nutrientsPerAcre = Nutrients(150.0, 80.0, 100.0)),
    "rice" to CropInfo("Rice", R.drawable.rice, "plot", nutrientsPerAcre = Nutrients(100.0, 50.0, 50.0)),
    "sugarcane" to CropInfo("Sugarcane", R.drawable.sugarcane, "plot", nutrientsPerAcre = Nutrients(250.0, 80.0, 150.0)),
    "wheat" to CropInfo("Wheat", R.drawable.wheat, "plot", nutrientsPerAcre = Nutrients(120.0, 60.0, 40.0))
)

// --- 2. MAIN SCREEN COMPOSABLE ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FertilizerCalculatorScreen(onNavigateBack: () -> Unit) {
    var selectedCropKey by remember { mutableStateOf("cabbage") }
    var selectedUnit by remember { mutableStateOf("Acre") }
    var plotSize by remember { mutableStateOf(1.0f) }
    var treeCount by remember { mutableStateOf(100) }
    var showCropDialog by remember { mutableStateOf(false) }
    var calculationResult by remember { mutableStateOf<Pair<FertilizerResult, FertilizerResult>?>(null) }

    val selectedCrop = fertilizerCropData[selectedCropKey]!!
    val conversionFactor = when(selectedUnit) {
        "Hectare" -> 2.47105
        "Gunta" -> 0.025
        else -> 1.0 // Acre
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Fertilizer Calculator", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text("See relevant information on", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(8.dp))
                CropSelectorButton(crop = selectedCrop, onClick = { showCropDialog = true })
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                NutrientDisplayCard(crop = selectedCrop, unit = selectedUnit, factor = conversionFactor)
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                UnitSelector(selectedUnit = selectedUnit, onUnitSelected = {
                    selectedUnit = it
                    calculationResult = null
                })
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                if (selectedCrop.inputType == "plot") {
                    PlotSizeInput(plotSize = plotSize, unit = selectedUnit, onValueChange = {
                        plotSize = it
                        calculationResult = null
                    })
                } else {
                    TreeCountInput(treeCount = treeCount, onValueChange = {
                        treeCount = it
                        calculationResult = null
                    })
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Button(
                    onClick = { calculationResult = calculateFertilizers(selectedCrop, plotSize, treeCount) },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Calculate", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                AnimatedVisibility(visible = calculationResult != null) {
                    CalculationResults(result = calculationResult)
                }
            }
        }
    }

    if (showCropDialog) {
        CropSelectionDialog(
            onDismiss = { showCropDialog = false },
            onCropSelected = { cropKey ->
                selectedCropKey = cropKey
                calculationResult = null
                showCropDialog = false
            }
        )
    }
}


// --- 3. UI SUB-COMPONENTS ---

@Composable
fun CropSelectorButton(crop: CropInfo, onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick,
        shape = RoundedCornerShape(50),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
    ) {
        Image(painterResource(id = crop.iconResId), contentDescription = null, modifier = Modifier.size(24.dp).clip(CircleShape))
        Spacer(modifier = Modifier.width(8.dp))
        Text(crop.name)
        Icon(painterResource(id = R.drawable.ic_arrow_drop_down), contentDescription = null)
    }
}

@Composable
fun NutrientDisplayCard(crop: CropInfo, unit: String, factor: Double) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Nutrient Quantities", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Text("Based on your selection, we've chosen a nutrient ratio for you.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(16.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                if (crop.inputType == "plot" && crop.nutrientsPerAcre != null) {
                    NutrientItem("N", "${(crop.nutrientsPerAcre.n / factor).toInt()} kg/$unit")
                    NutrientItem("P", "${(crop.nutrientsPerAcre.p / factor).toInt()} kg/$unit")
                    NutrientItem("K", "${(crop.nutrientsPerAcre.k / factor).toInt()} kg/$unit")
                } else if (crop.inputType == "trees" && crop.nutrientsPerTree != null) {
                    NutrientItem("N", "${crop.nutrientsPerTree.n} kg/tree")
                    NutrientItem("P", "${crop.nutrientsPerTree.p} kg/tree")
                    NutrientItem("K", "${crop.nutrientsPerTree.k} kg/tree")
                }
            }
        }
    }
}

@Composable
fun NutrientItem(name: String, value: String) {
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.background)) {
        Column(modifier = Modifier.padding(vertical = 12.dp, horizontal = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(name, fontWeight = FontWeight.Bold)
            Text(value, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun UnitSelector(selectedUnit: String, onUnitSelected: (String) -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Unit", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Acre", "Hectare", "Gunta").forEach { unit ->
                    val isSelected = selectedUnit == unit
                    OutlinedButton(
                        onClick = { onUnitSelected(unit) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (isSelected) PrimaryGreen.copy(alpha = 0.1f) else Color.Transparent,
                            contentColor = if (isSelected) PrimaryGreen else MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        border = BorderStroke(1.dp, if (isSelected) PrimaryGreen else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                    ) {
                        Text(unit)
                    }
                }
            }
        }
    }
}

@Composable
fun PlotSizeInput(plotSize: Float, unit: String, onValueChange: (Float) -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Plot Size", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Text("Example: half an acre = 0.5", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.background, RoundedCornerShape(12.dp)).padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = { if (plotSize > 0.1f) onValueChange(plotSize - 0.1f) }) { Icon(painterResource(id = R.drawable.ic_remove), contentDescription = "Decrease") }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(String.format("%.1f", plotSize), fontSize = 32.sp, fontWeight = FontWeight.Bold)
                    Text(unit, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                IconButton(onClick = { onValueChange(plotSize + 0.1f) }) { Icon(painterResource(id = R.drawable.ic_add), contentDescription = "Increase") }
            }
        }
    }
}

@Composable
fun TreeCountInput(treeCount: Int, onValueChange: (Int) -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Number of Trees", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.background, RoundedCornerShape(12.dp)).padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = { if (treeCount > 1) onValueChange(treeCount - 1) }) { Icon(painterResource(id = R.drawable.ic_remove), contentDescription = "Decrease") }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("$treeCount", fontSize = 32.sp, fontWeight = FontWeight.Bold)
                    Text("Trees", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                IconButton(onClick = { onValueChange(treeCount + 1) }) { Icon(painterResource(id = R.drawable.ic_add), contentDescription = "Increase") }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropSelectionDialog(onDismiss: () -> Unit, onCropSelected: (String) -> Unit) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(),
        dragHandle = { BottomSheetDefaults.DragHandle() },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Select your crop", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                IconButton(onClick = onDismiss) { Icon(painterResource(id = R.drawable.ic_close), contentDescription = "Close") }
            }
            Spacer(modifier = Modifier.height(16.dp))
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(fertilizerCropData.entries.toList()) { (key, crop) ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onCropSelected(key) }
                    ) {
                        Image(
                            painter = painterResource(id = crop.iconResId),
                            contentDescription = crop.name,
                            modifier = Modifier.size(64.dp).clip(CircleShape).border(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f), CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(crop.name, fontSize = 12.sp, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}

@Composable
fun CalculationResults(result: Pair<FertilizerResult, FertilizerResult>?) {
    if (result == null) return
    val (mopTspUrea, dapMopUrea) = result
    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Choose your preferred fertilizer combination", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = PrimaryGreen, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(16.dp))
        ResultCombinationCard(
            title = "MOP/TSP/Urea",
            fertilizer1Name = "MOP", fertilizer1Value = mopTspUrea.mopKg, fertilizer1Bags = mopTspUrea.mopBags,
            fertilizer2Name = "TSP", fertilizer2Value = mopTspUrea.tspKg, fertilizer2Bags = mopTspUrea.tspBags,
            fertilizer3Name = "Urea", fertilizer3Value = mopTspUrea.ureaKg, fertilizer3Bags = mopTspUrea.ureaBags
        )
        Spacer(modifier = Modifier.height(16.dp))
        ResultCombinationCard(
            title = "DAP/MOP/Urea",
            fertilizer1Name = "DAP", fertilizer1Value = dapMopUrea.dapKg, fertilizer1Bags = dapMopUrea.dapBags,
            fertilizer2Name = "MOP", fertilizer2Value = dapMopUrea.mopKg, fertilizer2Bags = dapMopUrea.mopBags,
            fertilizer3Name = "Urea", fertilizer3Value = dapMopUrea.ureaKg, fertilizer3Bags = dapMopUrea.ureaBags
        )
    }
}

@Composable
fun ResultCombinationCard(
    title: String,
    fertilizer1Name: String, fertilizer1Value: Double, fertilizer1Bags: Double,
    fertilizer2Name: String, fertilizer2Value: Double, fertilizer2Bags: Double,
    fertilizer3Name: String, fertilizer3Value: Double, fertilizer3Bags: Double,
) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp).fillMaxWidth()) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                FertilizerResultItem(name = fertilizer1Name, kg = fertilizer1Value, bags = fertilizer1Bags)
                FertilizerResultItem(name = fertilizer2Name, kg = fertilizer2Value, bags = fertilizer2Bags)
                FertilizerResultItem(name = fertilizer3Name, kg = fertilizer3Value, bags = fertilizer3Bags)
            }
        }
    }
}

@Composable
fun FertilizerResultItem(name: String, kg: Double, bags: Double) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(name, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("${kg.toInt()} kg", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = PrimaryGreen)
        Text("${String.format("%.2f", bags)} Bags", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

// --- 4. CALCULATION LOGIC ---

fun calculateFertilizers(
    crop: CropInfo,
    plotSize: Float,
    treeCount: Int
): Pair<FertilizerResult, FertilizerResult> {
    val fertilizers = mapOf(
        "urea" to Nutrients(n = 0.46, p = 0.0, k = 0.0),
        "dap" to Nutrients(n = 0.18, p = 0.46, k = 0.0),
        "mop" to Nutrients(n = 0.0, p = 0.0, k = 0.60),
        "tsp" to Nutrients(n = 0.0, p = 0.46, k = 0.0)
    )
    val bagWeightKg = 50.0

    val (totalN, totalP, totalK) = if (crop.inputType == "plot") {
        Triple(
            crop.nutrientsPerAcre!!.n * plotSize,
            crop.nutrientsPerAcre.p * plotSize,
            crop.nutrientsPerAcre.k * plotSize
        )
    } else { // trees
        Triple(
            crop.nutrientsPerTree!!.n * treeCount,
            crop.nutrientsPerTree.p * treeCount,
            crop.nutrientsPerTree.k * treeCount
        )
    }

    // MOP/TSP/Urea Calculation
    val mop1 = if (fertilizers["mop"]!!.k > 0) totalK / fertilizers["mop"]!!.k else 0.0
    val tsp1 = if (fertilizers["tsp"]!!.p > 0) totalP / fertilizers["tsp"]!!.p else 0.0
    val urea1 = if (fertilizers["urea"]!!.n > 0) totalN / fertilizers["urea"]!!.n else 0.0
    val result1 = FertilizerResult(
        mopKg = mop1, tspKg = tsp1, ureaKg = urea1,
        mopBags = mop1 / bagWeightKg, tspBags = tsp1 / bagWeightKg, ureaBags = urea1 / bagWeightKg
    )

    // DAP/MOP/Urea Calculation
    val dap2 = if (fertilizers["dap"]!!.p > 0) totalP / fertilizers["dap"]!!.p else 0.0
    val nFromDap = dap2 * fertilizers["dap"]!!.n
    val urea2 = if (fertilizers["urea"]!!.n > 0) maxOf(0.0, (totalN - nFromDap) / fertilizers["urea"]!!.n) else 0.0
    val mop2 = if (fertilizers["mop"]!!.k > 0) totalK / fertilizers["mop"]!!.k else 0.0
    val result2 = FertilizerResult(
        dapKg = dap2, mopKg = mop2, ureaKg = urea2,
        dapBags = dap2 / bagWeightKg, mopBags = mop2 / bagWeightKg, ureaBags = urea2 / bagWeightKg
    )

    return Pair(result1, result2)
}