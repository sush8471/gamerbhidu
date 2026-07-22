"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { getProfile, updateSteamId } from "@/lib/db/user-db";

export interface SteamProfileSummary {
  steamId: string;
  personaName: string;
  avatar: string;
  profileUrl: string;
}

export interface SteamOwnedGame {
  appId: number;
  name: string;
  playtimeMinutes: number;
}

interface SteamContextType {
  steamId: string | null;
  steamProfile: SteamProfileSummary | null;
  ownedAppIds: number[];
  ownedGames: SteamOwnedGame[];
  loading: boolean;
  error: string | null;
  connectSteam: (inputSteamId: string) => Promise<boolean>;
  disconnectSteam: () => Promise<void>;
  isGameOwned: (steamAppId?: number | null) => boolean;
  refreshSteamData: () => Promise<void>;
}

const SteamContext = createContext<SteamContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_STEAM_ID = "gamerbhidu_steam_id";
const LOCAL_STORAGE_KEY_STEAM_PROFILE = "gamerbhidu_steam_profile";
const LOCAL_STORAGE_KEY_OWNED_APP_IDS = "gamerbhidu_steam_owned_ids";

export function SteamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [steamId, setSteamId] = useState<string | null>(null);
  const [steamProfile, setSteamProfile] = useState<SteamProfileSummary | null>(null);
  const [ownedAppIds, setOwnedAppIds] = useState<number[]>([]);
  const [ownedGames, setOwnedGames] = useState<SteamOwnedGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Steam details from proxy APIs given a Steam ID
  const fetchSteamData = useCallback(async (targetSteamId: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch User profile
      const userRes = await fetch(`/api/steam/user?steamId=${encodeURIComponent(targetSteamId)}`);
      const userData = await userRes.json();

      if (!userRes.ok || !userData.success) {
        throw new Error(userData.error || "Could not fetch Steam user profile");
      }

      const profile: SteamProfileSummary = userData.user;

      // 2. Fetch Owned Games
      const ownedRes = await fetch(`/api/steam/owned?steamId=${encodeURIComponent(targetSteamId)}`);
      const ownedData = await ownedRes.json();

      const appIds: number[] = ownedData.appIds || [];
      const gamesList: SteamOwnedGame[] = ownedData.games || [];

      // Update state
      setSteamId(targetSteamId);
      setSteamProfile(profile);
      setOwnedAppIds(appIds);
      setOwnedGames(gamesList);

      // Cache locally
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY_STEAM_ID, targetSteamId);
        localStorage.setItem(LOCAL_STORAGE_KEY_STEAM_PROFILE, JSON.stringify(profile));
        localStorage.setItem(LOCAL_STORAGE_KEY_OWNED_APP_IDS, JSON.stringify(appIds));
      }

      return true;
    } catch (err: any) {
      console.error("[SteamContext fetch error]:", err);
      setError(err.message || "Failed to load Steam profile");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Steam state on load or user change
  useEffect(() => {
    async function initSteam() {
      setLoading(true);

      // 1. If user logged in, check user_profiles DB
      if (user) {
        const dbProfile = await getProfile(user.id);
        if (dbProfile?.steam_id) {
          await fetchSteamData(dbProfile.steam_id);
          return;
        }
      }

      // 2. Fallback to localStorage for guest users
      if (typeof window !== "undefined") {
        const cachedId = localStorage.getItem(LOCAL_STORAGE_KEY_STEAM_ID);
        const cachedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_STEAM_PROFILE);
        const cachedAppIds = localStorage.getItem(LOCAL_STORAGE_KEY_OWNED_APP_IDS);

        if (cachedId) {
          setSteamId(cachedId);
          if (cachedProfile) {
            try {
              setSteamProfile(JSON.parse(cachedProfile));
            } catch (e) {}
          }
          if (cachedAppIds) {
            try {
              setOwnedAppIds(JSON.parse(cachedAppIds));
            } catch (e) {}
          }

          // Refresh in background
          fetchSteamData(cachedId);
          return;
        }
      }

      setLoading(false);
    }

    initSteam();
  }, [user, fetchSteamData]);

  // Connect Steam ID action
  const connectSteam = useCallback(
    async (inputSteamId: string): Promise<boolean> => {
      const cleanId = inputSteamId.trim();
      if (!cleanId) {
        setError("Please enter a valid Steam ID");
        return false;
      }

      const success = await fetchSteamData(cleanId);
      if (success) {
        // If authenticated, update Supabase user_profiles table
        if (user) {
          await updateSteamId(user.id, cleanId);
        }
      }
      return success;
    },
    [user, fetchSteamData]
  );

  // Disconnect Steam action
  const disconnectSteam = useCallback(async () => {
    setSteamId(null);
    setSteamProfile(null);
    setOwnedAppIds([]);
    setOwnedGames([]);
    setError(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY_STEAM_ID);
      localStorage.removeItem(LOCAL_STORAGE_KEY_STEAM_PROFILE);
      localStorage.removeItem(LOCAL_STORAGE_KEY_OWNED_APP_IDS);
    }

    if (user) {
      await updateSteamId(user.id, null);
    }
  }, [user]);

  // Utility to check if a specific game is owned
  const isGameOwned = useCallback(
    (steamAppId?: number | null): boolean => {
      if (!steamAppId || ownedAppIds.length === 0) return false;
      return ownedAppIds.includes(steamAppId);
    },
    [ownedAppIds]
  );

  const refreshSteamData = useCallback(async () => {
    if (steamId) {
      await fetchSteamData(steamId);
    }
  }, [steamId, fetchSteamData]);

  const value = useMemo<SteamContextType>(
    () => ({
      steamId,
      steamProfile,
      ownedAppIds,
      ownedGames,
      loading,
      error,
      connectSteam,
      disconnectSteam,
      isGameOwned,
      refreshSteamData,
    }),
    [
      steamId,
      steamProfile,
      ownedAppIds,
      ownedGames,
      loading,
      error,
      connectSteam,
      disconnectSteam,
      isGameOwned,
      refreshSteamData,
    ]
  );

  return <SteamContext.Provider value={value}>{children}</SteamContext.Provider>;
}

export function useSteam(): SteamContextType {
  const context = useContext(SteamContext);
  if (!context) {
    throw new Error("useSteam must be used within a SteamProvider");
  }
  return context;
}
