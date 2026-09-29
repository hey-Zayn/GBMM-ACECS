'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#EBECF0] p-6">
        <main className="w-full max-w-md rounded-3xl bg-[#F8F8FA] p-8 text-center shadow-[0_24px_80px_rgba(59,121,253,0.12)]">
          <h1 className="text-2xl font-semibold text-[#030507]">Something went wrong</h1>
          <p className="mt-3 text-sm text-slate-500">Please try again.</p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-[#030507] px-5 py-3 text-sm font-semibold text-white"
            onClick={reset}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
