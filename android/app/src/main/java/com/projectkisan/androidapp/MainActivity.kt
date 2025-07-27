package com.projectkisan.androidapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.projectkisan.androidapp.ui.theme.*

// Data class and Sealed class for Navigation
sealed class Screen(val route: String, val label: String, val icon: Int) {
    object Home : Screen("home", "Home", R.drawable.ic_home)
    object Schemes : Screen("schemes", "Schemes", R.drawable.ic_schemes)
    object Plan : Screen("plan", "Plan", R.drawable.ic_plan)
    object Ask : Screen("ask", "Ask", R.drawable.ic_ask)
    object Diagnose : Screen("diagnose", "Diagnose", R.drawable.ic_diagnose)
    object Market : Screen("market", "Market", R.drawable.ic_market)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var isDarkTheme by rememberSaveable { mutableStateOf(false) }
            ProjectKisanTheme(darkTheme = isDarkTheme) {
                MainScreen(
                    isDarkMode = isDarkTheme,
                    onThemeToggle = { isDarkTheme = !isDarkTheme }
                )
            }
        }
    }
}

@Composable
fun MainScreen(isDarkMode: Boolean, onThemeToggle: () -> Unit) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val diagnosisViewModel: DiagnosisViewModel = viewModel()
    var showContactSheet by rememberSaveable { mutableStateOf(false) }

    Scaffold(
        topBar = {
            if (currentRoute != "diagnosis_result") {
                TopBar(
                    navController = navController,
                    isDarkMode = isDarkMode,
                    onThemeToggle = onThemeToggle,
                    onHomeClick = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(navController.graph.findStartDestination().id) { inclusive = true }
                            launchSingleTop = true
                        }
                    },
                    onContactClick = { showContactSheet = true }
                )
            }
        },
        bottomBar = {
            if (currentRoute != "diagnosis_result") {
                BottomBar(navController = navController)
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("crop_planner") {
                CropPlannerScreen(navController = navController)
            }
            composable(Screen.Home.route) { HomeScreen(navController = navController) }
            composable(Screen.Schemes.route) { SchemesScreen() }
            composable(Screen.Plan.route) { PlanScreen() }
            composable(Screen.Ask.route) { AskScreen() }
            composable(Screen.Diagnose.route) {
                DiagnoseScreen(
                    viewModel = diagnosisViewModel,
                    onNavigateToResult = { navController.navigate("diagnosis_result") }
                )
            }
            composable(Screen.Market.route) { MarketScreen() }

            // ▼▼▼ FIX: Corrected the function call to pass the expected lambda ▼▼▼
            composable("fertilizer_calculator") {
                FertilizerCalculatorScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable("diagnosis_result") {
                val result = diagnosisViewModel.lastResult
                if (result != null) {
                    DiagnosisResultScreen(
                        viewModel = diagnosisViewModel,
                        result = result,
                        onNavigateBack = { navController.popBackStack() }
                    )
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No result found. Please go back.")
                    }
                }
            }
        }
    }

    if (showContactSheet) {
        AboutAndContactSheet(onDismiss = { showContactSheet = false })
    }
}

// ... The rest of MainActivity.kt remains the same (BottomBar, TopBar, etc.)
@Composable
fun BottomBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val bottomNavScreens = listOf(Screen.Schemes, Screen.Plan, Screen.Ask, Screen.Diagnose, Screen.Market)
    val selectedItemIndex = if (currentRoute == Screen.Home.route) -1 else bottomNavScreens.indexOfFirst { it.route == currentRoute }

    Surface(modifier = Modifier.fillMaxWidth(), color = MaterialTheme.colorScheme.surface, shadowElevation = 8.dp) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .clip(BubbleNavigationBarShape(selectedItemIndex, bottomNavScreens.size))
                .background(MaterialTheme.colorScheme.surface),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.Top
        ) {
            bottomNavScreens.forEachIndexed { index, screen ->
                val isSelected = selectedItemIndex == index
                val animatedOffset by animateDpAsState(targetValue = if (isSelected) (-12).dp else 0.dp, label = "offsetAnimation")
                NavigationBarItem(
                    modifier = Modifier.offset(y = animatedOffset),
                    label = { Text(screen.label) },
                    icon = {
                        Box(
                            modifier = if (isSelected) Modifier
                                .background(Color.White, CircleShape)
                                .padding(8.dp) else Modifier,
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(painterResource(id = screen.icon), contentDescription = screen.label, modifier = Modifier.size(24.dp))
                        }
                    },
                    selected = isSelected,
                    onClick = {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TextPrimaryLight,
                        selectedTextColor = GreenPrimary,
                        unselectedIconColor = TextMutedLight,
                        unselectedTextColor = TextMutedLight,
                        indicatorColor = Color.Transparent
                    )
                )
            }
        }
    }
}

