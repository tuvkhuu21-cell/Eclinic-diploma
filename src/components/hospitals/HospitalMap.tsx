export function HospitalMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return <div className="grid h-72 place-items-center rounded-lg border border-sky-100 bg-cyanSoft text-center text-sm text-slate-600"><div><p className="font-bold text-navy">{name}</p><p>Google Map marker: {lat}, {lng}</p><p className="mt-2">GOOGLE_MAPS_API_KEY тохируулсны дараа интерактив зураглал гарна.</p></div></div>;
  }
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}`;
  return <iframe title={`${name} map`} src={src} className="h-72 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
}

