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

  try {
    const apiKey = process.env.STEAM_API_KEY;

    if (apiKey) {
      const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;
      const res = await fetch(url, { next: { revalidate: 600 } });

      if (res.ok) {
        const json = await res.json();
        const games = json?.response?.games || [];

        const ownedGames = games.map((g: any) => ({
          appId: g.appid,
          name: g.name,
          playtimeMinutes: g.playtime_forever || 0,
          imgIconUrl: g.img_icon_url,
        }));

        const appIds = ownedGames.map((g: any) => g.appId);

        return NextResponse.json({
          success: true,
          count: ownedGames.length,
          appIds,
          games: ownedGames,
        });
      }
    }

    // Fallback if API key missing or returns non-ok (e.g. private profile)
    return NextResponse.json({
      success: true,
      count: 0,
      appIds: [],
      games: [],
      isPrivate: true,
      message: "Profile games may be private or API key unavailable",
    });
  } catch (error) {
    console.error("[Steam Owned Proxy Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch owned Steam games" },
      { status: 500 }
    );
  }
}
