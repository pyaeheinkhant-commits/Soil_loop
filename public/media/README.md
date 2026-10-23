# Real media to supply

The app keeps its illustrations. Real media supplements them and should depict your actual programme, with permission from the photographer and identifiable participants.

Please supply:

- `dropoff.jpg`: landscape photo of the actual collection bin and surroundings, with the sign visible.
- `sorting.jpg`: separated accepted scraps, a covered caddy and removed packaging.
- `compost.jpg`: the partner's composting bay or pile.
- `garden.jpg`: garden beds where compost was used, ideally with a dated before/after pair.
- `sorting.mp4` or `garden-tour.mp4`: 15–40 seconds of the actual sorting process or garden, with a short text description/transcript. Captions burned into spoken footage are helpful.

Include location, capture date, photographer/filmmaker credit and confirmation of permission. Do not substitute AI images or unrelated stock photos as evidence of this programme.

For permanent assets, place files here and configure `src/lib/programme-media.ts` using `/media/filename.jpg` URLs. Sorting, drop-off and compost pages already render configured assets. Example:

```ts
export const programmeMedia = {
  sorting: {
    photo: "/media/sorting.jpg",
    video: "/media/sorting.mp4",
    credit: "Project team — photographer name",
    description: "A resident removes packaging before adding scraps to the caddy.",
    transcript: "Describe the visible actions and transcribe any speech here.",
  },
};
```

For garden records, use Gardener → Use compost → Add real photos or a video. The form supports image upload (JPG/PNG/WebP, up to 750 KB), HTTPS photo URLs, local `/media/` paths and direct MP4/WebM URLs. Video files are not stored in localStorage. Attach credits and a description/transcript. Media does not autoplay. Failed media shows a readable fallback.
