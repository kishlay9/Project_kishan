package com.projectkisan.androidapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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

// Screen definitions (ensure these match your files)
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
                    }
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
            composable(Screen.Home.route) { HomeScreen(navController = navController) }
            composable(Screen.Schemes.route) { SchemesScreen() }
            composable(Screen.Plan.route) { PlanScreen(navController = navController) }
            composable(Screen.Ask.route) { AskScreen() }
            composable(Screen.Diagnose.route) {
                DiagnoseScreen(
                    viewModel = diagnosisViewModel,
                    onNavigateToResult = {
                        navController.navigate("diagnosis_result")
                    }
                )
            }
            composable(Screen.Market.route) { MarketScreen() }
            composable("fertilizer_calculator") {
                FertilizerCalculatorScreen(onNavigateBack = { navController.popBackStack() })
            }
            composable("diagnosis_result") {
                val result = diagnosisViewModel.lastResult
                if (result != null) {
                    DiagnosisResultScreen(
                        viewModel = diagnosisViewModel,
                        result = result,
                        onNavigateBack = { navController.popBackStack() })
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No result found. Please go back.")
                    }
                }
            }
        }
    }
}

@Composable
fun BottomBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavScreens = listOf(
        Screen.Schemes,
        Screen.Plan,
        Screen.Ask,
        Screen.Diagnose,
        Screen.Market
    )

    val selectedItemIndex = if (currentRoute == Screen.Home.route) {
        -1
    } else {
        bottomNavScreens.indexOfFirst { it.route == currentRoute }
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp
    ) {
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
                val animatedOffset by animateDpAsState(
                    targetValue = if (isSelected) (-12).dp else 0.dp,
                    label = "offsetAnimation"
                )
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
                            Icon(
                                painterResource(id = screen.icon),
                                contentDescription = screen.label,
                                modifier = Modifier.size(24.dp)
                            )
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


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopBar(navController: NavController, isDarkMode: Boolean, onThemeToggle: () -> Unit, onHomeClick: () -> Unit) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    var isRotating by remember { mutableStateOf(false) }

    val rotationAngle by animateFloatAsState(
        targetValue = if (isRotating) 360f else 0f,
        animationSpec = tween(durationMillis = 800),
        label = "themeIconRotation",
        finishedListener = {
            if (it == 360f) isRotating = false
        }
    )

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.background,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Title Group
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(painter = painterResource(id = R.drawable.ic_logo), contentDescription = "Logo", modifier = Modifier.size(36.dp).clip(CircleShape))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Project Kisan", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            // Actions Group
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onHomeClick) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_top_home),
                        contentDescription = "Home",
                        modifier = Modifier.size(24.dp),
                        tint = if (currentRoute == Screen.Home.route) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = { /* TODO */ }) { Icon(painterResource(id = R.drawable.ic_top_contact), contentDescription = "Contact", modifier = Modifier.size(24.dp)) }

                IconButton(onClick = {
                    onThemeToggle()
                    isRotating = true
                }) {
                    Icon(
                        painter = if (isDarkMode) painterResource(id = R.drawable.ic_top_sun) else painterResource(id = R.drawable.ic_moon),
                        contentDescription = "Toggle Theme",
                        modifier = Modifier
                            .size(24.dp)
                            .rotate(rotationAngle)
                    )
                }

                IconButton(onClick = { /* TODO */ }) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_top_profile),
                        contentDescription = "Profile",
                        modifier = Modifier.size(32.dp).background(MaterialTheme.colorScheme.primary, CircleShape).padding(4.dp),
                        tint = Color.White
                    )
                }
            }
        }
    }
}