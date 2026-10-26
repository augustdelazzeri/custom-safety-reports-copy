"use client";

/**
 * A new QR code: a name people recognise, where it hangs and, if it is stuck on a machine, the
 * asset. Copy from the redesign (lab.json → accessPoints). The code is kept in this page only.
 */

import { RdField, fieldClass } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ASSETS, LOCATIONS } from "@/lib/three-cases/data";
import { useState } from "react";

export interface NewAccessPoint {
  name: string;
  locationId: string;
  assetId?: string;
}

export function NewAccessPointDialog({ open, onOpenChange, takenNames, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; takenNames: string[]; onCreate: (point: NewAccessPoint) => void }) {
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState("plant");
  const [assetId, setAssetId] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const duplicate = takenNames.some((n) => n.trim().toLowerCase() === trimmed.toLowerCase());
  const error = !trimmed ? "Give it a name people will recognise." : duplicate ? "Another QR code already has this name." : undefined;
  const assets = ASSETS.filter((a) => a.locationId === locationId);

  const close = () => {
    setName("");
    setLocationId("plant");
    setAssetId("");
    setShowErrors(false);
    onOpenChange(false);
  };

  const create = () => {
    setShowErrors(true);
    if (error) return;
    onCreate({ name: trimmed, locationId, assetId: assetId || undefined });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="gap-6 sm:max-w-md md:max-w-md">
        <DialogHeader>
          <DialogTitle>New QR code</DialogTitle>
          <DialogDescription>An access point is a QR code you print and stick where the work happens.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
        >
          <RdField label="Name" required hint={(showErrors || duplicate) && error ? <span className="text-destructive">{error}</span> : undefined}>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Loading dock, bay 3 pillar" aria-invalid={(showErrors && Boolean(error)) || (duplicate && Boolean(trimmed)) || undefined} />
          </RdField>
          <RdField label="Location" hint={locationId === "plant" ? "Company-wide: whoever scans it is asked where they are." : "Reports from this code are filed at this location."}>
            <select data-slot="select-trigger"
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setAssetId("");
              }}
              className={fieldClass}
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id === "plant" ? "Company-wide (Springfield Plant)" : l.name}
                </option>
              ))}
            </select>
          </RdField>
          {assets.length ? (
            <RdField label="Asset" hint="Optional. Reports from the code are filed on this asset too.">
              <select data-slot="select-trigger" value={assetId} onChange={(e) => setAssetId(e.target.value)} className={fieldClass}>
                <option value="">No asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </RdField>
          ) : null}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">Create QR code</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
