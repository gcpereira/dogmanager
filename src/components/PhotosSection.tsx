"use client";

import { useEffect, useRef, useState } from "react";
import { uploadPhoto, deletePhoto } from "@/app/(app)/dogs/actions";

type Photo = {
  id: number;
  filename: string;
};

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 1600;
  const ratio = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.82),
  );
  if (!blob) throw new Error("falha ao gerar imagem");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export default function PhotosSection({
  dogId,
  photos,
}: {
  dogId: number;
  photos: Photo[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Photo | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setPending(true);
    let firstError: string | null = null;
    try {
      for (const file of files) {
        try {
          const compressed = await compressImage(file);
          const fd = new FormData();
          fd.append("photo", compressed);
          const result = await uploadPhoto(dogId, undefined, fd);
          if (result?.error && !firstError) firstError = result.error;
        } catch {
          if (!firstError) firstError = "Erro ao processar imagem.";
        }
      }
      if (firstError) setError(firstError);
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Fotos</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition flex items-center gap-1.5"
        >
          {pending ? (
            "Enviando..."
          ) : (
            <>
              <span>📷</span> Adicionar
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhuma foto adicionada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <button
                type="button"
                onClick={() => setActive(photo)}
                className="block w-full h-full rounded-lg overflow-hidden bg-gray-100 active:scale-[0.98] transition"
              >
                <img
                  src={`/uploads/dogs/${photo.filename}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
              <form
                action={deletePhoto.bind(null, photo.id, dogId)}
                className="absolute top-1 right-1"
              >
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Excluir esta foto?")) e.preventDefault();
                  }}
                  aria-label="Excluir foto"
                  className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center text-base leading-none transition"
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={`/uploads/dogs/${active.filename}`}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
