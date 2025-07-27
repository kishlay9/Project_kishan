@file:OptIn(kotlinx.serialization.InternalSerializationApi::class)
package com.projectkisan.androidapp
import android.util.Log
import kotlinx.serialization.json.Json
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.projectkisan.androidapp.ui.theme.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.encodeURLPathPart
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Scheme(
    @SerialName("scheme_name") val schemeName: String = "N/A",
    @SerialName("government_level") val governmentLevel: String = "N/A",
    @SerialName("brief_description") val briefDescription: String = "No description available.",
    @SerialName("key_benefits") val keyBenefits: List<String> = emptyList(),
    @SerialName("how_to_apply") val howToApply: String = "Application details not specified."
)
@Serializable
data class SchemeResponse(
    @SerialName("schemes_found") val schemesFound: Boolean = false,
    val schemes: List<Scheme> = emptyList(),
    @SerialName("message_if_no_schemes") val messageIfNoSchemes: String? = null
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
                    // 1. Capture the query's value in a local variable.
                    val queryToSend = currentQuery
                    if (queryToSend.isNotBlank()) {
                        val userMessage = ChatMessage(text = queryToSend, isFromUser = true)
                        chatMessages = chatMessages + userMessage
                        isLoading = true
                        coroutineScope.launch {
                            // 2. Use the captured value, which is safe from changes.
                            val response = getAiResponse(queryToSend, selectedState!!)
                            chatMessages = chatMessages + response
                            isLoading = false
                        }
                        // 3. Clear the UI input field *after* launching the safe background task.
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
        Text("Find government schemes for farmers in your area.", color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
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
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(messages.size) {
        coroutineScope.launch {
            if (messages.isNotEmpty()) {
                listState.animateScrollToItem(0)
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            state = listState,
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
        Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "AI Avatar", modifier = Modifier.size(32.dp).clip(CircleShape).align(Alignment.Top))
        Spacer(modifier = Modifier.width(8.dp))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AiMessageBubble(message)
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
            Text("${scheme.schemeName} (${scheme.governmentLevel})", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(scheme.briefDescription, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Key Benefits:", fontWeight = FontWeight.SemiBold)
            scheme.keyBenefits.forEach { Text("• $it") }
            Spacer(modifier = Modifier.height(8.dp))
            Text("How to Apply:", fontWeight = FontWeight.SemiBold)
            Text(scheme.howToApply)
        }
    }
}

private val ktorClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            coerceInputValues = true
        })
    }
}

suspend fun getAiResponse(query: String, location: String): ChatMessage {
    val apiUrl = "https://asia-south1-project-kisan-new.cloudfunctions.net/getSchemeAnswer"
    val requestUrl = "$apiUrl?question=${query.encodeURLPathPart()}&stateName=${location.encodeURLPathPart()}"

    Log.d("SchemesScreen", "🚀 Sending request to URL: $requestUrl")

    return try {
        val response: SchemeResponse = ktorClient.get(requestUrl).body()
        Log.d("SchemesScreen", "✅ Received successful response: $response")

        if (response.schemesFound && response.schemes.isNotEmpty()) {
            ChatMessage(
                text = "Based on your query, here are some schemes I found for **$location**:",
                isFromUser = false,
                schemes = response.schemes
            )
        } else {
            ChatMessage(
                text = response.messageIfNoSchemes ?: "I couldn't find any specific schemes for that query in $location.",
                isFromUser = false
            )
        }
    } catch (e: Exception) {
        Log.e("SchemesScreen", "❌ Network Request Failed. Error: ${e.message}", e)
        ChatMessage(
            text = "I'm sorry, I'm having trouble connecting. Please check your internet connection and try again.",
            isFromUser = false
        )
    }
}