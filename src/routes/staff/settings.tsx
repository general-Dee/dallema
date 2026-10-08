import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { useDallema } from "@/lib/store";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/staff/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const current = useDallema((state) => state.settings);
  const save = useDallema((state) => state.updateSettings);
  const reset = useDallema((state) => state.resetDemo);
  const [form, setForm] = useState<Settings>(current);
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Settings</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        These details, the catalogue, prices, and stock are saved for the whole shop. A change here shows on the site, not only on this phone.
      </p>
      <form
        className="mt-4 max-w-2xl space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          save(form);
          toast.success("Settings saved");
        }}
      >
        <Field label="Store name" id="store">
          <input id="store" className={inputClass} value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} />
        </Field>
        <Field label="Address" id="address">
          <input id="address" className={inputClass} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </Field>
        <Field label="Phone" id="phone">
          <input id="phone" className={inputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </Field>
        <Field label="Hours" id="hours">
          <textarea id="hours" className={`${inputClass} min-h-24 py-2`} value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} />
        </Field>
        <Field label="Banner on the home page" id="banner">
          <textarea id="banner" className={`${inputClass} min-h-24 py-2`} value={form.bannerText} onChange={(event) => setForm({ ...form, bannerText: event.target.value })} />
        </Field>
        <Field label="Naira spent per loyalty point" id="earn">
          <input id="earn" type="number" className={inputClass} value={form.earnNairaPerPoint} onChange={(event) => setForm({ ...form, earnNairaPerPoint: Number(event.target.value) })} />
        </Field>
        <Field label="Naira value of 100 points" id="value">
          <input id="value" type="number" className={inputClass} value={form.nairaPer100Points} onChange={(event) => setForm({ ...form, nairaPer100Points: Number(event.target.value) })} />
        </Field>
        <Field label="Minimum points to redeem" id="minpts">
          <input id="minpts" type="number" className={inputClass} value={form.minRedeemPoints} onChange={(event) => setForm({ ...form, minRedeemPoints: Number(event.target.value) })} />
        </Field>
        <Field label="Furniture delivery fee" id="furn">
          <input id="furn" type="number" className={inputClass} value={form.furnitureDeliveryFee} onChange={(event) => setForm({ ...form, furnitureDeliveryFee: Number(event.target.value) })} />
        </Field>
        <h2 className="pt-2 font-display text-2xl">Zones</h2>
        {form.zones.map((zone, index) => (
          <div key={zone.id} className="grid gap-2 rounded-card border border-line bg-card p-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={zone.name} onChange={(event) => updateZone(index, { name: event.target.value })} />
            </Field>
            <Field label="Fee">
              <input className={inputClass} type="number" value={zone.fee} onChange={(event) => updateZone(index, { fee: Number(event.target.value) })} />
            </Field>
            <Field label="Minimum shop">
              <input className={inputClass} type="number" value={zone.minimum} onChange={(event) => updateZone(index, { minimum: Number(event.target.value) })} />
            </Field>
            <Field label="From km / to km">
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" aria-label="From kilometres" value={zone.minKm} onChange={(event) => updateZone(index, { minKm: Number(event.target.value) })} />
                <input className={inputClass} type="number" aria-label="To kilometres" value={zone.maxKm} onChange={(event) => updateZone(index, { maxKm: Number(event.target.value) })} />
              </div>
            </Field>
          </div>
        ))}
        <Button type="submit">Save settings</Button>
      </form>
      <Button
        variant="danger"
        className="mt-8"
        onClick={() => {
          if (window.confirm("Reset products, orders, and settings to the demo seed? Your staff sign-in stays.")) {
            reset();
            toast.success("Demo data restored");
          }
        }}
      >
        Reset demo data
      </Button>
    </div>
  );

  function updateZone(index: number, patch: Partial<Settings["zones"][number]>) {
    setForm({
      ...form,
      zones: form.zones.map((zone, zoneIndex) => (zoneIndex === index ? { ...zone, ...patch } : zone)),
    });
  }
}
