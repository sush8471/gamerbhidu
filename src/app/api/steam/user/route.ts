import { NextRequest, NextResponse } from "next/server";

/**
 * Extracts SteamID64 or vanity username from input string or full URL.
 * Examples:
 * - "https://steamcommunity.com/id/gamerflydon/" -> { type: 'vanity', value: 'gamerflydon' }
 * - "https://steamcommunity.com/profiles/76561198123456789" -> { type: 'id64', value: '76561198123456789' }
 * - "gamerflydon" -> { type: 'vanity', value: 'gamerflydon' }
 * - "76561198123456789" -> { type: 'id64', value: '76561198123456789' }
 */
function parseSteamInput(input: string): { type: "id64" | "vanity"; value: string } {
  const trimmed = input.trim();

  // Match /profiles/76561198...
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profileMatch) {
    return { type: "id64", value: profileMatch[1] };
  }

  // Match /id/vanityname...
  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([^\/]+)/i);
  if (idMatch) {
    return { type: "vanity", value: idMatch[1] };
  }

  // Pure 17-digit numeric
  if (/^\d{17}$/.test(trimmed)) {
    return { type: "id64", value: trimmed };
  }

  // Clean alphanumeric vanity string
  const cleanVanity = trimmed.replace(/^https?:\/\//i, "").replace(/[\/]+$/, "");
  return { type: "vanity", value: cleanVanity };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawInput = searchParams.get("steamId") || searchParams.get("input");

  if (!rawInput) {
    return NextResponse.json(
      { error: "Steam ID or Profile URL is required" },
      { status: 400 }
    );
  }

  const parsed = parseSteamInput(rawInput);
  const apiKey = process.env.STEAM_API_KEY;
  let targetSteamId64: string | null = null;

  try {
    // 1. Resolve vanity URL to SteamID64 if needed
    if (parsed.type === "vanity") {
      if (apiKey) {
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(parsed.value)}`;
        const res = await fetch(resolveUrl, { next: { revalidate: 300 } });
        if (res.ok) {
          const json = await res.json();
          if (json?.response?.success === 1 && json?.response?.steamid) {
            targetSteamId64 = json.response.steamid;
          }
        }
      }

      // Fallback via XML if API key resolution failed
      if (!targetSteamId64) {
        const xmlUrl = `https://steamcommunity.com/id/${encodeURIComponent(parsed.value)}?xml=1`;
        const xmlRes = await fetch(xmlUrl, { next: { revalidate: 300 } });
        if (xmlRes.ok) {
          const xmlText = await xmlRes.text();
          const match = xmlText.match(/<steamID64>(\d+)<\/steamID64>/);
          if (match) {
            targetSteamId64 = match[1];
          }
        }
      }
    } else {
      targetSteamId64 = parsed.value;
    }

    if (!targetSteamId64) {
      return NextResponse.json(
        { error: `Could not resolve Steam profile "${parsed.value}"` },
        { status: 404 }
      );
    }

    // 2. Fetch Player Summary given resolved targetSteamId64
    if (apiKey) {
      const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${targetSteamId64}`;
      const res = await fetch(summaryUrl, { next: { revalidate: 300 } });

      if (res.ok) {
        const json = await res.json();
        const player = json?.response?.players?.[0];

        if (player) {
          return NextResponse.json({
            success: true,
            user: {
              steamId: player.steamid,
              personaName: player.personaname,
              profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${player.steamid}`,
              avatar: player.avatarfull || player.avatarmedium || player.avatar,
              realName: player.realname || null,
              locCountryCode: player.loccountrycode || null,
              communityVisibilityState: player.communityvisibilitystate, // 3 = public
            },
          });
        }
      }
    }

    // Fallback: fetch profile XML for resolved steamId64
    const xmlUrl = `https://steamcommunity.com/profiles/${targetSteamId64}?xml=1`;
    const xmlRes = await fetch(xmlUrl, { next: { revalidate: 300 } });

    if (xmlRes.ok) {
      const xmlText = await xmlRes.text();
      const personaNameMatch = xmlText.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/) || xmlText.match(/<steamID>(.*?)<\/steamID>/);
      const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) || xmlText.match(/<avatarFull>(.*?)<\/avatarFull>/);
      const privacyMatch = xmlText.match(/<privacyState>(.*?)<\/privacyState>/);

      return NextResponse.json({
        success: true,
        user: {
          steamId: targetSteamId64,
          personaName: personaNameMatch ? personaNameMatch[1] : `Steam User (${targetSteamId64.slice(-4)})`,
          profileUrl: `https://steamcommunity.com/profiles/${targetSteamId64}`,
          avatar: avatarMatch ? avatarMatch[1] : "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
          communityVisibilityState: privacyMatch && privacyMatch[1] === "public" ? 3 : 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        steamId: targetSteamId64,
        personaName: `Steam User (${targetSteamId64.slice(-4)})`,
        profileUrl: `https://steamcommunity.com/profiles/${targetSteamId64}`,
        avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
        communityVisibilityState: 3,
      },
    });
  } catch (error) {
    console.error("[Steam User Proxy Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch Steam user profile" },
      { status: 500 }
    );
  }
}
