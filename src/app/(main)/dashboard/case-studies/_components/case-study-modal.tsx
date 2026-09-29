"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CaseStudyRow } from "@/types";

const CaseStudyFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  client: z.string().trim(),
  location: z.string().trim(),
  summary: z.string().trim().min(1, "Summary is required."),
  challenge: z.string().trim(),
  requirement: z.string().trim(),
  solution: z.string().trim(),
  outcome: z.string().trim(),
  services: z.string().trim(),
  coverImage: z.string().trim(),
  completedAt: z.string(),
  published: z.boolean(),
  images: z.array(z.object({ url: z.string().trim() })),
  metrics: z.array(z.object({ value: z.string().trim(), label: z.string().trim() })),
});

type CaseStudyFormValues = z.infer<typeof CaseStudyFormSchema>;

function buildDefaultValues(caseStudy: CaseStudyRow | null): CaseStudyFormValues {
  return {
    title: caseStudy?.title ?? "",
    slug: caseStudy?.slug ?? "",
    client: caseStudy?.client ?? "",
    location: caseStudy?.location ?? "",
    summary: caseStudy?.summary ?? "",
    challenge: caseStudy?.challenge ?? "",
    requirement: caseStudy?.requirement ?? "",
    solution: caseStudy?.solution ?? "",
    outcome: caseStudy?.outcome ?? "",
    services: caseStudy?.services?.join(", ") ?? "",
    coverImage: caseStudy?.coverImage ?? "",
    completedAt: caseStudy?.completedAt?.slice(0, 10) ?? "",
    published: caseStudy?.published ?? false,
    images: caseStudy?.images?.length ? caseStudy.images.map((url) => ({ url })) : [{ url: "" }],
    metrics: caseStudy?.metrics?.length
      ? caseStudy.metrics.map((metric) => ({
          value: metric.value,
          label: metric.label,
        }))
      : [],
  };
}

interface CaseStudyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseStudy: CaseStudyRow | null;
  onSaved: () => void;
}

export function CaseStudyModal({ open, onOpenChange, caseStudy, onSaved }: CaseStudyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CaseStudyFormValues>({
    resolver: zodResolver(CaseStudyFormSchema),
    defaultValues: buildDefaultValues(null),
  });

  const images = useFieldArray({ control, name: "images" });
  const metrics = useFieldArray({ control, name: "metrics" });

  useEffect(() => {
    if (!open) return;
    reset(buildDefaultValues(caseStudy));
  }, [open, caseStudy, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      images: values.images.map((image) => image.url.trim()).filter(Boolean),
      metrics: values.metrics
        .map((metric) => ({
          value: metric.value.trim(),
          label: metric.label.trim(),
        }))
        .filter((metric) => metric.value || metric.label),
    };

    try {
      const response = await fetch(caseStudy ? `/api/case-studies/${caseStudy.id}` : "/api/case-studies", {
        method: caseStudy ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Unable to save case study.");
      }

      toast.success(caseStudy ? "Case study updated" : "Case study created");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save case study.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{caseStudy ? "Edit case study" : "Add case study"}</DialogTitle>
          <DialogDescription>
            Case studies power the projects section on the public site. Publish one to make it visible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cs-title">Title</Label>
              <Input id="cs-title" {...register("title")} />
              {errors.title ? <p className="text-destructive text-xs">{errors.title.message}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-slug">Slug</Label>
              <Input id="cs-slug" {...register("slug")} />
              {errors.slug ? <p className="text-destructive text-xs">{errors.slug.message}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-client">Client</Label>
              <Input id="cs-client" {...register("client")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-location">Location</Label>
              <Input id="cs-location" {...register("location")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-completed">Completed</Label>
              <Input id="cs-completed" type="date" {...register("completedAt")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-services">Systems provided</Label>
              <Input id="cs-services" placeholder="CCTV, Access control" {...register("services")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cs-summary">Summary</Label>
            <Textarea id="cs-summary" rows={4} {...register("summary")} />
            {errors.summary ? <p className="text-destructive text-xs">{errors.summary.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cs-challenge">Challenge</Label>
              <Textarea id="cs-challenge" rows={3} {...register("challenge")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-requirement">Requirement</Label>
              <Textarea id="cs-requirement" rows={3} {...register("requirement")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-solution">Solution</Label>
              <Textarea id="cs-solution" rows={3} {...register("solution")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cs-outcome">Outcome</Label>
              <Textarea id="cs-outcome" rows={3} {...register("outcome")} />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Metrics</Label>
                <p className="text-muted-foreground text-xs">Short headline figures shown on the public case study.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => metrics.append({ value: "", label: "" })}
              >
                <Plus />
                Add metric
              </Button>
            </div>
            {metrics.fields.length === 0 ? (
              <p className="text-muted-foreground text-xs">No metrics added.</p>
            ) : (
              <div className="grid gap-2">
                {metrics.fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Input className="w-32" placeholder="Value" {...register(`metrics.${index}.value`)} />
                    <Input className="flex-1" placeholder="Label" {...register(`metrics.${index}.label`)} />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => metrics.remove(index)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cs-cover">Cover image URL</Label>
            <Input id="cs-cover" {...register("coverImage")} />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Project images</Label>
                <p className="text-muted-foreground text-xs">Optional. Add photographs when they are available.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => images.append({ url: "" })}>
                <Plus />
                Add image
              </Button>
            </div>
            <div className="grid gap-2">
              {images.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-1">
                    <Input placeholder={`Image ${index + 1} URL`} {...register(`images.${index}.url`)} />
                    {errors.images?.[index]?.url ? (
                      <p className="text-destructive text-xs">{errors.images[index]?.url?.message}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={images.fields.length <= 1}
                    onClick={() => images.remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {images.fields.length} image{images.fields.length === 1 ? "" : "s"} added
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="cs-published">Published</Label>
              <p className="text-muted-foreground text-xs">Only published case studies appear on the public site.</p>
            </div>
            <Controller
              control={control}
              name="published"
              render={({ field }) => (
                <Switch id="cs-published" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save case study"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
