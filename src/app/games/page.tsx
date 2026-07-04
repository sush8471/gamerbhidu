"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Footer from "@/components/sections/footer";
import { SlidersHorizontal, X, ShoppingCart, Check } from "lucide-react";
import SteamRushNavbar from "@/components/sections/steamrush-navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { GAMES_DATABASE } from "@/data/games";

type Game = {
  id: number;
  title: string;
  image: string;
  price: string;
  originalPrice: string;
  discount: string;
  type: string;
  description: string;
  href?: string;
};

const GAMES: Game[] = [
  {
    id: 1,
    title: "Horizon Zero Dawn",
    image: "/horizon-zero-dawn.png",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Hunt robotic creatures in post-apocalyptic world",
  },
  {
    id: 2,
    title: "Horizon Forbidden West",
    image: "/horizon-forbidden-west.jpg",
    price: "₹299",
    originalPrice: "₹1,299",
    discount: "-77%",
    type: "Action-Adventure / Open-World",
    description: "Continue Aloy's journey in the forbidden west",
  },
  {
    id: 3,
    title: "Ghost of Tsushima",
    image: "/ghost-of-tsushima.jpg",
    price: "₹299",
    originalPrice: "₹1,199",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Samurai adventure in feudal Japan",
  },
  {
    id: 4,
    title: "Mafia: Definitive Edition",
    image: "/mafia-definitive-edition.jpg",
    price: "₹199",
    originalPrice: "₹799",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Rise through the ranks of the Italian Mafia",
  },
  {
    id: 5,
    title: "Grand Theft Auto IV: Complete Edition",
    image: "/gta-iv.png",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Action-Adventure / Open-World",
    description: "Niko Bellic's story in Liberty City",
  },
  {
    id: 6,
    title: "Grand Theft Auto V",
    image: "/gta-v.jpg",
    price: "₹299",
    originalPrice: "₹899",
    discount: "-67%",
    type: "Action-Adventure / Open-World",
    description: "Crime spree across Los Santos",
    href: "/games/gta-v",
  },
  {
    id: 7,
    title: "Red Dead Redemption 2",
    image: "/red-dead-redemption-2.jpg",
    price: "₹299",
    originalPrice: "₹899",
    discount: "-67%",
    type: "Action-Adventure / Open-World",
    description: "Epic Western adventure in stunning open world",
  },
  {
    id: 8,
    title: "Marvel's Spider-Man Remastered",
    image: "/spiderman-remastered.png",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Swing through New York as Spider-Man",
  },
  {
    id: 9,
    title: "Marvel's Spider-Man 2",
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1765891423972.png?width=8000&height=8000&resize=contain",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Play as both Peter Parker and Miles Morales",
  },
  {
    id: 10,
    title: "Marvel's Spider-Man: Miles Morales",
    image: "/spiderman-miles-morales.png",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Miles Morales takes on new villains",
  },
  {
    id: 11,
    title: "Days Gone",
    image: "/days-gone.jpg",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Survive the zombie apocalypse on your bike",
  },
  {
    id: 12,
    title: "Sleeping Dogs: Definitive Edition",
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Sleeping-Dogs-1765910635172.jpg?width=8000&height=8000&resize=contain",
    price: "₹149",
    originalPrice: "₹599",
    discount: "-75%",
    type: "Action-Adventure / Open-World",
    description: "Undercover cop in Hong Kong's criminal underworld",
  },
  {
    id: 13,
    title: "Batman: Arkham Origins",
    image: "/batman-arkham-origins.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Batman's early years fighting Gotham's villains",
  },
  {
    id: 14,
    title: "God of War",
    image: "/god-of-war.jpg",
    price: "₹299",
    originalPrice: "₹899",
    discount: "-67%",
    type: "Action-Adventure / Open-World",
    description: "Norse mythology meets brutal action",
  },
  {
    id: 15,
    title: "God of War Ragnarök",
    image: "/god-of-war-ragnarok.jpg",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Kratos and Atreus face Ragnarök",
  },
  {
    id: 16,
    title: "A Plague Tale: Requiem",
    image: "/plague-tale-requiem.jpg",
    price: "₹219",
    originalPrice: "₹1,199",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Survive the plague-ridden medieval world",
  },
  {
    id: 17,
    title: "A Plague Tale: Innocence",
    image: "/plague-tale-innocence.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Action-Adventure / Open-World",
    description: "Sister and brother escape the Inquisition",
  },
  {
    id: 18,
    title: "Rise of the Tomb Raider",
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Rise-of-The-Tomb-Raider-1765910634829.jpg?width=8000&height=8000&resize=contain",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Action-Adventure / Open-World",
    description: "Lara Croft's Siberian adventure",
  },
  {
    id: 19,
    title: "Shadow of the Tomb Raider",
    image: "/shadow-tomb-raider.png",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Action-Adventure / Open-World",
    description: "Lara's defining moment in South America",
  },
  {
    id: 20,
    title: "The Last of Us Part I",
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/The-Last-of-Us-Part-1-1765910635204.jpg?width=8000&height=8000&resize=contain",
    price: "₹299",
    originalPrice: "₹1,599",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Rebuilt from the ground up for PC",
  },
  {
    id: 21,
    title: "The Last of Us Part II",
    image: "/last-of-us-part-2.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Ellie's journey of revenge and redemption",
  },
  {
    id: 21.5,
    title: "Uncharted: Legacy of Thieves Collection",
    image: "/uncharted-legacy-thieves.jpg",
    price: "₹299",
    originalPrice: "₹1,299",
    discount: "-77%",
    type: "Action-Adventure / Open-World",
    description: "Nathan Drake's greatest adventures remastered",
  },
  {
    id: 189,
    title: "Black Myth: Wukong",
    image: "/black-myth-wukong.jpg",
    price: "₹299",
    originalPrice: "₹1,899",
    discount: "-84%",
    type: "Action-Adventure / Open-World",
    description: "Journey to the West inspired action RPG",
  },
  {
    id: 190,
    title: "Assassin's Creed Shadows",
    image: "/ac-shadows.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Feudal Japan stealth adventure",
  },
  {
    id: 157,
    title: "Assassin's Creed Mirage",
    image: "/ac-mirage.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Return to the roots of Assassins",
  },
  {
    id: 158,
    title: "Assassin's Creed Valhalla",
    image: "/ac-valhalla.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Viking conquest of England",
  },
  {
    id: 159,
    title: "Assassin's Creed Odyssey",
    image: "/ac-odyssey.jpg",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Odyssey in Ancient Greece",
  },
  {
    id: 160,
    title: "Assassin's Creed Origins",
    image: "/ac-origins.jpg",
    price: "₹229",
    originalPrice: "₹1,199",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Origins of the Brotherhood in Egypt",
  },
  {
    id: 160.5,
    title: "Assassin's Creed Unity",
    image: "/ac-unity.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "French Revolution parkour adventure",
  },
  {
    id: 161,
    title: "Far Cry 6",
    image: "/far-cry-6.jpg",
    price: "₹269",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Fight dictator in tropical paradise",
  },
  {
    id: 162,
    title: "Far Cry 5",
    image: "/far-cry-5.jpg",
    price: "₹239",
    originalPrice: "₹1,199",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Cult warfare in Montana",
  },
  {
    id: 163,
    title: "Far Cry New Dawn",
    image: "/far-cry-new-dawn.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Action-Adventure / Open-World",
    description: "Post-apocalyptic Hope County",
  },
  {
    id: 164,
    title: "Far Cry Primal",
    image: "/far-cry-primal.jpg",
    price: "₹209",
    originalPrice: "₹999",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Stone Age survival",
  },
  {
    id: 164.3,
    title: "Far Cry 4",
    image: "/far-cry-4.jpg",
    price: "₹229",
    originalPrice: "₹1,099",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Himalayan revolution warfare",
  },
  {
    id: 164.6,
    title: "Far Cry 3",
    image: "/far-cry-3.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Island insanity with Vaas",
  },
  {
    id: 175,
    title: "Prince of Persia: The Lost Crown",
    image: "/prince-of-persia-lost-crown.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Return of classic franchise",
  },
  {
    id: 176,
    title: "Watch Dogs Legion",
    image: "/watch-dogs-legion.jpg",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Hack London, recruit anyone",
  },
  {
    id: 177,
    title: "Watch Dogs 2",
    image: "/watch-dogs-2.jpg",
    price: "₹219",
    originalPrice: "₹1,199",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Hack San Francisco",
  },
  {
    id: 178,
    title: "Watch Dogs",
    image: "/watch-dogs.jpg",
    price: "₹189",
    originalPrice: "₹899",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Original hacking adventure in Chicago",
  },
  {
    id: 183,
    title: "Immortals Fenyx Rising",
    image: "/immortals-fenyx-rising.png",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Greek mythology open-world adventure",
  },
  {
    id: 184,
    title: "Star Wars Jedi: Survivor",
    image: "/star-wars-jedi-survivor.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Cal Kestis continues his journey",
  },
  {
    id: 185,
    title: "Star Wars Jedi: Fallen Order",
    image: "/star-wars-jedi-fallen-order.jpg",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Become a Jedi in the aftermath of Order 66",
  },
  {
    id: 186,
    title: "Marvel's Avengers",
    image: "/marvels-avengers.jpg",
    price: "₹219",
    originalPrice: "₹1,199",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Assemble Earth's Mightiest Heroes",
  },
  {
    id: 187,
    title: "Marvel's Guardians of the Galaxy",
    image: "/guardians-of-the-galaxy.png",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Action-Adventure / Open-World",
    description: "Lead the Guardians through cosmos",
  },
  {
    id: 193,
    title: "Hogwarts Legacy",
    image: "/hogwarts-legacy.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Experience magic at Hogwarts in 1800s",
  },
  {
    id: 194,
    title: "Star Wars Outlaws",
    image: "/star-wars-outlaws.jpg",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Scoundrel's journey in Star Wars galaxy",
  },
  {
    id: 195,
    title: "Avatar: Frontiers of Pandora",
    image: "/avatar-frontiers-of-pandora.jpg",
    price: "₹299",
    originalPrice: "₹1,799",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Explore the Western Frontier of Pandora",
  },
  {
    id: 196,
    title: "Dragon's Dogma 2",
    image: "/dragons-dogma-2.jpg",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Epic fantasy action-RPG adventure",
  },
  {
    id: 197,
    title: "Monster Hunter Wilds",
    image: "/monster-hunter-wilds.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Hunt massive creatures in untamed lands",
  },
  {
    id: 198,
    title: "Marvel's Midnight Suns",
    image: "/marvels-midnight-suns.jpg",
    price: "₹279",
    originalPrice: "₹1,599",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Tactical RPG with Marvel heroes",
  },
  {
    id: 199,
    title: "Wild Hearts",
    image: "/wild-hearts.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Action-Adventure / Open-World",
    description: "Hunt giant nature-infused beasts",
  },
  {
    id: 200,
    title: "Hi-Fi Rush",
    image: "/hi-fi-rush.jpg",
    price: "₹249",
    originalPrice: "₹1,199",
    discount: "-79%",
    type: "Action-Adventure / Open-World",
    description: "Rhythm-based action adventure",
  },
  {
    id: 201,
    title: "Stellar Blade Complete Edition",
    image: "/stellar-blade.jpg",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Stylish sci-fi action adventure",
  },
  {
    id: 202,
    title: "Mafia: The Old Country",
    image: "/mafia-the-old-country.jpg",
    price: "₹299",
    originalPrice: "₹1,799",
    discount: "-83%",
    type: "Action-Adventure / Open-World",
    description: "Origins of organized crime in Sicily",
  },
  {
    id: 203,
    title: "The First Berserker: Khazan",
    image: "/the-first-berserker-khazan.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Hardcore action RPG from DNF Universe",
  },
  {
    id: 204,
    title: "Dead Rising Deluxe Remaster",
    image: "/dead-rising-deluxe-remaster.jpg",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Remastered zombie mall mayhem",
  },
  {
    id: 205,
    title: "Atomfall",
    image: "/atomfall.png",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Survival in post-nuclear Britain",
  },
  {
    id: 206,
    title: "Redfall",
    image: "/redfall.jpg",
    price: "₹259",
    originalPrice: "₹1,399",
    discount: "-81%",
    type: "Action-Adventure / Open-World",
    description: "Co-op vampire hunting in open world",
  },

  {
    id: 22,
    title: "Call of Duty 4: Modern Warfare",
    image: "/cod-4-mw.png",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "The game that defined modern shooters",
  },
  {
    id: 22.1,
    title: "Call of Duty: Modern Warfare 2 (2009)",
    image: "/cod-mw2.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "The legendary sequel to Modern Warfare",
  },
  {
    id: 22.2,
    title: "Call of Duty: Modern Warfare 3 (2011)",
    image: "/cod-mw3.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "The epic conclusion to the MW trilogy",
  },
  {
    id: 22.3,
    title: "Call of Duty: World at War",
    image: "/cod-waw.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "Gritty WWII combat in the Pacific",
  },
  {
    id: 22.4,
    title: "Call of Duty: Black Ops",
    image: "/cod-black-ops.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "Covert operations during the Cold War",
  },
  {
    id: 22.5,
    title: "Call of Duty: Black Ops II",
    image: "/cod-black-ops-2.jpg",
    price: "₹99",
    originalPrice: "₹1,999",
    discount: "-95%",
    type: "FPS / TPS",
    description: "Future warfare and branching storylines",
  },
  {
    id: 22.6,
    title: "Call of Duty: Ghosts",
    image: "/cod-ghosts.jpg",
    price: "₹99",
    originalPrice: "₹1,999",
    discount: "-95%",
    type: "FPS / TPS",
    description: "Fight for a crippled nation",
  },
  {
    id: 22.7,
    title: "Call of Duty 2",
    image: "/cod-2.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "Intense WWII battles",
  },
  {
    id: 22.8,
    title: "Call of Duty (2003)",
    image: "/cod-1.jpg",
    price: "₹99",
    originalPrice: "₹999",
    discount: "-90%",
    type: "FPS / TPS",
    description: "Where it all began",
  },
  {
    id: 23,
    title: "Dying Light",
    image: "/dying-light.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "FPS / TPS",
    description: "Parkour and zombies in an open world",
  },
  {
    id: 24,
    title: "Dying Light 2",
    image: "/dying-light-2.jpg",
    price: "₹249",
    originalPrice: "₹1,199",
    discount: "-79%",
    type: "FPS / TPS",
    description: "Shape the fate of The City in the sequel",
  },
  {
    id: 25,
    title: "Back 4 Blood",
    image: "/back-4-blood.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "FPS / TPS",
    description: "Co-op zombie shooter from creators of L4D",
  },
  {
    id: 191,
    title: "Dying Light: The Beast",
    image: "/dying-light-the-beast.jpg",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "FPS / TPS",
    description: "Intense zombie survival in brutal world",
  },
  {
    id: 26,
    title: "Left 4 Dead 2",
    image: "/left-4-dead-2.jpg",
    price: "₹99",
    originalPrice: "₹399",
    discount: "-75%",
    type: "FPS / TPS",
    description: "Classic co-op zombie survival",
  },
  {
    id: 27,
    title: "Dead Island: Definitive Edition",
    image: "/dead-island.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "FPS / TPS",
    description: "Tropical island zombie apocalypse",
  },
  {
    id: 27.5,
    title: "Dead Island 2",
    image: "/dead-island-2.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "FPS / TPS",
    description: "Zombie slayer saga continues",
  },
  {
    id: 28,
    title: "Zombie Army Trilogy",
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Zombie-Army-Trilogy-1765910635407.jpg?width=8000&height=8000&resize=contain",
    price: "₹179",
    originalPrice: "₹899",
    discount: "-80%",
    type: "FPS / TPS",
    description: "Fight Hitler's undead army",
  },
  {
    id: 29,
    title: "State of Decay 2: Juggernaut Edition",
    image: "/state-of-decay-2.png",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "FPS / TPS",
    description: "Build a community and survive the zombie outbreak",
  },
  {
    id: 30,
    title: "Ready or Not",
    image: "/ready-or-not.jpg",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "FPS / TPS",
    description: "Tactical SWAT operations simulator",
  },
  {
    id: 31,
    title: "Hitman: World of Assassination",
    image: "/hitman-world-assassination.jpg",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "FPS / TPS",
    description: "Complete Hitman trilogy experience",
  },
  {
    id: 32,
    title: "Cyberpunk 2077",
    image: "/cyberpunk-2077.jpg",
    price: "₹299",
    originalPrice: "₹1,299",
    discount: "-77%",
    type: "FPS / TPS",
    description: "Futuristic RPG set in Night City",
  },
  {
    id: 33,
    title: "Starfield",
    image: "/starfield.jpg",
    price: "₹299",
    originalPrice: "₹1,799",
    discount: "-83%",
    type: "FPS / TPS",
    description: "Explore the vast reaches of space",
  },
  {
    id: 34,
    title: "Stalker 2: Heart of Chernobyl",
    image: "/stalker-2.jpg",
    price: "₹279",
    originalPrice: "₹1,599",
    discount: "-83%",
    type: "FPS / TPS",
    description: "Return to the Chernobyl Exclusion Zone",
  },
  {
    id: 207,
    title: "Atomic Heart",
    image: "/atomic-heart.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "FPS / TPS",
    description: "Soviet utopia gone wrong with robots",
  },
  {
    id: 208,
    title: "Borderlands 4",
    image: "/borderlands-4.jpg",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "FPS / TPS",
    description: "Loot-shooter mayhem returns",
  },
  {
    id: 209,
    title: "Sniper Elite: Resistance",
    image: "/sniper-elite-resistance.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "FPS / TPS",
    description: "New chapter in tactical sniping series",
  },
  {
    id: 210,
    title: "Star Wars: Squadrons",
    image: "/star-wars-squadrons.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "FPS / TPS",
    description: "Pilot starfighters in intense dogfights",
  },

  {
    id: 35,
    title: "Elden Ring",
    image: "/elden-ring.jpg",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "RPG",
    description: "Massive fantasy world from FromSoftware",
  },
  {
    id: 36,
    title: "Dark Souls III",
    image: "/dark-souls-3.jpg",
    price: "₹219",
    originalPrice: "₹999",
    discount: "-78%",
    type: "RPG",
    description: "Face the darkness in this challenging RPG",
  },
  {
    id: 37,
    title: "The Witcher 3: Wild Hunt",
    image: "/witcher-3.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "RPG",
    description: "Hunt monsters in a vast fantasy world",
  },
  {
    id: 38,
    title: "Sekiro: Shadows Die Twice",
    image: "/sekiro.jpg",
    price: "₹209",
    originalPrice: "₹799",
    discount: "-74%",
    type: "RPG",
    description: "Samurai action with punishing combat",
  },
  {
    id: 39,
    title: "No Man's Sky",
    image: "/no-mans-sky.png",
    price: "₹219",
    originalPrice: "₹999",
    discount: "-78%",
    type: "RPG",
    description: "Explore infinite procedurally generated universe",
  },
  {
    id: 40,
    title: "Detroit: Become Human",
    image: "/detroit-become-human.png",
    price: "₹209",
    originalPrice: "₹899",
    discount: "-77%",
    type: "RPG",
    description: "Shape the future of androids and humanity",
  },
  {
    id: 211,
    title: "Persona 3 Reload",
    image: "/persona-3-reload.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "RPG",
    description: "Remastered JRPG with social simulation",
  },
  {
    id: 212,
    title: "Persona 4 Arena Ultimax",
    image: "/persona-4-arena-ultimax.jpg",
    price: "₹249",
    originalPrice: "₹1,199",
    discount: "-79%",
    type: "RPG",
    description: "Fighting game spin-off of Persona 4",
  },
  {
    id: 213,
    title: "Persona 5 Royal",
    image: "/persona-5-royal.jpg",
    price: "₹329",
    originalPrice: "₹1,799",
    discount: "-82%",
    type: "RPG",
    description: "Definitive Phantom Thieves experience",
  },
  {
    id: 214,
    title: "Persona 5 Strikers",
    image: "/persona-5-strikers.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "RPG",
    description: "Action RPG sequel to Persona 5",
  },
  {
    id: 215,
    title: "Persona 5 Tactica",
    image: "/persona-5-tactica.png",
    price: "₹269",
    originalPrice: "₹1,399",
    discount: "-81%",
    type: "RPG",
    description: "Tactical RPG in Persona universe",
  },
  {
    id: 216,
    title: "Dragon Quest I & II HD-2D Remake",
    image: "/dragon-quest-1-2-hd2d.png",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "RPG",
    description: "Classic Dragon Quest remade in HD-2D",
  },
  {
    id: 217,
    title: "Final Fantasy XV",
    image: "/final-fantasy-xv.jpg",
    price: "₹299",
    originalPrice: "₹1,599",
    discount: "-81%",
    type: "RPG",
    description: "Fantasy based on reality road trip RPG",
  },
  {
    id: 218,
    title: "Final Fantasy Tactics: The Ivalice Chronicles",
    image: "/final-fantasy-tactics.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "RPG",
    description: "Tactical RPG masterpiece collection",
  },
  {
    id: 219,
    title: "Onimusha 2: Samurai's Destiny",
    image: "/onimusha-2.jpg",
    price: "₹249",
    originalPrice: "₹1,199",
    discount: "-79%",
    type: "RPG",
    description: "Demon-slaying samurai action",
  },
  {
    id: 220,
    title: "Raidou Remastered: The Mystery of the Soulless Army",
    image: "/raidou-remastered.png",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "RPG",
    description: "Devil Summoner action RPG remastered",
  },
  {
    id: 221,
    title: "Metaphor: ReFantazio",
    image: "/metaphor-refantazio.png",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "RPG",
    description: "Fantasy RPG from Persona creators",
  },
  {
    id: 222,
    title: "Like a Dragon Gaiden: The Man Who Erased His Name",
    image: "/like-a-dragon-gaiden.jpg",
    price: "₹269",
    originalPrice: "₹1,499",
    discount: "-82%",
    type: "RPG",
    description: "Kiryu's secret story between games",
  },
  {
    id: 223,
    title: "Like a Dragon: Infinite Wealth",
    image: "/like-a-dragon-infinite-wealth.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "RPG",
    description: "Latest Like a Dragon adventure",
  },
  {
    id: 224,
    title: "Like a Dragon: Ishin!",
    image: "/like-a-dragon-ishin.jpg",
    price: "₹279",
    originalPrice: "₹1,599",
    discount: "-83%",
    type: "RPG",
    description: "Samurai era Yakuza spin-off",
  },
  {
    id: 225,
    title: "Like a Dragon: Pirate Yakuza in Hawaii",
    image: "/like-a-dragon-pirate-yakuza.png",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "RPG",
    description: "Pirate adventure in Like a Dragon series",
  },
  {
    id: 226,
    title: "Lost Judgment",
    image: "/lost-judgment.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "RPG",
    description: "Detective thriller in Yakuza universe",
  },

  {
    id: 41,
    title: "Forza Horizon 4",
    image: "/forza-horizon-4.jpg",
    price: "₹219",
    originalPrice: "₹899",
    discount: "-76%",
    type: "Racing / Vehicle Simulators",
    description: "Race across beautiful Britain",
  },
  {
    id: 42,
    title: "Forza Horizon 5",
    image: "/forza-horizon-5.jpg",
    price: "₹269",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Racing / Vehicle Simulators",
    description: "Explore Mexico's vibrant landscapes",
  },
  {
    id: 43,
    title: "Need for Speed Most Wanted",
    image: "/nfs-most-wanted.jpg",
    price: "₹169",
    originalPrice: "₹699",
    discount: "-76%",
    type: "Racing / Vehicle Simulators",
    description: "Open-world street racing",
  },
  {
    id: 44,
    title: "Assetto Corsa",
    image: "/assetto-corsa.jpg",
    price: "₹149",
    originalPrice: "₹599",
    discount: "-75%",
    type: "Racing / Vehicle Simulators",
    description: "Ultra-realistic racing simulator",
  },
  {
    id: 45,
    title: "BeamNG.drive",
    image: "/beamng-drive.jpg",
    price: "₹209",
    originalPrice: "₹899",
    discount: "-77%",
    type: "Racing / Vehicle Simulators",
    description: "Soft-body physics vehicle simulator",
  },
  {
    id: 46,
    title: "Wreckfest",
    image: "/wreckfest.jpg",
    price: "₹199",
    originalPrice: "₹799",
    discount: "-75%",
    type: "Racing / Vehicle Simulators",
    description: "Demolition derby and racing mayhem",
  },
  {
    id: 47,
    title: "SnowRunner",
    image: "/snowrunner.jpg",
    price: "₹219",
    originalPrice: "₹999",
    discount: "-78%",
    type: "Racing / Vehicle Simulators",
    description: "Off-road trucking in extreme conditions",
  },
  {
    id: 48,
    title: "Car Mechanic Simulator 2021",
    image: "/car-mechanic-simulator-2021.png",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Racing / Vehicle Simulators",
    description: "Build, repair and tune cars",
  },
  {
    id: 49,
    title: "My Summer Car",
    image: "/my-summer-car-new.jpg",
    price: "₹129",
    originalPrice: "₹599",
    discount: "-78%",
    type: "Racing / Vehicle Simulators",
    description: "Build a car from scratch in 1990s Finland",
  },

  {
    id: 51,
    title: "Bus Simulator 18",
    image: "/bus-simulator-18.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Racing / Vehicle Simulators",
    description: "Drive buses in a realistic city",
  },
  {
    id: 52,
    title: "Euro Truck Simulator 2",
    image: "/euro-truck-simulator-2.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Racing / Vehicle Simulators",
    description: "Haul cargo across Europe",
  },
  {
    id: 53,
    title: "American Truck Simulator",
    image: "/american-truck-simulator.png",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Racing / Vehicle Simulators",
    description: "Experience life of a trucker in USA",
  },
  {
    id: 54,
    title: "Train Sim World 4",
    image: "/train-sim-world-4.png",
    price: "₹229",
    originalPrice: "₹1,199",
    discount: "-81%",
    type: "Racing / Vehicle Simulators",
    description: "Realistic train driving simulation",
  },
  {
    id: 179,
    title: "Need for Speed Unbound",
    image: "/nfs-unbound.png",
    price: "₹289",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Racing / Vehicle Simulators",
    description: "Street racing with style",
  },
  {
    id: 180,
    title: "Need for Speed Heat",
    image: "/nfs-heat.jpg",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Racing / Vehicle Simulators",
    description: "Day racing, night street racing",
  },
  {
    id: 181,
    title: "Need for Speed Payback",
    image: "/nfs-payback.jpg",
    price: "₹219",
    originalPrice: "₹1,199",
    discount: "-82%",
    type: "Racing / Vehicle Simulators",
    description: "Action-driving in Fortune Valley",
  },
  {
    id: 181.5,
    title: "Need for Speed Rivals",
    image: "/nfs-rivals.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Racing / Vehicle Simulators",
    description: "Cops vs Racers open-world",
  },
  {
    id: 227,
    title: "Need for Speed Hot Pursuit",
    image: "/need-for-speed-hot-pursuit.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Racing / Vehicle Simulators",
    description: "Remastered classic cop vs racer",
  },

  {
    id: 229,
    title: "F1 24",
    image: "/f1-24.jpg",
    price: "₹299",
    originalPrice: "₹1,599",
    discount: "-81%",
    type: "Racing / Vehicle Simulators",
    description: "Latest F1 racing experience",
  },
  {
    id: 230,
    title: "F1 25",
    image: "/f1-25.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "Racing / Vehicle Simulators",
    description: "F1 2025 racing simulation",
  },
  {
    id: 231,
    title: "F1 Manager 2024",
    image: "/f1-manager-2024.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Racing / Vehicle Simulators",
    description: "Manage your own F1 team",
  },
  {
    id: 232,
    title: "GRID Legends",
    image: "/grid-legends.jpg",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Racing / Vehicle Simulators",
    description: "Thrilling unpredictable motorsport action",
  },
  {
    id: 233,
    title: "Sonic Racing: CrossWorlds",
    image: "/sonic-racing-crossworlds.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Racing / Vehicle Simulators",
    description: "Fast-paced kart racing with Sonic",
  },

  {
    id: 58,
    title: "Mortal Kombat X",
    image: "/mortal-kombat-x.jpg",
    price: "₹149",
    originalPrice: "₹799",
    discount: "-81%",
    type: "Fighting",
    description: "Brutal fighting with iconic characters",
  },
  {
    id: 59,
    title: "Mortal Kombat 11",
    image: "/mortal-kombat-11.jpg",
    price: "₹179",
    originalPrice: "₹899",
    discount: "-80%",
    type: "Fighting",
    description: "Time-bending Mortal Kombat action",
  },
  {
    id: 60,
    title: "Mortal Kombat 1",
    image: "/mortal-kombat-1.png",
    price: "₹299",
    originalPrice: "₹1,299",
    discount: "-77%",
    type: "Fighting",
    description: "A new era of Mortal Kombat",
  },
  {
    id: 61,
    title: "Tekken 7",
    image: "/tekken-7.png",
    price: "₹149",
    originalPrice: "₹799",
    discount: "-81%",
    type: "Fighting",
    description: "The King of Iron Fist Tournament",
  },
  {
    id: 62,
    title: "Tekken 8",
    image: "/tekken-8.jpg",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "Fighting",
    description: "Next generation of Tekken",
  },
  {
    id: 63,
    title: "DRAGON BALL: Sparking! ZERO",
    image: "/dragon-ball-sparking-zero.png",
    price: "₹299",
    originalPrice: "₹1,299",
    discount: "-77%",
    type: "Fighting",
    description: "Epic Dragon Ball battles",
  },
  {
    id: 64,
    title: "Virtua Fighter 5 R.E.V.O. World Stage",
    image: "/virtua-fighter-5.jpg",
    price: "₹199",
    originalPrice: "₹999",
    discount: "-80%",
    type: "Fighting",
    description: "Classic 3D fighting remastered",
  },
  {
    id: 234,
    title: "Street Fighter 6",
    image: "/street-fighter-6.png",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Fighting",
    description: "Latest evolution of Street Fighter",
  },
  {
    id: 235,
    title: "Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles",
    image: "/demon-slayer-hinokami-chronicles.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Fighting",
    description: "Anime fighting game with demon slayers",
  },

  {
    id: 237,
    title: "Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles 2",
    image: "/demon-slayer-hinokami-chronicles-2.jpg",
    price: "₹299",
    originalPrice: "₹1,599",
    discount: "-81%",
    type: "Fighting",
    description: "Sequel to Hinokami Chronicles",
  },
  {
    id: 238,
    title: "SUPER ROBOT WARS Y",
    image: "/super-robot-wars-y.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Fighting",
    description: "Tactical mecha combat crossover",
  },
  {
    id: 239,
    title: "Undisputed",
    image: "/undisputed.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Fighting",
    description: "Realistic boxing simulation",
  },

  {
    id: 65,
    title: "MotoGP 24",
    image: "/motogp-24.png",
    price: "₹269",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Bike Racing",
    description: "Official MotoGP racing experience",
  },
  {
    id: 66,
    title: "Ride 4",
    image: "/ride-4.jpg",
    price: "₹229",
    originalPrice: "₹999",
    discount: "-77%",
    type: "Bike Racing",
    description: "Motorcycle racing simulation",
  },
  {
    id: 67,
    title: "Ride 5",
    image: "/ride-5.jpg",
    price: "₹279",
    originalPrice: "₹1,199",
    discount: "-77%",
    type: "Bike Racing",
    description: "Next-gen motorcycle racing",
  },

  {
    id: 70,
    title: "Cricket 24",
    image: "/cricket-24.jpg",
    price: "₹269",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Sports",
    description: "Official cricket game with all formats",
  },
  {
    id: 71,
    title: "Cricket 26",
    image: "/cricket-26.jpg",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "Sports",
    description: "Latest cricket game - Indian Edition",
  },
  {
    id: 165,
    title: "EA SPORTS FC™ 26",
    image: "/fc-26.jpg",
    price: "₹299",
    originalPrice: "₹2,199",
    discount: "-86%",
    type: "Sports",
    description: "The latest EA Sports FC game",
  },
  {
    id: 166,
    title: "EA SPORTS FC™ 25",
    image: "/fc-25.jpg",
    price: "₹279",
    originalPrice: "₹1,999",
    discount: "-86%",
    type: "Sports",
    description: "Latest EA Sports football game",
  },
  {
    id: 167,
    title: "FC 24 (FIFA 24)",
    image: "/fc-24.jpg",
    price: "₹259",
    originalPrice: "₹1,699",
    discount: "-85%",
    type: "Sports",
    description: "Previous year football experience",
  },
  {
    id: 168,
    title: "WWE 2K25",
    image: "/wwe-2k25.jpg",
    price: "₹299",
    originalPrice: "₹1,899",
    discount: "-84%",
    type: "Sports",
    description: "The latest WWE wrestling game",
  },
  {
    id: 169,
    title: "WWE 2K24",
    image: "/wwe-2k24.jpg",
    price: "₹279",
    originalPrice: "₹1,699",
    discount: "-84%",
    type: "Sports",
    description: "Latest WWE wrestling game",
  },
  {
    id: 170,
    title: "WWE 2K23",
    image: "/wwe-2k23.jpg",
    price: "₹249",
    originalPrice: "₹1,499",
    discount: "-83%",
    type: "Sports",
    description: "WWE with WarGames mode",
  },
  {
    id: 171,
    title: "NBA 2K24",
    image: "/nba-2k24.jpg",
    price: "₹269",
    originalPrice: "₹1,699",
    discount: "-84%",
    type: "Sports",
    description: "Latest NBA basketball game",
  },
  
  // New Additions

  {
    id: 302,
    title: "Dune: Awakening",
    image: "/dune-awakening.jpg",
    price: "₹349",
    originalPrice: "₹2,499",
    discount: "-84%",
    type: "Exploration / Survival",
    description: "Survive Arrakis in this MMO",
    href: "/games/dune-awakening"
  },
  {
    id: 303,
    title: "South of Midnight",
    image: "/south-of-midnight.jpg",
    price: "₹349",
    originalPrice: "₹2,499",
    discount: "-86%",
    type: "Action-Adventure / Open-World",
    description: "Southern gothic action adventure",
    href: "/games/south-of-midnight"
  },

  {
    id: 171.5,
    title: "NBA 2K25",
    image: "/nba-2k25.jpg",
    price: "₹299",
    originalPrice: "₹1,899",
    discount: "-84%",
    type: "Sports",
    description: "The newest NBA basketball game",
  },
  {
    id: 172,
    title: "NBA 2K23",
    image: "/nba-2k23.jpg",
    price: "₹239",
    originalPrice: "₹1,499",
    discount: "-84%",
    type: "Sports",
    description: "Previous year NBA experience",
  },
  {
    id: 173,
    title: "Madden NFL 24",
    image: "/madden-nfl-24.png",
    price: "₹259",
    originalPrice: "₹1,699",
    discount: "-85%",
    type: "Sports",
    description: "Latest NFL football game",
  },
  {
    id: 188,
    title: "Riders Republic",
    image: "/riders-republic.jpg",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Sports",
    description: "Extreme sports playground",
  },
  {
    id: 240,
    title: "Football Manager 26",
    image: "/football-manager-2026.jpg",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Sports",
    description: "Latest football management simulation",
  },
  {
    id: 241,
    title: "EA Sports PGA Tour",
    image: "/pga-tour.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Sports",
    description: "Golf simulation with real courses",
  },
  {
    id: 243,
    title: "TopSpin 2K25",
    image: "/topspin-2k25.jpg",
    price: "₹279",
    originalPrice: "₹1,499",
    discount: "-81%",
    type: "Sports",
    description: "Tennis simulation returns",
  },
  {
    id: 244,
    title: "Anno 1800",
    image: "/anno-1800.jpg",
    price: "₹299",
    originalPrice: "₹1,599",
    discount: "-81%",
    type: "Casual / Business Simulation",
    description: "Industrial revolution city builder",
  },
  {
    id: 246,
    title: "Construction Simulator",
    image: "/construction-simulator.png",
    price: "₹249",
    originalPrice: "₹1,299",
    discount: "-81%",
    type: "Casual / Business Simulation",
    description: "Operate heavy construction vehicles",
  },
  {
    id: 247,
    title: "Planet Coaster 2",
    image: "/planet-coaster-2.png",
    price: "₹329",
    originalPrice: "₹1,899",
    discount: "-83%",
    type: "Casual / Business Simulation",
    description: "Build ultimate theme park empire",
  },
  {
    id: 248,
    title: "Sid Meier's Civilization VII",
    image: "/civilization-vi.jpg",
    price: "₹349",
    originalPrice: "₹1,999",
    discount: "-83%",
    type: "Casual / Business Simulation",
    description: "Next chapter in legendary strategy series",
  },
  {
    id: 249,
    title: "Total War: Pharaoh Dynasties",
    image: "/total-war-pharaoh.jpg",
    price: "₹299",
    originalPrice: "₹1,699",
    discount: "-82%",
    type: "Casual / Business Simulation",
    description: "Ancient Egypt strategy warfare",
  },

  {
    id: 71,
    title: "Resident Evil 2 Remake",
    image: "/resident-evil-2.jpg",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "Horror",
    description: "Reimagined survival horror classic",
  },
  {
    id: 72,
    title: "Resident Evil 3 Remake",
    image: "/resident-evil-3.jpg",
    price: "₹249",
    originalPrice: "₹999",
    discount: "-75%",
    type: "Horror",
    description: "Escape Raccoon City from Nemesis",
  },
  {
    id: 73,
    title: "Resident Evil 4",
    image: "/resident-evil-4.png",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Horror",
    description: "Legendary action horror reimagined",
  },
  {
    id: 74,
    title: "Resident Evil 7 Biohazard",
    image: "/resident-evil-7.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "First-person horror in Louisiana",
  },
  {
    id: 75,
    title: "Resident Evil Village",
    image: "/resident-evil-village.png",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Horror",
    description: "Gothic horror with Lady Dimitrescu",
  },
  {
    id: 76,
    title: "SILENT HILL 2",
    image: "/silent-hill-2.jpg",
    price: "₹299",
    originalPrice: "₹1,499",
    discount: "-80%",
    type: "Horror",
    description: "Psychological horror masterpiece reborn",
  },
  {
    id: 77,
    title: "Silent Hill f",
    image: "/silent-hill-f.jpg",
    price: "₹269",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Horror",
    description: "New chapter in Silent Hill series",
  },
  {
    id: 78,
    title: "A Quiet Place: The Road Ahead",
    image: "/a-quiet-place.jpg",
    price: "₹259",
    originalPrice: "₹1,299",
    discount: "-80%",
    type: "Horror",
    description: "Survive in silence from the creatures",
  },
  {
    id: 79,
    title: "The Evil Within",
    image: "/the-evil-within.png",
    price: "₹169",
    originalPrice: "₹799",
    discount: "-79%",
    type: "Horror",
    description: "Mind-bending horror from Resident Evil creator",
  },
  {
    id: 80,
    title: "The Evil Within 2",
    image: "/the-evil-within-2.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "Descend into madness to save your daughter",
  },
  {
    id: 80.5,
    title: "Outlast",
    image: "/outlast.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Horror",
    description: "Run and hide in psychiatric hospital",
  },
  {
    id: 81,
    title: "Outlast 2",
    image: "/outlast-2.jpg",
    price: "₹169",
    originalPrice: "₹799",
    discount: "-79%",
    type: "Horror",
    description: "Escape religious cult in the wilderness",
  },
  {
    id: 82,
    title: "Outlast Trials",
    image: "/outlast-trials.jpg",
    price: "₹259",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Horror",
    description: "Co-op horror survival during Cold War",
  },
  {
    id: 83,
    title: "Dead Space Remake",
    image: "/dead-space-remake.png",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Horror",
    description: "Rebuild from the ground up sci-fi horror",
  },

  {
    id: 86,
    title: "Amnesia: The Dark Descent",
    image: "/amnesia-the-dark-descent.jpg",
    price: "₹149",
    originalPrice: "₹599",
    discount: "-75%",
    type: "Horror",
    description: "Psychological horror classic",
  },
  {
    id: 87,
    title: "Amnesia: Rebirth",
    image: "/amnesia-rebirth.jpg",
    price: "₹189",
    originalPrice: "₹899",
    discount: "-79%",
    type: "Horror",
    description: "Desert horror adventure",
  },
  {
    id: 88,
    title: "Amnesia: The Bunker",
    image: "/amnesia-the-bunker.jpg",
    price: "₹219",
    originalPrice: "₹999",
    discount: "-78%",
    type: "Horror",
    description: "Trapped in WWI bunker with creature",
  },
  {
    id: 89,
    title: "SOMA",
    image: "/soma.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Horror",
    description: "Sci-fi horror in underwater facility",
  },
  {
    id: 90,
    title: "Alien: Isolation",
    image: "/alien-isolation.png",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "Survive the perfect organism",
  },
  {
    id: 91,
    title: "Fatal Frame: Maiden of Black Water",
    image: "/fatal-frame.jpg",
    price: "₹259",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Horror",
    description: "Japanese horror with camera obscura",
  },
  {
    id: 92,
    title: "The Forest",
    image: "/the-forest.png",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Horror",
    description: "Survive cannibal mutants on peninsula",
  },
  {
    id: 93,
    title: "Sons of the Forest",
    image: "/sons-of-the-forest.jpg",
    price: "₹259",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Horror",
    description: "Fight mutants and cannibals to survive",
  },
  {
    id: 94,
    title: "Visage",
    image: "/visage.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "Haunted house psychological horror",
  },
  {
    id: 95,
    title: "Poppy Playtime",
    image: "/poppy-playtime.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Horror",
    description: "Survive the abandoned toy factory",
  },
  {
    id: 96,
    title: "Five Nights at Freddy's 4",
    image: "/fnaf-4.jpg",
    price: "₹99",
    originalPrice: "₹399",
    discount: "-75%",
    type: "Horror",
    description: "Defend your bedroom from nightmares",
  },
  {
    id: 97,
    title: "Five Nights at Freddy's: Security Breach",
    image: "/fnaf-security-breach.jpg",
    price: "₹259",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Horror",
    description: "Escape Freddy Fazbear's Mega Pizzaplex",
  },
  {
    id: 98,
    title: "Phasmophobia",
    image: "/phasmophobia.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Horror",
    description: "Co-op ghost hunting investigation",
  },
  {
    id: 99,
    title: "Lethal Company",
    image: "/lethal-company.jpg",
    price: "₹119",
    originalPrice: "₹599",
    discount: "-80%",
    type: "Horror",
    description: "Co-op horror scavenging on moons",
  },
  {
    id: 100,
    title: "MADiSON",
    image: "/madison.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "First-person psychological horror with instant camera",
  },
  {
    id: 101,
    title: "The Mortuary Assistant",
    image: "/mortuary-assistant.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Horror",
    description: "Embalm bodies while being haunted",
  },
  {
    id: 102,
    title: "Devour",
    image: "/devour.jpg",
    price: "₹99",
    originalPrice: "₹399",
    discount: "-75%",
    type: "Horror",
    description: "Co-op horror stopping possessed cultists",
  },
  {
    id: 103,
    title: "Dredge",
    image: "/dredge.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Horror",
    description: "Fishing horror adventure in cursed waters",
  },
  {
    id: 104,
    title: "Darkwood",
    image: "/darkwood.jpg",
    price: "₹149",
    originalPrice: "₹699",
    discount: "-79%",
    type: "Horror",
    description: "Top-down survival horror in dark woods",
  },
  {
    id: 105,
    title: "Don't Scream",
    image: "/dont-scream.png",
    price: "₹99",
    originalPrice: "₹599",
    discount: "-83%",
    type: "Horror",
    description: "Microphone-based horror game",
  },
  {
    id: 106,
    title: "The Callisto Protocol",
    image: "/callisto-protocol.png",
    price: "₹279",
    originalPrice: "₹1,299",
    discount: "-79%",
    type: "Horror",
    description: "Sci-fi horror on Jupiter's moon",
  },

  {
    id: 107,
    title: "Supermarket Simulator",
    image: "/supermarket-simulator.jpg",
    price: "₹149",
    originalPrice: "₹599",
    discount: "-75%",
    type: "Casual / Business Simulation",
    description: "Run and manage your own supermarket",
  },
  {
    id: 108,
    title: "Fling to the Finish",
    image: "/fling-to-the-finish.jpg",
    price: "₹99",
    originalPrice: "₹399",
    discount: "-75%",
    type: "Casual / Business Simulation",
    description: "Co-op racing with tethered characters",
  },
  {
    id: 109,
    title: "House Flipper",
    image: "/house-flipper.jpg",
    price: "₹169",
    originalPrice: "₹699",
    discount: "-76%",
    type: "Casual / Business Simulation",
    description: "Buy, renovate and sell houses",
  },
  {
    id: 109.5,
    title: "House Flipper 2",
    image: "/house-flipper-2.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Casual / Business Simulation",
    description: "Next-gen house renovation simulator",
  },
  {
    id: 110,
    title: "Gas Station Simulator",
    image: "/gas-station-simulator.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Casual / Business Simulation",
    description: "Build and manage a gas station",
  },
  {
    id: 111,
    title: "Big Ambitions",
    image: "/big-ambitions.png",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Casual / Business Simulation",
    description: "Start from scratch in New York City",
  },

  {
    id: 115,
    title: "Bakery Simulator",
    image: "/bakery-simulator.jpg",
    price: "₹159",
    originalPrice: "₹699",
    discount: "-77%",
    type: "Casual / Business Simulation",
    description: "Bake and sell delicious pastries",
  },
  {
    id: 116,
    title: "Drug Dealer Simulator",
    image: "/drug-dealer-simulator.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Casual / Business Simulation",
    description: "Build an underground drug empire",
  },
  {
    id: 116.5,
    title: "Drug Dealer Simulator 2",
    image: "/drug-dealer-simulator-2.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Casual / Business Simulation",
    description: "Expand your criminal empire",
  },
  {
    id: 116.7,
    title: "Industry Giant 4.0",
    image: "/industry-giant-4.jpg",
    price: "₹189",
    originalPrice: "₹899",
    discount: "-79%",
    type: "Casual / Business Simulation",
    description: "Build industrial empire from scratch",
  },

  {
    id: 117,
    title: "Subnautica",
    image: "/subnautica.jpg",
    price: "₹199",
    originalPrice: "₹899",
    discount: "-78%",
    type: "Exploration / Survival",
    description: "Underwater survival on alien planet",
  },
  {
    id: 118,
    title: "Subnautica: Below Zero",
    image: "/subnautica-below-zero.jpg",
    price: "₹219",
    originalPrice: "₹999",
    discount: "-78%",
    type: "Exploration / Survival",
    description: "Arctic underwater survival adventure",
  },
  {
    id: 119,
    title: "Green Hell",
    image: "/green-hell.jpg",
    price: "₹179",
    originalPrice: "₹799",
    discount: "-78%",
    type: "Exploration / Survival",
    description: "Survive the Amazon rainforest",
  },
  {
    id: 120,
    title: "The Long Dark",
    image: "/the-long-dark.jpg",
    price: "₹209",
    originalPrice: "₹899",
    discount: "-77%",
    type: "Exploration / Survival",
    description: "Survive the frozen Canadian wilderness",
  },
  {
    id: 121,
    title: "Raft",
    image: "/raft.jpg",
    price: "₹189",
    originalPrice: "₹799",
    discount: "-76%",
    type: "Exploration / Survival",
    description: "Expand your raft on endless ocean",
  },
  {
    id: 122,
    title: "Stranded Deep",
    image: "/stranded-deep.jpg",
    price: "₹169",
    originalPrice: "₹699",
    discount: "-76%",
    type: "Exploration / Survival",
    description: "Desert island survival simulation",
  },
  {
    id: 123,
    title: "Valheim",
    image: "/valheim.jpg",
    price: "₹219",
    originalPrice: "₹899",
    discount: "-76%",
    type: "Exploration / Survival",
    description: "Viking survival in Norse purgatory",
  },
  {
    id: 192,
    title: "Expedition 33",
    image: "/expedition-33.jpg",
    price: "₹269",
    originalPrice: "₹1,199",
    discount: "-78%",
    type: "Exploration / Survival",
    description: "Explore and survive mysterious alien worlds",
  },

  {
    id: 124,
    title: "Hollow Knight",
    image: "/hollow-knight.png",
    price: "₹139",
    originalPrice: "₹599",
    discount: "-77%",
    type: "Indie",
    description: "Epic bug adventure in forgotten kingdom",
  },
  {
    id: 124.5,
    title: "Hollow Knight: Silksong",
    image: "/hollow-knight-silksong.jpg",
    price: "₹279",
    originalPrice: "₹899",
    discount: "-69%",
    type: "Indie",
    description: "Sequel to Hollow Knight with Hornet",
  },
  {
    id: 125,
    title: "Celeste",
    image: "/celeste.png",
    price: "₹149",
    originalPrice: "₹399",
    discount: "-63%",
    type: "Indie",
    description: "Climb the mountain, conquer your demons",
  },
  {
    id: 126,
    title: "Undertale",
    image: "/undertale.jpg",
    price: "₹149",
    originalPrice: "₹399",
    discount: "-63%",
    type: "Indie",
    description: "RPG where nobody has to die",
  },
  {
    id: 128,
    title: "Cuphead",
    image: "/cuphead.jpg",
    price: "₹179",
    originalPrice: "₹699",
    discount: "-74%",
    type: "Indie",
    description: "1930s cartoon boss rush game",
  },
  {
    id: 129,
    title: "Hades",
    image: "/hades.png",
    price: "₹229",
    originalPrice: "₹799",
    discount: "-71%",
    type: "Indie",
    description: "Hack and slash out of hell",
  },
  {
    id: 129.5,
    title: "Hades II",
    image: "/hades-2.png",
    price: "₹249",
    originalPrice: "₹899",
    discount: "-72%",
    type: "Indie",
    description: "Battle beyond the underworld",
  },

  {
    id: 131,
    title: "Terraria",
    image: "/terraria.jpg",
    price: "₹129",
    originalPrice: "₹399",
    discount: "-68%",
    type: "Indie",
    description: "Dig, fight, explore, build!",
  },
  {
    id: 132,
    title: "Dead Cells",
    image: "/dead-cells.jpg",
    price: "₹189",
    originalPrice: "₹699",
    discount: "-73%",
    type: "Indie",
    description: "Roguelike action-platformer",
  },
  {
    id: 133,
    title: "Little Nightmares",
    image: "/little-nightmares.png",
    price: "₹149",
    originalPrice: "₹599",
    discount: "-75%",
    type: "Indie",
    description: "Escape the creepy vessel",
  },
  {
    id: 134,
    title: "Little Nightmares II",
    image: "/little-nightmares-2.jpg",
    price: "₹219",
    originalPrice: "₹799",
    discount: "-73%",
    type: "Indie",
    description: "Horror adventure with dark secrets",
  },
  {
    id: 134.5,
    title: "Little Nightmares III",
    image: "/little-nightmares-3.jpg",
    price: "₹249",
    originalPrice: "₹899",
    discount: "-72%",
    type: "Indie",
    description: "Co-op horror in the Nowhere",
  },
  {
    id: 137,
    title: "Limbo",
    image: "/limbo.jpg",
    price: "₹99",
    originalPrice: "₹299",
    discount: "-67%",
    type: "Indie",
    description: "Black and white puzzle platformer",
  },
  {
    id: 138,
    title: "Inside",
    image: "/inside.jpg",
    price: "₹129",
    originalPrice: "₹399",
    discount: "-68%",
    type: "Indie",
    description: "Dark puzzle platformer from Limbo creators",
  },
  {
    id: 144,
    title: "Vampire Survivors",
    image: "/vampire-survivors.jpg",
    price: "₹99",
    originalPrice: "₹299",
    discount: "-67%",
    type: "Indie",
    description: "Minimalist bullet hell roguelike",
  },
  {
    id: 145,
    title: "The Binding of Isaac: Rebirth",
    image: "/binding-of-isaac.jpg",
    price: "₹159",
    originalPrice: "₹599",
    discount: "-73%",
    type: "Indie",
    description: "Randomly generated dungeon crawler",
  },
  {
    id: 146,
    title: "Disco Elysium",
    image: "/disco-elysium.jpg",
    price: "₹279",
    originalPrice: "₹899",
    discount: "-69%",
    type: "Indie",
    description: "Groundbreaking detective RPG",
  },
  {
    id: 150,
    title: "Blasphemous",
    image: "/blasphemous.jpg",
    price: "₹189",
    originalPrice: "₹699",
    discount: "-73%",
    type: "Indie",
    description: "Brutal action-platformer metroidvania",
  },
  {
    id: 151,
    title: "Katana ZERO",
    image: "/katana-zero.jpg",
    price: "₹159",
    originalPrice: "₹599",
    discount: "-73%",
    type: "Indie",
    description: "Stylish neo-noir action platformer",
  },
  {
    id: 152,
    title: "Absolum",
    image: "/absolum.jpg",
    price: "₹169",
    originalPrice: "₹699",
    discount: "-76%",
    type: "Indie",
    description: "Precision platformer roguelike",
  },

  {
    id: 154,
    title: "The Hundred Line -Last Defense Academy",
    image: "/hundred-line.jpg",
    price: "₹279",
    originalPrice: "₹999",
    discount: "-72%",
    type: "Indie",
    description: "Danganronpa creators' new RPG",
  },
  {
    id: 155,
    title: "Skin Deep",
    image: "/skin-deep.jpg",
    price: "₹139",
    originalPrice: "₹499",
    discount: "-72%",
    type: "Indie",
    description: "First-person shooter with unique style",
  },
  {
    id: 156,
    title: "Clash: Artifacts of Chaos",
    image: "/clash-artifacts-of-chaos.jpg",
    price: "₹189",
    originalPrice: "₹799",
    discount: "-76%",
    type: "Indie",
    description: "Unique brawler in surreal world",
  },
  {
    id: 157,
    title: "Forza Motorsport",
    image: "/forza-motorsport.jpg",
    price: "₹299",
    originalPrice: "₹3,999",
    discount: "-92%",
    type: "Racing / Vehicle Simulators",
    description: "Realistic racing simulation with over 500 cars",
  },
];

