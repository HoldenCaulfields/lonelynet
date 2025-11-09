// pages/url/[slug].tsx (Next.js)
"use client";

import { useRouter, useParams } from "next/navigation";

export default function LonelyLinkPage() {
    const router = useRouter();
    const { slug } = useParams();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-green-100 text-center p-6">
            <h1 className="text-2xl font-bold text-black-700">🏝️ Hello, welcome to LonelyLand!</h1>
            <p className="mt-4 text-gray-700 text-sm">
                Link <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code> does not exist.
            </p>
            <p className="mt-2 text-gray-500">{`But don't worry, you're still welcome here. ❤️`}</p>

            <button
                onClick={() => router.push("/")}
                className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-all"
            >
                Back to LonelyNet
            </button>
        </div>
    );
}
