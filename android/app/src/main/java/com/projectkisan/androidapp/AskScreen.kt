package com.projectkisan.androidapp

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun AskScreen() {
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                "Hello! How can I help you today? Ask me about crop prices, weather, or pest control.",
                isFromUser = false
            )
        )
    }
    var text by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Text(
            text = "Ask Assistant",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(16.dp)
        )

        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            reverseLayout = true
        ) {
            item { Spacer(modifier = Modifier.height(16.dp)) }
            items(messages.reversed()) { message ->
                if (message.isFromUser) {
                    UserMessageBubble(message)
                } else {
                    AiMessageBubble(message)
                }
            }
        }

        AnimatedVisibility(visible = messages.size == 1) {
            SuggestionChips { suggestion ->
                messages.add(ChatMessage(suggestion, isFromUser = true, author = "lakshay"))
                messages.add(ChatMessage("I'm not sure how to answer that. Could you ask another way?", isFromUser = false))
                coroutineScope.launch { listState.animateScrollToItem(0) }
            }
        }

        ChatInputBar(
            value = text,
            onValueChange = { text = it },
            onSend = {
                if (text.isNotBlank()) {
                    messages.add(ChatMessage(text, isFromUser = true, author = "lakshay"))
                    messages.add(ChatMessage("I'm not sure how to answer that. Could you ask another way?", isFromUser = false))
                    text = ""
                    coroutineScope.launch { listState.animateScrollToItem(0) }
                }
            }
        )
    }
}