export interface FaqItem {
  question: string;
  answer: string;
}

// Single source of truth for the homepage FAQ. The visible FAQ section and the
// FAQPage JSON-LD both read from this array so their text stays identical, as
// Google requires the structured data to match the on-page content exactly.
// Every answer is derived strictly from how the site actually works.
export const homepageFaq: FaqItem[] = [
  {
    question: "Are the tools on Buidl Now free to use?",
    answer:
      "Yes. Every tool on Buidl Now is completely free. There is no signup, no account, and nothing to install. You can open any tool and start using it right away.",
  },
  {
    question: "Do the tools run in my browser?",
    answer:
      "Most tools run entirely in your browser. Converting, encoding, decoding, hashing, formatting, generating, and validating happens on your device, so your input does not need to leave the page. A few Web3 tools that read live on-chain data, such as the ENS resolver and the contract inspection tools, make read-only network requests to fetch that data.",
  },
  {
    question: "Is my data sent anywhere or stored?",
    answer:
      "For the in-browser tools, your input is processed locally and is not uploaded or stored on a server. The only exception is the Web3 tools that need live blockchain data, which send a read-only request to fetch what they display. Buidl Now does not require an account, so there is nothing to save to a profile.",
  },
  {
    question: "What categories of tools are available?",
    answer:
      "Buidl Now offers 110+ tools grouped into Web3, Converters, Text, Encoders / Decoders, Formatters, Generators, and Utilities. You can browse by category or use the search box on the homepage to find a specific tool by name.",
  },
  {
    question: "What Web3 and Ethereum tools does Buidl Now include?",
    answer:
      "The Web3 category covers Ethereum and blockchain workflows such as address checksums, unit conversion, ABI encoding, transaction decoding, ENS resolution, gas estimation, signature verification, and key and mnemonic utilities. They are built for developers working with smart contracts and on-chain data.",
  },
  {
    question: "Do I need to create an account or sign up?",
    answer:
      "No. Buidl Now has no login or account system. Every tool is available immediately with no registration, email, or payment required.",
  },
  {
    question: "How do I find a specific tool?",
    answer:
      "Use the search box in the Tool Finder on the homepage to filter every tool by name, or pick a category to narrow the list. Each tool also has its own page at /tools/<id> that you can link to directly.",
  },
];
