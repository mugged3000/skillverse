import { NailsIcon, SewingIcon, MakeupIcon, BarberIcon } from "@/components/icons/CraftIcons";

// The four floating craft photo tiles behind/around the phone mockup
// in the Hero visual column. Pure markup — Hero.jsx's GSAP timeline
// animates these by the .hero-tile class, scoped to the Hero section,
// so splitting this out changes nothing about how they animate.
export default function CraftTiles() {
  return (
    <>
      <div
        className="hero-tile absolute left-0 top-2 w-[42%] aspect-[3/4] rounded-[1.6rem] border border-emerald-light/30 overflow-hidden card-tilt hover:-translate-y-1"
        style={{ rotate: "-6deg" }}
      >
        {/*
          PUT A REAL NAIL TECH PHOTO HERE.
          Replace the <img> below with your own — Drop the image file in
          the /public/images/ folder of the project (create the folder
          if it doesn't exist yet) — Next.js serves anything under
          /public/ directly from "/".
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/nail.jpg"
          alt="Nail technician at work"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full p-5 flex flex-col justify-between">
          <NailsIcon className="w-8 h-8 text-gold-light" />
          <div>
            <p className="font-display font-semibold text-canvas">Nail Tech</p>
            <p className="text-xs text-thread/70 font-mono mt-1">1,240 pros</p>
          </div>
        </div>
      </div>

      <div
        className="hero-tile absolute left-[6%] bottom-0 w-[38%] aspect-square rounded-[1.6rem] border border-clay-light/30 overflow-hidden card-tilt hover:-translate-y-1"
        style={{ rotate: "4deg" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/tailor.jpg"
          alt="Tailor at a sewing machine"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full p-5 flex flex-col justify-between">
          <SewingIcon className="w-8 h-8 text-canvas" />
          <div>
            <p className="font-display font-semibold text-canvas">Tailoring</p>
            <p className="text-xs text-thread/80 font-mono mt-1">1,050 pros</p>
          </div>
        </div>
      </div>

      <div
        className="hero-tile absolute right-0 top-0 w-[40%] aspect-[4/3] rounded-[1.6rem] border border-gold-light/40 overflow-hidden card-tilt hover:-translate-y-1"
        style={{ rotate: "5deg" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/make.jpg"
          alt="Makeup artist applying makeup"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full p-5 flex flex-col justify-between">
          <MakeupIcon className="w-8 h-8 text-ink" />
          <div>
            <p className="font-display font-semibold text-ink">Makeup</p>
            <p className="text-xs text-ink/70 font-mono mt-1">870 pros</p>
          </div>
        </div>
      </div>

      <div
        className="hero-tile absolute right-[4%] bottom-4 w-[36%] aspect-[3/4] rounded-[1.6rem] border border-thread/15 overflow-hidden card-tilt hover:-translate-y-1"
        style={{ rotate: "-3deg" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/baber.jpg"
          alt="Barber giving a haircut"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full p-5 flex flex-col justify-between">
          <BarberIcon className="w-8 h-8 text-gold-light" />
          <div>
            <p className="font-display font-semibold text-canvas">Barbing</p>
            <p className="text-xs text-thread/70 font-mono mt-1">980 pros</p>
          </div>
        </div>
      </div>
    </>
  );
}