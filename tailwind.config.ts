import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					"var(--font-uncutSans)",
					{
						fontFeatureSettings:
							'"ss02", "ss03", "ss05", "ss06", "ss08", "ss09"',
					},
				],
			},
			fontSize: {
				xs: [
					"0.75rem",
					{
						lineHeight: "1rem",
						letterSpacing: "0em",
						fontWeight: "400",
					},
				],
				sm: [
					"0.875rem",
					{
						lineHeight: "1.25rem",
						letterSpacing: "0em",
						fontWeight: "400",
					},
				],
				base: [
					"1rem",
					{
						lineHeight: "1.5rem",
						letterSpacing: "0em",
						fontWeight: "400",
					},
				],
				md: [
					"1.5rem",
					{
						lineHeight: "1.75rem",
						letterSpacing: "0em",
						fontWeight: "400",
					},
				],
				lg: [
					"1.75rem",
					{
						lineHeight: "2rem",
						letterSpacing: "0em",
						fontWeight: "400",
					},
				],
			},
		},
	},
	plugins: [],
};
export default config;
