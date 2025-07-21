package com.projectkisan.androidapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.projectkisan.androidapp.ui.theme.GreenPrimary
import com.projectkisan.androidapp.ui.theme.ProjectKisanTheme
import com.projectkisan.androidapp.ui.theme.TextMutedLight
import com.projectkisan.androidapp.ui.theme.TextPrimaryLight
import androidx.navigation.NavGraph.Companion.findStartDestination

// Screen definitions are unchanged
sealed class Screen(val route: String, val label: String, val icon: Int) {
    object Home : Screen("home", "Home", R.drawable.ic_home)
    object Plan : Screen("plan", "Plan", R.drawable.ic_plan)
    object Ask : Screen("ask", "Ask", R.drawable.ic_ask)
    object Diagnose : Screen("diagnose", "Diagnose", R.drawable.ic_diagnose)
    object Market : Screen("market", "Market", R.drawable.ic_market)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ProjectKisanTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    var selectedItemIndex by rememberSaveable { mutableStateOf(2) } // Ask is index 2

    val screens = listOf(
        Screen.Home,
        Screen.Plan,
        Screen.Ask,
        Screen.Diagnose,
        Screen.Market
    )

    Scaffold(
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp) // Increased height for more space
                        .clip(BubbleNavigationBarShape(selectedItemIndex, screens.size))
                        .background(MaterialTheme.colorScheme.surface),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.Top // Align items to the top
                ) {
                    screens.forEachIndexed { index, screen ->
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
                                selectedItemIndex = index
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
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Ask.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) { HomeScreen() }
            composable(Screen.Plan.route) { PlanScreen() }
            composable(Screen.Ask.route) { AskScreen() }
            composable(Screen.Diagnose.route) { DiagnoseScreen() }
            composable(Screen.Market.route) { MarketScreen() }
        }
    }
}