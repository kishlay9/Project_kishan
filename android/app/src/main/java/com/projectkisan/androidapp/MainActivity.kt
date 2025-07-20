package com.projectkisan.androidapp

import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
// ▼▼▼ FIX: Add necessary imports for Firestore types ▼▼▼
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.ktx.storage
import java.util.Date

class MainActivity : AppCompatActivity() {

    // UI Elements (no changes here)
    private lateinit var imageViewPreview: ImageView
    private lateinit var buttonUpload: Button
    private lateinit var textViewResult: TextView
    private lateinit var progressBar: ProgressBar

    // Firebase Instances (no changes here)
    private val storage = Firebase.storage
    private val firestore = Firebase.firestore
    private var firestoreListener: ListenerRegistration? = null

    // Activity Result Launcher (no changes here)
    private val selectImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            imageViewPreview.setImageURI(it)
            handleImageUpload(it)
        }
    }

    // onCreate (no changes here)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        imageViewPreview = findViewById(R.id.imageViewPreview)
        buttonUpload = findViewById(R.id.buttonUpload)
        textViewResult = findViewById(R.id.textViewResult)
        progressBar = findViewById(R.id.progressBar)

        buttonUpload.setOnClickListener {
            selectImageLauncher.launch("image/*")
        }
    }

    // handleImageUpload (no changes here)
    private fun handleImageUpload(imageUri: Uri) {
        showLoading(true, "Uploading image...")

        val fileExtension = contentResolver.getType(imageUri)?.substringAfterLast('/') ?: "jpg"
        val uniqueFileName = "image_${Date().time}_android.$fileExtension"
        val storagePath = "uploads/$uniqueFileName"
        val storageRef = storage.reference.child(storagePath)

        storageRef.putFile(imageUri)
            .addOnProgressListener { taskSnapshot ->
                val progress = (100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount
                textViewResult.text = "Uploading... ${progress.toInt()}%"
            }
            .addOnSuccessListener {
                textViewResult.text = "Analyzing image with AI..."
                listenForDiagnosisResult(uniqueFileName)
            }
            .addOnFailureListener { exception ->
                showLoading(false)
                Toast.makeText(this, "Upload failed: ${exception.message}", Toast.LENGTH_LONG).show()
                Log.e("MainActivity", "Upload failed", exception)
            }
    }

    // listenForDiagnosisResult (THIS IS WHERE THE FIX IS)
    private fun listenForDiagnosisResult(diagnosisId: String) {
        val docRef = firestore.collection("diagnoses").document(diagnosisId)

        firestoreListener?.remove()

        // ▼▼▼ FIX: Explicitly specify the types for the listener's parameters ▼▼▼
        firestoreListener = docRef.addSnapshotListener { snapshot: DocumentSnapshot?, e: FirebaseFirestoreException? ->
            if (e != null) {
                showLoading(false)
                textViewResult.text = "Error listening for result: ${e.message}"
                Log.w("MainActivity", "Listen failed.", e)
                return@addSnapshotListener
            }

            // ▼▼▼ FIX: Use 'snapshot?.exists()' which is the correct syntax ▼▼▼
            if (snapshot != null && snapshot.exists()) {
                Log.d("MainActivity", "Diagnosis data received: ${snapshot.data}")
                displayDiagnosisResults(snapshot.data)
                firestoreListener?.remove()
            } else {
                Log.d("MainActivity", "Listening... Current data: null")
            }
        }
    }

    // displayDiagnosisResults and showLoading (no changes here)
    private fun displayDiagnosisResults(data: Map<String, Any>?) {
        showLoading(false)
        if (data == null) {
            textViewResult.text = "Failed to parse diagnosis data."
            return
        }

        val diseaseName = data["disease_name_english"] as? String ?: "N/A"
        val plantType = data["plant_type"] as? String ?: "N/A"
        val description = data["description_english"] as? String ?: "No description available."
        val confidence = data["confidence_score"] as? Double ?: 0.0
        val confidencePercent = (confidence * 100).toInt()

        val resultString = """
            Plant: $plantType
            Diagnosis: $diseaseName
            Confidence: $confidencePercent%
            
            Description:
            $description
        """.trimIndent()

        textViewResult.text = resultString

        val audioUrl = data["audio_remedy_url"] as? String
        if (!audioUrl.isNullOrEmpty()) {
            Toast.makeText(this, "Audio summary available!", Toast.LENGTH_SHORT).show()
            Log.d("MainActivity", "Audio URL: $audioUrl")
        }
    }

    private fun showLoading(isLoading: Boolean, message: String = "") {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        buttonUpload.isEnabled = !isLoading
        if (isLoading) {
            textViewResult.text = message
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        firestoreListener?.remove()
    }
}