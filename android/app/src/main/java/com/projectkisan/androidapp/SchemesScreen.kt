package com.projectkisan.androidapp

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
// ▼▼▼ FIX: Add the missing import for the Color class ▼▼▼
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.projectkisan.androidapp.models.ChatMessage
import com.projectkisan.androidapp.models.Scheme
import com.projectkisan.androidapp.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SchemesScreen(schemesViewModel: SchemesViewModel = viewModel()) {
    var showStateSelector by remember { mutableStateOf(false) }

    val messages by schemesViewModel.messages.collectAsState()
    val isLoading by schemesViewModel.isLoading.collectAsState()
    val selectedState = schemesViewModel.selectedState
    var currentQuery by remember { mutableStateOf("") }

    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(selectedState) {
        if (selectedState != null) {
            coroutineScope.launch {
                val job = launch {
                    snackbarHostState.showSnackbar(
                        message = "Location set to $selectedState!",
                        duration = SnackbarDuration.Indefinite
                    )
                }
                delay(2000)
                job.cancel()
            }
        }
    }

    Scaffold(
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    modifier = Modifier.padding(12.dp),
                    containerColor = PrimaryGreen,
                    contentColor = Color.White, // This line is now fixed
                    shape = RoundedCornerShape(50)
                ) {
                    Text(text = data.visuals.message, fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            if (selectedState == null) {
                InitialStateSelectionView(onStateSelectClicked = { showStateSelector = true })
            } else {
                ChatView(
                    messages = messages,
                    currentQuery = currentQuery,
                    onQueryChange = { currentQuery = it },
                    onSendClicked = {
                        val queryToSend = currentQuery
                        if (queryToSend.isNotBlank()) {
                            schemesViewModel.sendQuery(queryToSend)
                            currentQuery = ""
                        }
                    },
                    isLoading = isLoading,
                    location = selectedState
                )
            }
            if (showStateSelector) {
                StateSelectionDialog(
                    onDismiss = { showStateSelector = false },
                    onStateSelected = { state ->
                        schemesViewModel.onStateSelected(state)
                        showStateSelector = false
                    }
                )
            }
        }
    }
}

// ... The rest of the file (InitialStateSelectionView, StateSelectionDialog, etc.) is correct
// and does not need to be changed. It is included here for completeness.

@Composable
fun InitialStateSelectionView(onStateSelectClicked: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_schemes),
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("AI Scheme Assistant", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Find government schemes for farmers in your area.", color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(24.dp))
        Text("First, please select your state", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedButton(
            onClick = onStateSelectClicked,
            modifier = Modifier.fillMaxWidth(0.8f),
            shape = RoundedCornerShape(50),
            contentPadding = PaddingValues(16.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
        ) {
            Text("Select your State...")
            Spacer(modifier = Modifier.weight(1f))
            Icon(painterResource(id = R.drawable.ic_arrow_drop_down), contentDescription = null)
        }
    }
}

@Composable
fun StateSelectionDialog(onDismiss: () -> Unit, onStateSelected: (String) -> Unit) {
    val indianStatesAndUTs = listOf("Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal")
    var searchQuery by remember { mutableStateOf("") }
    val filteredStates = indianStatesAndUTs.filter { it.contains(searchQuery, ignoreCase = true) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Select Your State", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) { Icon(painterResource(id = R.drawable.ic_close), contentDescription = "Close") }
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = searchQuery, onValueChange = { searchQuery = it }, placeholder = { Text("Search for your state...") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(16.dp))
                LazyColumn {
                    items(filteredStates) { state ->
                        Card(
                            onClick = { onStateSelected(state) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                        ) {
                            Text(state, modifier = Modifier.padding(16.dp))
                        }
                    }
                }
            }
        }
    }
}