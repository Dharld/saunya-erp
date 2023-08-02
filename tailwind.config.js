const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "transparent",
      primary: {
        100: "#f6f9fe",
        200: "#8AB8FF",
        300: "#5799FF",
        400: "#3C86F6",
        500: "#0065FF",
        600: "#1762D3",
        700: "#1F57AD",
        800: "#123A78",
        900: "#172131",
      },
      error: "#E46463",
      success: "#3CAEA4",
      neutral: {
        80: "#FDFDFD",
        90: "#F7F8F9",
        100: "#DAE1E7",
        200: "#B8C2CC",
        300: "#8795A1",
        400: "#606F7B",
        500: "#3D4852",
        600: "#122740",
      },
      green: {
        100: "#E7FFFF",
        200: "#A8EFEB",
        300: "#6ED7D3",
        400: "#3CAEA4",
        500: "#299186",
        600: "#1C655E",
        700: "#134544",
      },
      yellow: {
        100: "#FFFCF5",
        200: "#FDF4D7",
        300: "#F6E49F",
        400: "#F4CA64",
        500: "#CAA53D",
        600: "#8D6C1F",
        700: "#5C4813",
      },
      red: {
        100: "#FCE8E9",
        200: "#F4AAA9",
        300: "#E46463",
        400: "#DC3030",
        500: "#B91F1F",
        600: "#891B1A",
        700: "#601819",
      },
    },
    fontFamily: {
      sans: ["Urbanist", "sans-serif"],
    },
    fontSize: {
      "body-xs": [
        "0.75rem",
        {
          lineHeight: 1.042,
          letterSpacing: 0.25,
        },
      ],
      body: [
        "0.875rem",
        {
          lineHeight: 1.1,
          letterSpacing: 0.25,
        },
      ],
      "body-large": [
        "1rem",
        {
          lineHeight: 1.1,
          letterSpacing: 0.25,
        },
      ],
      h6: [
        "1.125rem",
        {
          lineHeight: 1.1,
        },
      ],
      h5: [
        "1.25rem",
        {
          lineHeight: 1.1,
        },
      ],
      h4: [
        "1.5rem",
        {
          lineHeight: 1.1,
          fontWeight: 400,
        },
      ],
      h3: [
        "1.875rem",
        {
          lineHeight: 1.1,
          fontWeight: 500,
        },
      ],
      h2: [
        "2.125rem",
        {
          lineHeight: 1.1,
          fontWeight: 500,
        },
      ],
      h1: [
        "3rem",
        {
          lineHeight: 1.1,
          fontWeight: 500,
        },
      ],
    },
    plugins: [
      require("@tailwindcss/aspect-ratio"),
      require("@tailwindcss/forms"),
      require("@tailwindcss/line-clamp"),
      require("@tailwindcss/typography"),
      plugin(function ({ addBase, theme }) {
        const keys = Object.keys(theme("colors"));
        keys.forEach((key) => {
          const value = theme(`colors.` + key);
          if (typeof value != "object") {
            addBase({
              ":root": {
                ["--" + key + "-color"]: value,
              },
            });
          } else {
            Object.keys(value).forEach((nestedKey) => {
              const index = `colors.${key}.${nestedKey}`;
              const nestedValue = theme(index);
              addBase({
                ":root": {
                  ["--" + key + "-" + nestedKey]: nestedValue,
                },
              });
            });
          }
        });
      }),
    ],
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    plugin(function ({ addBase, theme }) {
      const keys = Object.keys(theme("colors"));
      keys.forEach((key) => {
        const value = theme(`colors.` + key);
        if (typeof value != "object") {
          addBase({
            ":root": {
              ["--" + key + "-color"]: value,
            },
          });
        } else {
          Object.keys(value).forEach((nestedKey) => {
            const index = `colors.${key}.${nestedKey}`;
            const nestedValue = theme(index);
            addBase({
              ":root": {
                ["--" + key + "-" + nestedKey]: nestedValue,
              },
            });
          });
        }
      });
    }),
  ],
};
