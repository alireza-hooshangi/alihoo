import { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		absolute: "Alihoo",
	},
	description: "",
	openGraph: {
		title: "",
		description: "",
	},
};

export default function Home() {
	return (
		<div className={`flex flex-col text-lg`}>
			<h1 className={``}>1234567890</h1>
			<h2 className={``}>acdefghijklmnopqrstuvwxyz</h2>
			<h3 className={`uppercase`}>acdefghijklmnopqrstuvwxyz</h3>
			<h4 className={`uppercase`}>!@#$%^&*()[]/?.,'"\</h4>
		</div>
	);
}
