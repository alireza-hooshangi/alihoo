import Link from "next/link";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<main className={`min-h-screen`}>
			<div className={`flex justify-center items-center`}>
				<Link className={`text-lg`} href={`/`}>
					A H
				</Link>
			</div>
			{children}
		</main>
	);
};

export default Layout;
