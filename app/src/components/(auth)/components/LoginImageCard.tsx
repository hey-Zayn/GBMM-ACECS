export function LoginImageCard() {
  return (
    <aside
      className="relative hidden min-h-[95vh] overflow-hidden rounded-md bg-cover bg-cover lg:block border border-gray-100"
      style={{ backgroundImage: "url('/images/login-bg.gif')" }}
      aria-label="GMASS email campaign workspace"
    >
      <div className="absolute inset-0 " />
      <div className="relative z-10  px-6 text-white">
        <h2 className="mt-5 max-w-sm text-3xl font-semibold text-black/80 leading-8">
          Build better email campaigns.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-5 text-black/75">
          Reach the right people with focused, thoughtful <br /> outreach  that scales with your work.
        </p>
      </div>
    </aside>
  )
}
