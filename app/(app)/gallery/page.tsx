import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { getGalleryPhotos, getViewerContext } from "@/lib/data/queries";

export default async function GalleryPage() {
  const viewer = await getViewerContext();
  const photos = await getGalleryPhotos();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-foreground">Every photo, all at once.</h1>
      </section>

      {viewer?.relationship ? (
        photos.length ? (
          <GalleryGrid photos={photos} />
        ) : (
          <EmptyState
            title="No photos yet"
            body="Upload images inside your memories and they'll bloom here into a private gallery."
            ctaHref="/memories/new"
            ctaLabel="Add photo memory"
          />
        )
      ) : (
        <EmptyState
          title="Create your diary first"
          body="The gallery appears after your two-person space is created."
          ctaHref="/dashboard"
          ctaLabel="Go to dashboard"
        />
      )}
    </div>
  );
}
