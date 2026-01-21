import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Image as ImageIcon, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function FilePicker({ label, value, onChange }) {
  const preview = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (value && typeof value !== "string") {
        try {
          URL.revokeObjectURL(value);
        } catch {
          // ignore
        }
      }
    };
  }, [value]);

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-sm font-semibold text-[#0F172A]">{label}</p>

      <div className="mt-3 flex items-start gap-4">
        <div className="h-24 w-24 overflow-hidden rounded-xl border border-black/10 bg-[#F8FAFC]">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          <p className="mt-2 text-xs text-[#64748B]">
            Upload a hero image (recommended: wide landscape, 1600×900 or higher).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageManager() {
  const [loading, setLoading] = useState(false);

  // Can be a URL (string) or a File (object)
  const [slide1, setSlide1] = useState(null);
  const [slide2, setSlide2] = useState(null);
  const [slide3, setSlide3] = useState(null);

  // Optional text controls (future-proof)
  const [title1, setTitle1] = useState("Taste Bihar, delivered fresh.");
  const [title2, setTitle2] = useState("Crunchy classics. Honest ingredients.");
  const [title3, setTitle3] = useState("Gift packs for every occasion.");

  useEffect(() => {
    // Backend requirement:
    // GET /api/homepage -> { success: true, homepage: { heroSlides: [...] } }
    (async () => {
      try {
        const res = await api.get("/homepage", {
          params: { t: Date.now() },
          // avoid custom headers to prevent CORS preflight failures
          skipErrorToast: true,
        });
        const heroSlides = res?.data?.homepage?.heroSlides || res?.data?.heroSlides;
        if (Array.isArray(heroSlides) && heroSlides.length) {
          setSlide1(heroSlides[0]?.imageUrl || null);
          setSlide2(heroSlides[1]?.imageUrl || null);
          setSlide3(heroSlides[2]?.imageUrl || null);
          setTitle1(heroSlides[0]?.title || title1);
          setTitle2(heroSlides[1]?.title || title2);
          setTitle3(heroSlides[2]?.title || title3);
        }
      } catch {
        // endpoint may not exist yet; ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    try {
      setLoading(true);

      // Backend requirement (recommended):
      // POST /api/admin/homepage (multipart/form-data)
      // - hero1, hero2, hero3 files (optional)
      // - heroSlides JSON string (titles/ctas/etc.)
      const fd = new FormData();
      if (slide1 && typeof slide1 !== "string") fd.append("hero1", slide1);
      if (slide2 && typeof slide2 !== "string") fd.append("hero2", slide2);
      if (slide3 && typeof slide3 !== "string") fd.append("hero3", slide3);

      fd.append(
        "heroSlides",
        JSON.stringify([
          { title: title1 },
          { title: title2 },
          { title: title3 },
        ])
      );

      const res = await api.post("/admin/homepage", fd);

      if (!res?.data?.success) throw new Error(res?.data?.message || "Save failed");
      toast.success("Homepage images updated");

      // Re-fetch to ensure we show exactly what the website will use.
      try {
        const refreshed = await api.get("/homepage", {
          params: { t: Date.now() },
          // avoid custom headers to prevent CORS preflight failures
          skipErrorToast: true,
        });
        const heroSlides =
          refreshed?.data?.homepage?.heroSlides || refreshed?.data?.heroSlides || null;
        if (Array.isArray(heroSlides) && heroSlides.length) {
          setSlide1(heroSlides[0]?.imageUrl || null);
          setSlide2(heroSlides[1]?.imageUrl || null);
          setSlide3(heroSlides[2]?.imageUrl || null);
          setTitle1(heroSlides[0]?.title || title1);
          setTitle2(heroSlides[1]?.title || title2);
          setTitle3(heroSlides[2]?.title || title3);
        }
      } catch {
        // ignore; backend may not have GET yet
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Could not save homepage images. Backend endpoint required."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-14 pt-24">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0F172A]">
            Homepage Images
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Upload hero slider images used on the homepage.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Hero slider</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              3 slides. Autoplay every 4 seconds on the website.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="space-y-3">
                <FilePicker label="Slide 1 image" value={slide1} onChange={setSlide1} />
                <input
                  value={title1}
                  onChange={(e) => setTitle1(e.target.value)}
                  placeholder="Slide 1 title"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-3">
                <FilePicker label="Slide 2 image" value={slide2} onChange={setSlide2} />
                <input
                  value={title2}
                  onChange={(e) => setTitle2(e.target.value)}
                  placeholder="Slide 2 title"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-3">
                <FilePicker label="Slide 3 image" value={slide3} onChange={setSlide3} />
                <input
                  value={title3}
                  onChange={(e) => setTitle3(e.target.value)}
                  placeholder="Slide 3 title"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={save}
                disabled={loading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#8E1B1B] px-5 py-3 text-sm font-semibold text-white",
                  "hover:bg-[#741616] disabled:opacity-50"
                )}
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Backend required</h2>
            <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
              For this screen to work, backend should provide:
              <br />
              - GET <span className="font-mono">/api/homepage</span> (current homepage config)
              <br />
              - POST <span className="font-mono">/api/admin/homepage</span> (multipart upload + save)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

