package com.projectkisan.androidapp
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import com.projectkisan.androidapp.ui.theme.GreenPrimary

// SINGLE SOURCE OF TRUTH for the ChatMessage data model
data class ChatMessage(val text: String, val isFromUser: Boolean, val author: String? = null, val schemes: List<Scheme>? = null)

// SHARED UI COMPONENTS

@Composable
fun AiMessageBubble(message: ChatMessage) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start, verticalAlignment = Alignment.Bottom) {
        Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "AI Avatar", modifier = Modifier.size(32.dp).clip(CircleShape))
        Spacer(modifier = Modifier.width(8.dp))
        Card(
            shape = RoundedCornerShape(topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Text(message.text.replace("**", ""), modifier = Modifier.padding(16.dp))
        }
    }
}

@Composable
fun UserMessageBubble(message: ChatMessage) {
    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.End) {
        message.author?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 4.dp, end = 8.dp)
            )
        }
        Text(
            text = message.text,
            modifier = Modifier
                .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 16.dp))
                .background(GreenPrimary)
                .padding(16.dp),
            color = Color.White
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatInputBar(value: String, onValueChange: (String) -> Unit, onSend: () -> Unit, placeholderText: String = "Talk to Assistant...") {
    val keyboardController = LocalSoftwareKeyboardController.current
    Surface(shadowElevation = 8.dp, color = MaterialTheme.colorScheme.surface) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text(placeholderText) },
                leadingIcon = { Icon(painter = painterResource(id = R.drawable.ic_chat_bubble), contentDescription = null) },
                shape = CircleShape,
                colors = TextFieldDefaults.colors(
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                    cursorColor = MaterialTheme.colorScheme.primary,
                    unfocusedContainerColor = MaterialTheme.colorScheme.background,
                    focusedContainerColor = MaterialTheme.colorScheme.background
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { onSend(); keyboardController?.hide() })
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = onSend,
                modifier = Modifier.size(48.dp).background(GreenPrimary, CircleShape),
                enabled = value.isNotBlank()
            ) {
                Icon(painter = painterResource(id = R.drawable.ic_ask), contentDescription = "Send", tint = Color.White)
            }
        }
    }
}

@Composable
fun SuggestionChips(onChipClick: (String) -> Unit) {
    val suggestions = listOf("What is the price of onions?", "Is it going to rain tomorrow?", "How to treat leaf curl virus?")
    Column(
        modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
        horizontalAlignment = Alignment.Start // Chips align to the left
    ) {
        suggestions.forEach { suggestion ->
            OutlinedButton(
                onClick = { onChipClick(suggestion) },
                shape = CircleShape,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text(suggestion, color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}