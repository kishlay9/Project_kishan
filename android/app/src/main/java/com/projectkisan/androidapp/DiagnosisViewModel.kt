package com.projectkisan.androidapp

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.storage.FirebaseStorage
import com.projectkisan.androidapp.models.DiagnosisResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream
import java.util.*

sealed class DiagnosisUiState {
    object Idle : DiagnosisUiState()
    object Processing : DiagnosisUiState()
    data class Success(val result: DiagnosisResult) : DiagnosisUiState()
    data class Error(val message: String) : DiagnosisUiState()
}

class DiagnosisViewModel : ViewModel() {

    private val storage = FirebaseStorage.getInstance()
    private val firestore = FirebaseFirestore.getInstance()

    private val _uiState = MutableStateFlow<DiagnosisUiState>(DiagnosisUiState.Idle)
    val uiState = _uiState.asStateFlow()

    var lastResult: DiagnosisResult? by mutableStateOf(null)
        private set

    private var firestoreListener: ListenerRegistration? = null
    private var mediaPlayer: MediaPlayer? = null

    fun analyzeImage(bitmap: Bitmap, language: String) {
        viewModelScope.launch {
            _uiState.value = DiagnosisUiState.Processing
            val diagnosisId = UUID.randomUUID().toString()
            try {
                val imageUrl = uploadImage(bitmap, diagnosisId, language)
                Log.d("DiagnosisViewModel", "Image uploaded to: $imageUrl")
                startListeningForDiagnosis(diagnosisId)
            } catch (e: Exception) {
                Log.e("DiagnosisViewModel", "Analysis failed", e)
                _uiState.value = DiagnosisUiState.Error(e.message ?: "Image analysis failed.")
            }
        }
    }

    private suspend fun uploadImage(bitmap: Bitmap, diagnosisId: String, language: String): String {
        val baos = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, baos)
        val data = baos.toByteArray()

        val ref = storage.reference.child("uploads/$diagnosisId")
        val metadata = com.google.firebase.storage.StorageMetadata.Builder()
            .setCustomMetadata("language", language)
            .build()

        val uploadTask = ref.putBytes(data, metadata).await()
        return uploadTask.storage.downloadUrl.await().toString()
    }

    private fun startListeningForDiagnosis(diagnosisId: String) {
        firestoreListener?.remove()
        val docRef = firestore.collection("diagnoses").document(diagnosisId)

        firestoreListener = docRef.addSnapshotListener { snapshot, e ->
            // ▼▼▼ FIX: Use 'null' instead of 'nil' and check snapshot for nullability ▼▼▼
            if (e != null) {
                Log.e("DiagnosisViewModel", "Listen failed.", e)
                _uiState.value = DiagnosisUiState.Error("Failed to get diagnosis result.")
                return@addSnapshotListener
            }

            // ▼▼▼ FIX: Use safe call '?' to access exists property ▼▼▼
            if (snapshot?.exists() == true) {
                val result: DiagnosisResult? = snapshot.toObject(DiagnosisResult::class.java)

                // ▼▼▼ FIX: Check if result is not null before using it ▼▼▼
                if (result != null) {
                    if (result.object_category != "Loading...") {
                        lastResult = result
                        _uiState.value = DiagnosisUiState.Success(result)
                        firestoreListener?.remove()
                    }
                }
            }
        }
    }

    fun getTranslatedText(map: Map<String, String>, language: String): String {
        return map[language] ?: map["en"] ?: "N/A"
    }

    fun getTranslatedPreventionTips(map: Map<String, List<String>>, language: String): List<String> {
        return map[language] ?: map["en"] ?: emptyList()
    }

    fun playAudio(url: String, context: Context) {
        stopAudio()
        try {
            mediaPlayer = MediaPlayer().apply {
                setDataSource(context, Uri.parse(url))
                prepareAsync()
                setOnPreparedListener {
                    it.start()
                }
                setOnCompletionListener {
                    stopAudio()
                }
            }
        } catch (e: Exception) {
            Log.e("DiagnosisViewModel", "Error playing audio", e)
        }
    }

    fun stopAudio() {
        mediaPlayer?.release()
        // ▼▼▼ FIX: Use 'null' instead of 'nil' ▼▼▼
        mediaPlayer = null
    }

    override fun onCleared() {
        super.onCleared()
        firestoreListener?.remove()
        stopAudio()
    }
}