package com.projectkisan.androidapp

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

sealed interface DiagnosisUiState {
    object Idle : DiagnosisUiState
    data class Loading(val message: String) : DiagnosisUiState
    data class Success(val result: DiagnosisResult) : DiagnosisUiState
    data class Error(val message: String) : DiagnosisUiState
}

class DiagnosisViewModel : ViewModel() {
    var uiState: DiagnosisUiState by mutableStateOf(DiagnosisUiState.Idle)
        private set

    var lastResult: DiagnosisResult? = null
        private set

    private var exoPlayer: ExoPlayer? = null
    val isPlaying: StateFlow<Boolean>

    private var listenerRegistration: ListenerRegistration? = null

    init {
        isPlaying = snapshotFlow { exoPlayer?.isPlaying ?: false }
            .stateIn(viewModelScope, SharingStarted.Lazily, false)
    }

    fun initializePlayer(context: Context, url: String) {
        exoPlayer?.release()
        if (url.isNotBlank()) {
            exoPlayer = ExoPlayer.Builder(context).build().apply {
                setMediaItem(MediaItem.fromUri(Uri.parse(url)))
                prepare()
                addListener(object : Player.Listener {
                    override fun onIsPlayingChanged(isPlaying: Boolean) {
                        // The StateFlow will automatically pick up this change
                    }
                })
            }
        }
    }

    fun togglePlayback() {
        exoPlayer?.let {
            if (it.isPlaying) {
                it.pause()
            } else {
                it.play()
            }
        }
    }

    override fun onCleared() {
        exoPlayer?.release()
        listenerRegistration?.remove() // Clean up Firestore listener
        super.onCleared()
    }

    fun startListening(diagnosisId: String) {
        val docRef = Firebase.firestore.collection("diagnoses").document(diagnosisId)
        // Remove any old listener before starting a new one
        listenerRegistration?.remove()

        // ▼▼▼ THIS IS THE FIX ▼▼▼
        listenerRegistration = docRef.addSnapshotListener { snapshot, e ->
            if (e != null) {
                setError("Error fetching result: ${e.message}")
                return@addSnapshotListener // Correct lambda label
            }
            if (snapshot != null && snapshot.exists()) {
                val result = snapshot.toObject<DiagnosisResult>()
                if (result != null) {
                    lastResult = result
                    uiState = DiagnosisUiState.Success(result)
                    listenerRegistration?.remove() // Stop listening once we have the result
                } else {
                    setError("Failed to parse diagnosis data.")
                    listenerRegistration?.remove()
                }
            }
        }
    }

    fun setLoading(message: String) {
        uiState = DiagnosisUiState.Loading(message)
    }

    fun setError(message: String) {
        uiState = DiagnosisUiState.Error(message)
    }

    fun resetState() {
        uiState = DiagnosisUiState.Idle
    }
}