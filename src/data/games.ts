export interface Game {
  id: string;
  steamAppId?: number; // Steam App ID for API integration
  title: string;
  image: string;
  price: number | "N/A"; // Numeric for released games, "N/A" for upcoming
  originalPrice?: number;
  discount?: string;
  genre: string[]; // Array for multiple genres
  tags: string[]; // For better search (abbreviations, alternate names, series)
  series?: string; // Game series name for grouping
  description?: string;
}

// Truncated static reference database for compilation safety and local tests
export const GAMES_DATABASE: Game[] = [
  {
    id: "gta-v",
    steamAppId: 271590,
    title: "Grand Theft Auto V",
    image: "/gta-v.jpg",
    price: 299,
    originalPrice: 899,
    discount: "-67%",
    genre: ["Action", "Adventure", "Open-World"],
    tags: ["gta", "gta 5", "gta v", "grand theft auto", "rockstar", "action", "open world", "crime"],
    series: "Grand Theft Auto",
  },
  {
    id: "gta-iv",
    steamAppId: 2215910,
    title: "Grand Theft Auto IV",
    image: "/gta-iv.png",
    price: 199,
    originalPrice: 799,
    discount: "-69%",
    genre: ["Action", "Adventure", "Open-World"],
    tags: ["gta", "gta 4", "gta iv", "grand theft auto", "rockstar", "action", "open world", "crime"],
    series: "Grand Theft Auto",
  },
  {
    id: "ac-valhalla",
    steamAppId: 2208920,
    title: "Assassin's Creed Valhalla",
    image: "/ac-valhalla.jpg",
    price: 279,
    originalPrice: 1499,
    discount: "-80%",
    genre: ["Action", "Adventure", "RPG"],
    tags: ["ac", "assassins creed", "valhalla", "viking", "ubisoft", "action", "rpg"],
    series: "Assassin's Creed",
  },
  {
    id: "ac-odyssey",
    steamAppId: 812140,
    title: "Assassin's Creed Odyssey",
    image: "/ac-odyssey.jpg",
    price: 249,
    originalPrice: 1299,
    discount: "-77%",
    genre: ["Action", "Adventure", "RPG"],
    tags: ["ac", "assassins creed", "odyssey", "greece", "ubisoft", "action", "rpg"],
    series: "Assassin's Creed",
  },
  {
    id: "ac-origins",
    steamAppId: 582160,
    title: "Assassin's Creed Origins",
    image: "/ac-origins.jpg",
    price: 229,
    originalPrice: 1299,
    discount: "-77%",
    genre: ["Action", "Adventure", "RPG"],
    tags: ["ac", "assassins creed", "origins", "egypt", "ubisoft", "action", "rpg"],
    series: "Assassin's Creed",
  }
];
