"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Images, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDamagePhotoAction, deleteDamagePhotoAction } from "@/lib/actions/work-orders";

type Photo = {
  id: string;
  photoPath: string;
  description: string | null;
};

export function PhotoChecklist({ workOrderId, photos }: { workOrderId: string; photos: Photo[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lightbox, setLightbox] = useState<string | null>(null);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    otherInputRef: React.RefObject<HTMLInputElement | null>
  ) {
    const selected = e.target.files?.[0];
    if (otherInputRef.current) otherInputRef.current.value = "";
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    } else {
      setFile(null);
      setPreview(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      toast.error("Selecione uma foto (câmera ou galeria).");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);
    if (descriptionInputRef.current?.value) {
      formData.append("description", descriptionInputRef.current.value);
    }

    startTransition(async () => {
      try {
        await addDamagePhotoAction(workOrderId, formData);
        formRef.current?.reset();
        setFile(null);
        setPreview(null);
        toast.success("Foto adicionada ao checklist.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
      }
    });
  }

  function handleDelete(photoId: string) {
    if (!window.confirm("Remover esta foto do checklist?")) return;
    startTransition(async () => {
      try {
        await deleteDamagePhotoAction(photoId, workOrderId);
      } catch {
        toast.error("Não foi possível remover a foto.");
      }
    });
  }

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3">
        <input
          ref={cameraInputRef}
          type="file"
          name="photo"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e, galleryInputRef)}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          name="photo"
          accept="image/*"
          onChange={(e) => handleFileChange(e, cameraInputRef)}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="size-4" /> Câmera
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Images className="size-4" /> Galeria
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input ref={descriptionInputRef} name="description" placeholder="Descrição da avaria (opcional)" />
          </div>
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            Adicionar
          </Button>
        </div>
      </form>

      {preview && (
        <div className="mb-4 flex items-center gap-3">
          <Image
            src={preview}
            alt="Pré-visualização"
            width={80}
            height={80}
            className="size-20 rounded-md object-cover"
            unoptimized
          />
          <span className="text-sm text-muted-foreground">Pronto para enviar</span>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma foto registrada no checklist.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-md border border-border-subtle">
              <button type="button" onClick={() => setLightbox(`/api/files/${photo.photoPath}`)} className="block w-full">
                <Image
                  src={`/api/files/${photo.photoPath}`}
                  alt={photo.description ?? "Foto da avaria"}
                  width={200}
                  height={200}
                  className="aspect-square w-full object-cover"
                  unoptimized
                />
              </button>
              {photo.description && (
                <p className="truncate bg-black/60 px-1.5 py-1 text-[11px] text-white">{photo.description}</p>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute right-4 top-4 text-white" onClick={() => setLightbox(null)}>
            <X className="size-6" />
          </button>
          <Image src={lightbox} alt="Foto ampliada" width={800} height={800} className="max-h-full max-w-full rounded-md object-contain" unoptimized />
        </div>
      )}
    </div>
  );
}