const GENRES = [
  "All",
  "Action-Adventure / Open-World",
  "FPS / TPS",
  "RPG",
  "Racing / Vehicle Simulators",
  "Fighting",
  "Bike Racing",
  "Sports",
  "Horror",
  "Casual / Business Simulation",
  "Exploration / Survival",
  "Indie",
];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
  { value: "newest", label: "Newest First" },
];
const PRICE_RANGES = [
  { value: "all", label: "All Prices", min: 0, max: Infinity },
  { value: "under-100", label: "Under ₹100", min: 0, max: 100 },
  { value: "100-200", label: "₹100 - ₹200", min: 100, max: 200 },
  { value: "200-300", label: "₹200 - ₹300", min: 200, max: 300 },
  { value: "300-500", label: "₹300 - ₹500", min: 300, max: 500 },
  { value: "above-500", label: "Above ₹500", min: 500, max: Infinity },
];

const extractPrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^\d]/g, "")) || 0;
};

const extractDiscount = (discountStr: string): number => {
  return parseInt(discountStr.replace(/[^\d]/g, "")) || 0;
};



export default function GamesPage() {

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...GAMES];

    // Apply genre filter
    if (selectedGenre !== "All") {
      filtered = filtered.filter((game) => game.type === selectedGenre);
    }

    // Apply price range filter
    const priceRange = PRICE_RANGES.find((r) => r.value === selectedPriceRange);
    if (priceRange && priceRange.value !== "all") {
      filtered = filtered.filter((game) => {
        const price = extractPrice(game.price);
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "price-low":
          return extractPrice(a.price) - extractPrice(b.price);
        case "price-high":
          return extractPrice(b.price) - extractPrice(a.price);
        case "discount":
          return extractDiscount(b.discount) - extractDiscount(a.discount);
        case "newest":
          // Sort by ID in descending order (higher IDs are newer)
          return b.id - a.id;
        case "popular":
        default:
          // Popular games prioritize lower IDs and higher discounts
          const aScore = 1000 - a.id + extractDiscount(a.discount) * 2;
          const bScore = 1000 - b.id + extractDiscount(b.discount) * 2;
          return bScore - aScore;
      }
    });

    return filtered;
  }, [selectedGenre, selectedPriceRange, sortBy]);

  const gamesByGenre = useMemo(() => {
    const genres =
      selectedGenre === "All"
        ? GENRES.filter((g) => g !== "All")
        : [selectedGenre];

    return genres
      .map((genre) => ({
        genre,
        games: filteredAndSortedGames.filter((game) => game.type === genre),
      }))
      .filter((section) => section.games.length > 0);
  }, [filteredAndSortedGames, selectedGenre]);

  const filteredGamesByGenre = gamesByGenre;

  const totalGames = useMemo(
    () =>
      filteredGamesByGenre.reduce(
        (acc, section) => acc + section.games.length,
        0
      ),
    [filteredGamesByGenre]
  );

  return (
    <main className="min-h-screen bg-[#080A10]">
      <SteamRushNavbar />
      <div className="pt-8 lg:pt-12 pb-12">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-5xl font-black text-white mb-2">
              Browse All Games
            </h1>
            <p className="text-[#B0B8D0] text-sm lg:text-base">
              {selectedGenre !== "All" ||
              selectedPriceRange !== "all"
                ? `Found ${totalGames} game${totalGames !== 1 ? "s" : ""}`
                : `${totalGames} games available`}{" "}
              • Original Steam keys • Instant delivery
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-[#121622] border border-[#202838] rounded-lg text-white hover:border-[#3B82F6] transition-colors sm:min-w-[140px] justify-center"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>


            {/* Active Filters Chips */}
            {(selectedGenre !== "All" ||
              selectedPriceRange !== "all" ||
              sortBy !== "popular") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#B0B8D0] text-sm font-medium">
                  Active filters:
                </span>

                {selectedGenre !== "All" && (
                  <div className="flex items-center gap-1.5 bg-[#121622] border border-[#202838] rounded-full px-3 py-1.5">
                    <span className="text-white text-sm">
                      Genre: {selectedGenre}
                    </span>
                    <button
                      onClick={() => setSelectedGenre("All")}
                      className="text-[#B0B8D0] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {selectedPriceRange !== "all" && (
                  <div className="flex items-center gap-1.5 bg-[#121622] border border-[#202838] rounded-full px-3 py-1.5">
                    <span className="text-white text-sm">
                      Price:{" "}
                      {
                        PRICE_RANGES.find((r) => r.value === selectedPriceRange)
                          ?.label
                      }
                    </span>
                    <button
                      onClick={() => setSelectedPriceRange("all")}
                      className="text-[#B0B8D0] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {sortBy !== "popular" && (
                  <div className="flex items-center gap-1.5 bg-[#121622] border border-[#202838] rounded-full px-3 py-1.5">
                    <span className="text-white text-sm">
                      Sort:{" "}
                      {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                    </span>
                    <button
                      onClick={() => setSortBy("popular")}
                      className="text-[#B0B8D0] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedGenre("All");
                    setSelectedPriceRange("all");
                    setSortBy("popular");
                  }}
                  className="text-[#3B82F6] hover:text-[#00D2FF] text-sm font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {showFilters && (
              <div className="bg-[#121622] border border-[#202838] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Filter Games</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-[#B0B8D0] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#B0B8D0] text-sm font-medium mb-2">
                      Genre
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full bg-[#080A10] border border-[#202838] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                    >
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B0B8D0] text-sm font-medium mb-2">
                      Price Range
                    </label>
                    <select
                      value={selectedPriceRange}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="w-full bg-[#080A10] border border-[#202838] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                    >
                      {PRICE_RANGES.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B0B8D0] text-sm font-medium mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-[#080A10] border border-[#202838] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedGenre("All");
                      setSelectedPriceRange("all");
                      setSortBy("popular");

                    }}
                    className="px-4 py-2 bg-[#202838] text-white rounded-lg hover:bg-[#363B5E] transition-colors text-sm"
                  >
                    Clear All
                  </button>
                  <div className="flex-1 flex items-center text-[#B0B8D0] text-sm">
                    {selectedGenre !== "All" ||
                    selectedPriceRange !== "all" ||
                    sortBy !== "popular" ? (
                      <span>
                        Active filters:{" "}
                        {[
                          selectedGenre !== "All" && `Genre: ${selectedGenre}`,
                          selectedPriceRange !== "all" &&
                            `Price: ${PRICE_RANGES.find((r) => r.value === selectedPriceRange)?.label}`,
                          sortBy !== "popular" &&
                            `Sort: ${SORT_OPTIONS.find((s) => s.value === sortBy)?.label}`,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : (
                      <span>No active filters</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredGamesByGenre.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#B0B8D0] text-lg">
                No games found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredGamesByGenre.map((section) => {
                // Generate section ID from genre name for hash navigation
                const sectionId = section.genre
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[\/]/g, '')
                  .replace('action-adventure-open-world', 'action')
                  .replace('fps-tps', 'fps')
                  .replace('rpg', 'rpg')
                  .replace('sports', 'sports')
                  .replace('horror-survival', 'horror');
                
                return (
                <section key={section.genre} id={sectionId} className="w-full scroll-mt-20">
                  <div className="flex items-center justify-between gap-4 mb-4 lg:mb-6">
                    <div>
                      <h2 className="text-xl lg:text-3xl font-black text-white mb-1">
                        {section.genre}
                      </h2>
                      <p className="text-[#B0B8D0] text-sm">
                        {section.games.length}{" "}
                        {section.games.length === 1 ? "game" : "games"}
                      </p>
                    </div>
                    <div className="hidden md:block text-[#B0B8D0] text-sm">
                      Swipe →
                    </div>
                  </div>

                  <div className="lg:grid lg:grid-cols-6 lg:gap-4 overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {section.games.filter(g => g.title !== "Dead Island").map((game) => {
                      const { addToCart, isInCart } = useCart();
                      const router = useRouter();
                      const inCart = isInCart(game.id.toString());
                      
                      // Generate link ID (slug)
                      let linkId = "";
                      
                      // 1. Try to find authoritative ID from central database
                      const cleanBrowseTitle = game.title.toLowerCase().trim();
                      const exactGame = GAMES_DATABASE.find(g => g.title.toLowerCase().trim() === cleanBrowseTitle);
                      // Only allow DB to contain Browse (e.g. "Dying Light 2 Stay Human" contains "Dying Light 2")
                      // Do NOT allow Browse to contain DB (prevents "Dying Light 2" matching "Dying Light")
                      const fuzzyGame = GAMES_DATABASE.find(g => g.title.toLowerCase().includes(cleanBrowseTitle));
                      const dbGame = exactGame || fuzzyGame;
                      
                      if (game.href) {
                         // Manual override from local data
                         linkId = game.href.split('/').pop() || "";
                      } else if (dbGame) {
                         // Found in central DB
                         linkId = dbGame.id;
                      } else {
                         // Fallback: manual map or generic slug
                         if (game.title === "Grand Theft Auto V") linkId = "gta-v";
                         else if (game.title === "Red Dead Redemption 2") linkId = "rdr2";
                         else if (game.title.includes("Stalker 2")) linkId = "stalker-2";
                         else if (game.title.includes("Hitman: World")) linkId = "hitman-world-assassination";
                         else if (game.title.includes("Assassin's Creed")) linkId = game.title.toLowerCase().replace("assassin's creed", "ac").replace(/\s+/g, '-').replace(':', '');
                         else if (game.title.includes("Call of Duty")) linkId = "cod-mw3";
                         else linkId = game.title.toLowerCase().replace(/[':]/g, '').replace(/\s+/g, '-');
                      }

                      const handleClick = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (inCart) {
                          router.push('/cart');
                        } else {
                          addToCart({
                            id: game.id.toString(),
                            name: game.title,
                            price: parseInt(game.price.replace('₹', '').replace(',', '')),
                            image: game.image,
                            originalPrice: parseInt(game.originalPrice.replace('₹', '').replace(',', ''))
                          });
                        }
                      };

                      return (
                      <div
                        key={game.id}
                        onClick={() => router.push(`/games/${linkId}`)}
                        className="group relative bg-[#121622] rounded-lg overflow-hidden border border-[#202838] hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex-shrink-0 w-[60vw] max-w-[240px] lg:w-full snap-start cursor-pointer"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={game.image}
                            alt={game.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 70vw, 16vw"
                            loading="lazy"
                          />

                          {game.discount && (
                            <div className="absolute top-2 right-2 bg-[#3B82F6] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                              {game.discount}
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <h3 className="text-white font-bold text-sm mb-1 truncate group-hover:text-[#3B82F6] transition-colors">
                            {game.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-white font-black text-xl">
                              {game.price}
                            </span>
                            <span className="text-[#B0B8D0] text-xs line-through">
                              {game.originalPrice}
                            </span>
                          </div>
                          
                          <button
                            onClick={handleClick}
                            className={`w-full py-2 rounded-md text-xs font-semibold transition-all ${
                              inCart
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                            }`}
                          >
                            {inCart ? (
                              <span className="flex items-center justify-center gap-1">
                                <Check className="h-3 w-3" /> In Cart
                               </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <ShoppingCart className="h-3 w-3" /> Add to Cart
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
