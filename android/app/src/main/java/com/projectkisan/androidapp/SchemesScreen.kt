package com.projectkisan.androidapp

import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.encodeURLPathPart
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

// NOTE: Shared UI components and the ChatMessage data class have been REMOVED from this file.

@Serializable
data class Scheme(
    val scheme_name: String = "N/A",
    val government_level: String = "N/A",
    val brief_description: String = "No description available.",
    val key_benefits: List<String> = emptyList(),
    val how_to_apply: String = "Application details not specified."
)
@Serializable
data class SchemeResponse(
    val schemes_found: Boolean = false,
    val schemes: List<Scheme> = emptyList(),
    val message_if_no_schemes: String? = null
)

@Composable
fun SchemesScreen() {
    var selectedState by remember { mutableStateOf<String?>(null) }
    var showStateSelector by remember { mutableStateOf(false) }
    var chatMessages by remember { mutableStateOf(listOf<ChatMessage>()) }
    var currentQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        if (selectedState == null) {
            InitialStateSelectionView(onStateSelectClicked = { showStateSelector = true })
        } else {
            ChatView(
                messages = chatMessages,
                currentQuery = currentQuery,
                onQueryChange = { currentQuery = it },
                onSendClicked = {
                    if (currentQuery.isNotBlank()) {
                        val userMessage = ChatMessage(text = currentQuery, isFromUser = true)
                        chatMessages = chatMessages + userMessage
                        isLoading = true
                        coroutineScope.launch {
                            val response = getAiResponse(currentQuery, selectedState!!)
                            chatMessages = chatMessages + response
                            isLoading = false
                        }
                        currentQuery = ""
                    }
                },
                isLoading = isLoading,
                location = selectedState!!
            )
        }
        if (showStateSelector) {
            StateSelectionDialog(
                onDismiss = { showStateSelector = false },
                onStateSelected = { state ->
                    selectedState = state
                    showStateSelector = false
                    chatMessages = listOf(
                        ChatMessage(
                            text = "Location set to **$state**. You can now ask about schemes for irrigation, seeds, etc.",
                            isFromUser = false
                        )
                    )
                }
            )
        }
    }
}

// --- UI SUB-COMPONENTS (Specific to SchemesScreen) ---
@Composable
fun InitialStateSelectionView(onStateSelectClicked: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
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
        Text("AI Scheme Assistant", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Find government schemes for farmers in your area.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(24.dp))
        Text("First, please select your state", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedButton(
            onClick = onStateSelectClicked,
            modifier = Modifier.fillMaxWidth(0.8f),
            shape = RoundedCornerShape(50),
            contentPadding = PaddingValues(16.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurfaceVariant),
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
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.85f),
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
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
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

@Composable
fun ChatView(messages: List<ChatMessage>, currentQuery: String, onQueryChange: (String) -> Unit, onSendClicked: () -> Unit, isLoading: Boolean, location: String) {
    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            reverseLayout = true
        ) {
            item { Spacer(modifier = Modifier.height(16.dp)) }
            if (isLoading) {
                item { TypingIndicator() }
            }
            items(messages.reversed()) { message ->
                if (message.isFromUser) {
                    UserMessageBubble(message)
                } else {
                    AiMessageBubbleWithSchemes(message)
                }
            }
        }
        ChatInputBar(
            value = currentQuery,
            onValueChange = onQueryChange,
            onSend = onSendClicked,
            placeholderText = if (messages.size <= 1) "Location set to $location!" else "Ask about irrigation, seeds..."
        )
    }
}

@Composable
fun AiMessageBubbleWithSchemes(message: ChatMessage) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
        Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "AI Avatar", modifier = Modifier.size(40.dp).clip(CircleShape).align(Alignment.Top))
        Spacer(modifier = Modifier.width(8.dp))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AiMessageBubble(message) // Uses the shared component
            message.schemes?.forEach { scheme ->
                SchemeCard(scheme = scheme)
            }
        }
    }
}

@Composable
fun SchemeCard(scheme: Scheme) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("${scheme.scheme_name} (${scheme.government_level})", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(scheme.brief_description, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Key Benefits:", fontWeight = FontWeight.SemiBold)
            scheme.key_benefits.forEach { Text("• $it") }
            Spacer(modifier = Modifier.height(8.dp))
            Text("How to Apply:", fontWeight = FontWeight.SemiBold)
            Text(scheme.how_to_apply)
        }
    }
}

@Composable
fun TypingIndicator() {
    Row(modifier = Modifier.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "AI Avatar", modifier = Modifier.size(40.dp).clip(CircleShape))
        Spacer(modifier = Modifier.width(8.dp))
        Card(
            shape = RoundedCornerShape(topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Text("...", modifier = Modifier.padding(16.dp))
        }
    }
}


// --- BACKEND CONNECTION LOGIC ---
private val ktorClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}

suspend fun getAiResponse(query: String, location: String): ChatMessage {
    val apiUrl = "https://asia-south1-project-kisan-new.cloudfunctions.net/getSchemeAnswer"
    val requestUrl = "$apiUrl?question=${query.encodeURLPathPart()}&stateName=${location.encodeURLPathPart()}"

    return try {
        val response: SchemeResponse = ktorClient.get(requestUrl).body()
        if (response.schemes_found && response.schemes.isNotEmpty()) {
            ChatMessage(
                text = "Based on your query, here are some schemes I found for **$location**:",
                isFromUser = false,
                schemes = response.schemes
            )
        } else {
            ChatMessage(
                text = response.message_if_no_schemes ?: "I couldn't find any specific schemes for that query in $location.",
                isFromUser = false
            )
        }
    } catch (e: Exception) {
        Log.e("SchemesScreen", "Network Error: ${e.message}", e)
        ChatMessage(
            text = "I'm sorry, I'm having trouble connecting. Please check your internet connection and try again.",
            isFromUser = false
        )
    }
}