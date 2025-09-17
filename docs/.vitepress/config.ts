import { defineConfig } from "vitepress";
import markdownItFootnote from "markdown-it-footnote";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/CSUClassSearch/",
  title: "Class Search",
  description: "A simple class search engine for California State University",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Installation", link: "/install" },
          { text: "Usage & Search Parameters", link: "/usage" },
          { text: "Search Results", link: "/searchResults" },
          { text: "Settings", link: "/settings" },
          { text: "Contributing", link: "/contributing" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/Brian-Kwong/CSUClassSearch" },
    ],
  },
  markdown: {
    config: (md) => {
      md.use(markdownItFootnote);
    },
  },
});
