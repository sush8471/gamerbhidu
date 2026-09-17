# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in the Android SDK proguard-android-optimize.txt file.

# Keep Kotlin serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.gamerbhidu.admin.**$$serializer { *; }
-keepclassmembers class com.gamerbhidu.admin.** {
    *** Companion;
}
-keepclasseswithmembers class com.gamerbhidu.admin.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep Supabase
-keep class io.github.jan.supabase.** { *; }
-dontwarn io.github.jan.supabase.**

# Keep Ktor
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**

# Keep OkHttp (used by Ktor Android engine)
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep Compose
-keep class androidx.compose.** { *; }

# Keep data models (serialized to/from JSON)
-keep class com.gamerbhidu.admin.data.model.** { *; }
