plugins {
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.kotlinAndroid) apply false
    alias(libs.plugins.google.services) apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22" apply false

}
