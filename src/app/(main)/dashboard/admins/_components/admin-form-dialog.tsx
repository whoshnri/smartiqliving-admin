"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import type { AdminUserRow } from "@/types";

const MIN_PASSWORD_LENGTH = 8;

const AdminFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.email("Enter a valid email."),
  password: z.string(),
  role: z.enum(["SUPERUSER", "ADMIN"]),
  isActive: z.boolean(),
});

type AdminFormValues = z.infer<typeof AdminFormSchema>;

function submitLabel(isEdit: boolean, isSubmitting: boolean) {
  if (isSubmitting) return "Saving…";
  return isEdit ? "Save changes" : "Add admin";
}

function buildDefaultValues(admin: AdminUserRow | null): AdminFormValues {
  return {
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    password: "",
    role: admin?.role ?? "ADMIN",
    isActive: admin?.isActive ?? true,
  };
}

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUserRow | null;
  onSaved: () => void;
}

export function AdminFormDialog({ open, onOpenChange, admin, onSaved }: AdminFormDialogProps) {
  const isEdit = Boolean(admin);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: buildDefaultValues(null),
  });

  useEffect(() => {
    if (open) reset(buildDefaultValues(admin));
  }, [open, admin, reset]);

  async function onSubmit(values: AdminFormValues) {
    const password = values.password.trim();

    if (isEdit && password && password.length < MIN_PASSWORD_LENGTH) {
      setError("password", {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    if (!isEdit && password.length < MIN_PASSWORD_LENGTH) {
      setError("password", {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    const payload = isEdit
      ? {
          name: values.name,
          role: values.role,
          isActive: values.isActive,
          ...(password ? { password } : {}),
        }
      : {
          name: values.name,
          email: values.email,
          password,
          role: values.role,
        };

    const response = await fetch(isEdit ? `/api/admins/${admin?.id}` : "/api/admins", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      toast.error(body?.message ?? "Unable to save this admin.");
      return;
    }

    toast.success(isEdit ? "Admin updated." : "Admin added.");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit admin" : "Add admin"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this person's access, or set a new password."
              : "Create an account so this person can sign in to the CRM."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Name</Label>
            <Input id="admin-name" {...register("name")} />
            {errors.name ? <p className="text-destructive text-sm">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" disabled={isEdit} {...register("email")} />
            {errors.email ? <p className="text-destructive text-sm">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-role">Role</Label>
            <NativeSelect
              id="admin-role"
              className="w-full"
              value={watch("role")}
              onChange={(event) => setValue("role", event.target.value as AdminFormValues["role"])}
            >
              <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
              <NativeSelectOption value="SUPERUSER">Superuser</NativeSelectOption>
            </NativeSelect>
            <p className="text-muted-foreground text-xs">
              Superusers can add and manage other admins. Admins can work with every form and contact.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">{isEdit ? "New password (optional)" : "Password"}</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              placeholder={isEdit ? "Leave blank to keep the current password" : "At least 8 characters"}
              {...register("password")}
            />
            {errors.password ? <p className="text-destructive text-sm">{errors.password.message}</p> : null}
          </div>

          {isEdit ? (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="admin-active">Active</Label>
                <p className="text-muted-foreground text-xs">Inactive admins cannot sign in.</p>
              </div>
              <Switch
                id="admin-active"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel(isEdit, isSubmitting)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
