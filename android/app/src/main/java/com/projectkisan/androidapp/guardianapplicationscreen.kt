package com.projectkisan.androidapp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.projectkisan.androidapp.ui.GuardianUiState
import com.projectkisan.androidapp.ui.GuardianViewModel
import com.projectkisan.androidapp.ui.cropData
import com.projectkisan.androidapp.ui.indianStatesAndUTs
import com.projectkisan.androidapp.ui.theme.LightGrayBackground
import com.projectkisan.androidapp.ui.theme.PrimaryGreen
import com.projectkisan.androidapp.ui.theme.TextColor
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuardianActivationScreen(navController: NavController, viewModel: GuardianViewModel) {
    var selectedCrop by remember { mutableStateOf<String?>(null) }
    var sowingDate by remember { mutableStateOf("") }
    var selectedLocation by remember { mutableStateOf<String?>(null) }
    var showDatePicker by remember { mutableStateOf(false) }

    val uiState by viewModel.uiState.collectAsState()

    // Navigate to results screen on success
    LaunchedEffect(uiState) {
        if (uiState is GuardianUiState.Success) {
            navController.navigate("guardian_result")
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(LightGrayBackground)
            .padding(24.dp)
    ) {
        item {
            Text("Activate Proactive Guardian", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextColor)
            Spacer(modifier = Modifier.height(24.dp))
        }

        item {
            // Dropdowns and Date Picker
            GuardianInputForm(
                selectedCrop = selectedCrop, onCropChange = { selectedCrop = it },
                sowingDate = sowingDate, onDateChange = { sowingDate = it },
                onCalendarClick = { showDatePicker = true },
                selectedLocation = selectedLocation, onLocationChange = { selectedLocation = it }
            )
            Spacer(modifier = Modifier.height(32.dp))
        }

        item {
            val isFormComplete = selectedCrop != null && sowingDate.isNotBlank() && selectedLocation != null
            Button(
                onClick = {
                    viewModel.activateGuardian(selectedCrop!!, sowingDate, selectedLocation!!)
                },
                enabled = isFormComplete && uiState !is GuardianUiState.Loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                if (uiState is GuardianUiState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                } else {
                    Text("Activate Proactive Guardian", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            if (uiState is GuardianUiState.Error) {
                Text(
                    text = "Error: ${(uiState as GuardianUiState.Error).message}",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
        }
    }

    if (showDatePicker) {
        DatePickerComponent(
            onDateSelected = { sowingDate = it },
            onDismiss = { showDatePicker = false }
        )
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuardianInputForm(
    selectedCrop: String?, onCropChange: (String) -> Unit,
    sowingDate: String, onDateChange: (String) -> Unit, onCalendarClick: () -> Unit,
    selectedLocation: String?, onLocationChange: (String) -> Unit
) {
    var isCropMenuExpanded by remember { mutableStateOf(false) }
    var isLocationMenuExpanded by remember { mutableStateOf(false) }

    Column {
        Text("Select Your Crop", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        ExposedDropdownMenuBox(expanded = isCropMenuExpanded, onExpandedChange = { isCropMenuExpanded = it }) {
            OutlinedTextField(
                value = selectedCrop ?: "",
                onValueChange = {}, readOnly = true,
                placeholder = { Text("Select your crop...") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isCropMenuExpanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            ExposedDropdownMenu(expanded = isCropMenuExpanded, onDismissRequest = { isCropMenuExpanded = false }) {
                cropData.keys.sorted().forEach { crop ->
                    DropdownMenuItem(text = { Text(crop) }, onClick = {
                        onCropChange(crop)
                        isCropMenuExpanded = false
                    })
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Sowing Date", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = sowingDate, onValueChange = {}, readOnly = true,
            placeholder = { Text("dd/mm/yyyy") },
            trailingIcon = {
                IconButton(onClick = onCalendarClick) {
                    Icon(painterResource(id = R.drawable.ic_calendar), "Select Date")
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text("Your Location (State/UT)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        ExposedDropdownMenuBox(expanded = isLocationMenuExpanded, onExpandedChange = { isLocationMenuExpanded = it }) {
            OutlinedTextField(
                value = selectedLocation ?: "",
                onValueChange = {}, readOnly = true,
                placeholder = { Text("Click to select a State/UT") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isLocationMenuExpanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            ExposedDropdownMenu(expanded = isLocationMenuExpanded, onDismissRequest = { isLocationMenuExpanded = false }) {
                indianStatesAndUTs.forEach { location ->
                    DropdownMenuItem(text = { Text(location) }, onClick = {
                        onLocationChange(location)
                        isLocationMenuExpanded = false
                    })
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DatePickerComponent(onDateSelected: (String) -> Unit, onDismiss: () -> Unit) {
    val datePickerState = rememberDatePickerState()
    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = {
                datePickerState.selectedDateMillis?.let {
                    val sdf = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
                    onDateSelected(sdf.format(Date(it)))
                }
                onDismiss()
            }) { Text("OK") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    ) {
        DatePicker(state = datePickerState)
    }
}