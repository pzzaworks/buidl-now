import { IconType } from "react-icons";
import { SiEthereum } from "react-icons/si";
import {
  MdSwapHoriz, MdTextFields, MdCode, MdFormatAlignLeft, MdAutorenew,
  MdKey, MdLocalGasStation, MdToken, MdArticle, MdTag,
  MdFormatSize, MdCompareArrows, MdAnalytics, MdReorder,
  MdLock, MdFingerprint, MdTextFormat, MdPalette, MdSchedule, MdNumbers, MdDataObject,
  MdAccountBalance, MdBallot, MdBugReport, MdSecurity
} from "react-icons/md";

export type ToolCategory =
  | "converters"
  | "text"
  | "encoders-decoders"
  | "formatters"
  | "generators"
  | "web3";

export type ToolSubcategory = string;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  subcategory?: ToolSubcategory;
  path: string;
  icon?: IconType;
}

export interface Subcategory {
  id: string;
  name: string;
  parent: ToolCategory;
  icon: IconType;
}

export interface ToolExample {
  title: string;
  input: string;
  output: string;
}

export const toolSubcategories: Subcategory[] = [
  // Web3 subcategories
  { id: "address-keys", name: "Address & Keys", parent: "web3", icon: MdKey },
  { id: "transaction-gas", name: "Transaction & Gas", parent: "web3", icon: MdLocalGasStation },
  { id: "token-decimals", name: "Token & Decimals", parent: "web3", icon: MdToken },
  { id: "contracts", name: "Smart Contracts", parent: "web3", icon: MdArticle },
  { id: "encoding", name: "Encoding & Hashing", parent: "web3", icon: MdTag },
  { id: "defi", name: "DeFi & Protocols", parent: "web3", icon: MdAccountBalance },
  { id: "governance", name: "Governance & DAOs", parent: "web3", icon: MdBallot },
  { id: "testing", name: "Testing & Debugging", parent: "web3", icon: MdBugReport },
  { id: "token-nft", name: "Tokens & NFTs", parent: "web3", icon: MdToken },
  { id: "security", name: "Security & Analysis", parent: "web3", icon: MdSecurity },

  // Text subcategories
  { id: "case-format", name: "Case & Format", parent: "text", icon: MdFormatSize },
  { id: "comparison", name: "Comparison", parent: "text", icon: MdCompareArrows },
  { id: "analysis", name: "Analysis", parent: "text", icon: MdAnalytics },
  { id: "line-ops", name: "Line Operations", parent: "text", icon: MdReorder },

  // Encoders/Decoders subcategories
  { id: "text-encoders", name: "Text Encoders", parent: "encoders-decoders", icon: MdTextFormat },
  { id: "crypto-encoders", name: "Cryptographic", parent: "encoders-decoders", icon: MdLock },

  // Formatters subcategories
  { id: "code-formatters", name: "Code Formatters", parent: "formatters", icon: MdCode },
  { id: "data-formatters", name: "Data Formatters", parent: "formatters", icon: MdDataObject },

  // Generators subcategories
  { id: "id-generators", name: "ID Generators", parent: "generators", icon: MdFingerprint },
  { id: "text-generators", name: "Text Generators", parent: "generators", icon: MdTextFormat },
  { id: "crypto-generators", name: "Cryptographic", parent: "generators", icon: MdLock },
  { id: "color-generators", name: "Color & Graphics", parent: "generators", icon: MdPalette },

  // Converters subcategories
  { id: "time-converters", name: "Time & Date", parent: "converters", icon: MdSchedule },
  { id: "number-converters", name: "Numbers", parent: "converters", icon: MdNumbers },
  { id: "data-converters", name: "Data Formats", parent: "converters", icon: MdDataObject },
  { id: "color-converters", name: "Colors", parent: "converters", icon: MdPalette },
];

export const toolCategories: { id: ToolCategory; name: string; description: string; icon: IconType }[] = [
  {
    id: "web3",
    name: "Web3",
    description: "Blockchain and Web3 utilities",
    icon: SiEthereum,
  },
  {
    id: "converters",
    name: "Converters",
    description: "Convert between different formats and encodings",
    icon: MdSwapHoriz,
  },
  {
    id: "text",
    name: "Text",
    description: "Text manipulation and analysis tools",
    icon: MdTextFields,
  },
  {
    id: "encoders-decoders",
    name: "Encoders / Decoders",
    description: "Encode and decode various formats",
    icon: MdCode,
  },
  {
    id: "formatters",
    name: "Formatters",
    description: "Format and beautify code and data",
    icon: MdFormatAlignLeft,
  },
  {
    id: "generators",
    name: "Generators",
    description: "Generate various types of data",
    icon: MdAutorenew,
  },
];
