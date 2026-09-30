import { AppLogo } from "@/components/custom/AppLogo";
export function AuthLoading() {
  return (
    <div role="status" className=" flex flex-col items-center justify-center gap-2 animate-pulse rounded-3xl bg-[#F2F3F7]" >
      <AppLogo />
    </div>
  )
}
