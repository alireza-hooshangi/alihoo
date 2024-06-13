"use client";

export default function NotFound() {
	return (
		<div
			className={`relative grid h-[100svh] content-start items-start gap-2 bg-blue-1 p-5 pb-0 md:gap-6 md:p-8 2xl:p-16`}
		>
			<p className={`text-2xl text-cream-1 md:text-4xl 2xl:text-5xl`}>
				Sorry...
			</p>
			<p className={`text-2xl text-cream-1 md:text-4xl 2xl:text-5xl`}>
				we couldn&apos;t find what you were looking for
			</p>
		</div>
	);
}