@Composable
fun TopBar(navController: NavController, isDarkMode: Boolean, onThemeToggle: () -> Unit, onHomeClick: () -> Unit, onContactClick: () -> Unit) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    var isRotating by remember { mutableStateOf(false) }
    val rotationAngle by animateFloatAsState(
        targetValue = if (isRotating) 360f else 0f,
        animationSpec = tween(durationMillis = 800),
        label = "themeIconRotation",
        finishedListener = { if (it == 360f) isRotating = false }
    )

    Surface(modifier = Modifier.fillMaxWidth(), color = MaterialTheme.colorScheme.background, shadowElevation = 2.dp) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "Logo", modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Project Kisan", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onHomeClick) {
                    Icon(painter = painterResource(id = R.drawable.ic_top_home), contentDescription = "Home", modifier = Modifier.size(24.dp), tint = if (currentRoute == Screen.Home.route) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
                }
                IconButton(onClick = onContactClick) {
                    Icon(painterResource(id = R.drawable.ic_top_contact), contentDescription = "Contact", modifier = Modifier.size(24.dp))
                }
                IconButton(onClick = { onThemeToggle(); isRotating = true }) {
                    Icon(
                        painter = if (isDarkMode) painterResource(id = R.drawable.ic_top_sun) else painterResource(id = R.drawable.ic_moon),
                        contentDescription = "Toggle Theme",
                        modifier = Modifier
                            .size(24.dp)
                            .rotate(rotationAngle)
                    )
                }
                IconButton(onClick = { /* TODO */ }) {
                    Icon(painter = painterResource(id = R.drawable.ic_top_profile), contentDescription = "Profile", modifier = Modifier
                        .size(32.dp)
                        .background(MaterialTheme.colorScheme.primary, CircleShape)
                        .padding(4.dp), tint = Color.White)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AboutAndContactSheet(onDismiss: () -> Unit) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("About & Contact", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                IconButton(onClick = onDismiss) { Icon(painterResource(id = R.drawable.ic_close), contentDescription = "Close") }
            }
            HorizontalDivider(modifier = Modifier.padding(bottom = 16.dp))
            Text("About Project Kisan", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "Project Kisan is a comprehensive digital assistant designed to empower farmers with data-driven tools. From AI-powered crop diagnosis and personalized cultivation plans to real-time market prices and relevant government schemes, our mission is to bring a new dawn to Indian agriculture.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(24.dp))
            Text("Meet the Team: Algo Agni", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))
            TeamMemberCard(name = "Lakshay Pal", phone = "9315674123", email = "llakshaydev@gmail.com")
            Spacer(modifier = Modifier.height(12.dp))
            TeamMemberCard(name = "Kishlay", phone = "8368139841", email = "kishlay.ranj@gmail.com")
            Spacer(modifier = Modifier.height(12.dp))
            TeamMemberCard(name = "Jatin Gupta", phone = "9034602219", email = "jatin.gupta4208@gmail.com")
            Spacer(modifier = Modifier.height(12.dp))
            TeamMemberCard(name = "Krrish Barsiwal", phone = "8094951456", email = "krrishbarsiwal777@gmail.com")
        }
    }
}

@Composable
private fun TeamMemberCard(name: String, phone: String, email: String) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyLarge)
            Text(phone, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
            Text(email, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
        }
    }
}