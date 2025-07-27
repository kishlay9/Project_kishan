package com.projectkisan.androidapp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.projectkisan.androidapp.models.AskMessage
import kotlinx.coroutines.launch

@Composable
fun AskScreen(askViewModel: AskViewModel = viewModel()) {
    val messages by askViewModel.messages.collectAsState()
    val isLoading by askViewModel.isLoading.collectAsState()
    var currentQuery by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Scroll to the bottom when a new message is added
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.Bottom)
        ) {
            item { Spacer(modifier = Modifier.height(16.dp)) }
            items(messages) { message ->
                if (message.isFromUser) {
                    UserAskBubble(message)
                } else {
                    AiAskBubble(message)
                }
            }
            if (isLoading) {
                item { AiTypingIndicator() }
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }

        SuggestionChips(onChipClick = { query ->
            currentQuery = query
            askViewModel.sendQuery(query)
            currentQuery = ""
        })

        ChatInputBar(
            value = currentQuery,
            onValueChange = { currentQuery = it },
            onSend = {
                askViewModel.sendQuery(currentQuery)
                currentQuery = ""
            },
            placeholderText = "Ask about crops, soil, weather..."
        )
    }
}


// --- UI HELPER COMPONENTS FOR AskScreen ---

@Composable
fun UserAskBubble(message: AskMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.End
    ) {
        Card(
            shape = RoundedCornerShape(20.dp, 4.dp, 20.dp, 20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(16.dp),
                color = MaterialTheme.colorScheme.onPrimary
            )
        }
    }
}

@Composable
fun AiAskBubble(message: AskMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_logo),
            contentDescription = "AI Avatar",
            modifier = Modifier.size(32.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(8.dp))
        Card(
            shape = RoundedCornerShape(4.dp, 20.dp, 20.dp, 20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(16.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AiTypingIndicator() {
    Row(modifier = Modifier.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(
            painter = painterResource(id = R.drawable.ic_logo),
            contentDescription = "AI Avatar",
            modifier = Modifier.size(32.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(8.dp))
        Card(
            shape = RoundedCornerShape(4.dp, 20.dp, 20.dp, 20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Text("KisanAI is typing...", modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SuggestionChips(onChipClick: (String) -> Unit) {
    val suggestions = listOf("How to treat tomato blight?", "Best fertilizer for wheat?", "Market price of onions?")
    FlowRow(
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        suggestions.forEach { suggestion ->
            SuggestionChip(
                onClick = { onChipClick(suggestion) },
                label = { Text(suggestion) }
            )
        }
    }
}