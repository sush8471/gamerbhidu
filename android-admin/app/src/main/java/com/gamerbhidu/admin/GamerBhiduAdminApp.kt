package com.gamerbhidu.admin

import android.app.Application
import coil.Coil
import coil.ImageLoader
import coil.disk.DiskCache
import coil.memory.MemoryCache
import coil.request.CachePolicy
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage
import kotlinx.serialization.json.Json

import okhttp3.ConnectionPool
import okhttp3.Dispatcher
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

/**
 * Application class — initialises Supabase singleton and Coil image loader.
 */
class GamerBhiduAdminApp : Application() {

    companion object {
        /** Supabase client singleton — same project as the website */
        val supabase by lazy {
            createSupabaseClient(
                supabaseUrl = BuildConfig.SUPABASE_URL,
                supabaseKey = BuildConfig.SUPABASE_ANON_KEY
            ) {
                install(Auth)
                install(Postgrest)
                install(Storage)
                install(Realtime)
            }
        }

        /** Shared JSON serializer */
        val json = Json {
            ignoreUnknownKeys = true
            isLenient = true
            encodeDefaults = true
        }
    }

    override fun onCreate() {
        super.onCreate()
        setupCoil()
    }

    /**
     * Configures Coil globally with:
     *  - High-concurrency OkHttpClient (24 requests per host) to prevent queue bottlenecks
     *  - respectCacheHeaders(false) so Supabase Storage images with 'Cache-Control: no-cache' are still cached on disk
     *  - 25% of RAM as memory cache → decoded bitmaps stay in RAM while scrolling
     *  - 512 MB disk cache          → images survive app restarts, no re-downloads
     *  - crossfade(200ms)           → smooth fade-in
     *  - allowHardware(true)        → GPU-backed bitmaps for fastest rendering
     */
    private fun setupCoil() {
        val okHttpClient = OkHttpClient.Builder()
            .dispatcher(Dispatcher().apply {
                maxRequests = 64
                maxRequestsPerHost = 24
            })
            .connectionPool(ConnectionPool(16, 5, TimeUnit.MINUTES))
            .connectTimeout(12, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        val imageLoader = ImageLoader.Builder(this)
            .okHttpClient(okHttpClient)
            .respectCacheHeaders(false)
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.25) // 25% of available RAM
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(cacheDir.resolve("coil_image_cache"))
                    .maxSizeBytes(512L * 1024 * 1024) // 512 MB
                    .build()
            }
            .memoryCachePolicy(CachePolicy.ENABLED)
            .diskCachePolicy(CachePolicy.ENABLED)
            .crossfade(200)
            .allowHardware(true)
            .build()

        Coil.setImageLoader(imageLoader)
    }
}
