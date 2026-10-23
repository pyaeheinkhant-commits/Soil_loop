"use client";
import { useState } from "react";
import { Field, inputClass } from "./ui";
import { validMediaUrl } from "@/lib/operations";

export function PhotoInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [error, setError] = useState("");
  return <div className="space-y-2">
    <Field label="Real photo (optional)"><input className={inputClass} value={value.startsWith("data:") ? "" : value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or /media/garden.jpg" /></Field>
    <Field label="Or choose a photo from your device"><input className="block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError("");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 750000) { setError("Choose a JPG, PNG or WebP smaller than 750 KB for this browser demo."); e.target.value = ""; return; }
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.onerror = () => setError("Could not read this photo. Try another file.");
      reader.readAsDataURL(file);
    }} /></Field>
    {value ? <><RealMedia photo={value} description="Selected photo preview" /><button className="text-xs font-semibold text-leaf-800" type="button" onClick={() => onChange("")}>Remove photo</button></> : null}
    {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}
  </div>;
}

export function RealMedia({ photo, video, credit, description, transcript }: { photo?: string; video?: string; credit?: string; description: string; transcript?: string }) {
  const [failed, setFailed] = useState("");
  const [videoFailed, setVideoFailed] = useState("");
  return <figure className="space-y-2">
    {photo && validMediaUrl(photo, true) ? failed === photo ? <p className="rounded-2xl bg-cream-100 p-3 text-xs">Photo unavailable. {description}</p> : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={description} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(photo)} className="aspect-[4/3] w-full rounded-2xl object-cover" />
    ) : null}
    {video && validMediaUrl(video) ? videoFailed === video ? <p className="rounded-2xl bg-cream-100 p-3 text-xs">Video unavailable. Use a direct MP4 or WebM file.</p> : <video className="aspect-video w-full rounded-2xl bg-soil-900" controls playsInline preload="none" src={video} aria-label={description} onError={() => setVideoFailed(video)} /> : null}
    {(photo || video) && credit ? <figcaption className="text-xs text-soil-600">Photo / film: {credit}</figcaption> : null}
    {video && transcript ? <details className="text-xs leading-5 text-soil-600"><summary className="cursor-pointer font-semibold">Video description / transcript</summary><p className="mt-2 whitespace-pre-wrap">{transcript}</p></details> : null}
  </figure>;
}
