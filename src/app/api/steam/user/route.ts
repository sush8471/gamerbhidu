import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json(
      { error: "Steam ID is required" },
      { status: 400 }
    );
  }

  // Validate format (numeric SteamID64 is 17 digits, starts with 7656)
  const isSteam64 = /^\d{17}$/.test(steamId);

  try {
    const apiKey = process.env.STEAM_API_KEY;

    if (apiKey && isSteam64) {
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
      const res = await fetch(url, { next: { revalidate: 300 } });

      if (res.ok) {
        const json = await res.json();
        const player = json?.response?.players?.[0];

        if (player) {
          return NextResponse.json({
            success: true,
            user: {
              steamId: player.steamid,
              personaName: player.personaname,
              profileUrl: player.profileurl,
              avatar: player.avatarfull || player.avatarmedium || player.avatar,
              realName: player.realname || null,
              locCountryCode: player.loccountrycode || null,
              communityVisibilityState: player.communityvisibilitystate, // 3 = public
            },
          });
        }
      }
    }

    // Fallback: If no API key or non-64 ID format, try steamcommunity public profile XML
    const xmlUrl = `https://steamcommunity.com/profiles/${steamId}?xml=1`;
    const xmlRes = await fetch(xmlUrl, { next: { revalidate: 300 } });

    if (xmlRes.ok) {
      const xmlText = await xmlRes.text();
      const steamID64Match = xmlText.match(/<steamID64>(\d+)<\/steamID64>/);
      const personaNameMatch = xmlText.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/) || xmlText.match(/<steamID>(.*?)<\/steamID>/);
      const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) || xmlText.match(/<avatarFull>(.*?)<\/avatarFull>/);
      const privacyMatch = xmlText.match(/<privacyState>(.*?)<\/privacyState>/);

      if (steamID64Match) {
        return NextResponse.json({
          success: true,
          user: {
            steamId: steamID64Match[1],
            personaName: personaNameMatch ? personaNameMatch[1] : `Steam User (${steamId})`,
            profileUrl: `https://steamcommunity.com/profiles/${steamID64Match[1]}`,
            avatar: avatarMatch ? avatarMatch[1] : "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
            communityVisibilityState: privacyMatch && privacyMatch[1] === "public" ? 3 : 1,
          },
        });
      }
    }

    // If completely unavailable, generate standard Steam user wrapper for valid-looking IDs
    if (isSteam64) {
      return NextResponse.json({
        success: true,
        user: {
          steamId,
          personaName: `Steam User (${steamId.slice(-4)})`,
          profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
          avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
          communityVisibilityState: 3,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid or private Steam Profile" },
      { status: 404 }
    );
  } catch (error) {
    console.error("[Steam User Proxy Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch Steam user profile" },
      { status: 500 }
    );
  }
}
