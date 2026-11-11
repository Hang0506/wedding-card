"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

const EVENT_TYPES = ["Lễ Vu Quy","Lễ Thành Hôn","Lễ Đính Hôn","Lễ Rước Dâu","Khác"]

interface EventItem {
  id: string; type: string; name: string; date: string; time: string; address: string
}

function newEvent(): EventItem {
  return { id: Math.random().toString(36).slice(2), type: EVENT_TYPES[0], name:"", date:"", time:"", address:"" }
}

export function Events() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  if (!wedding) return null

  // Read events from store — default to 1 empty event if none
  const events: EventItem[] = (wedding.events as EventItem[])?.length
    ? (wedding.events as EventItem[])
    : [newEvent()]

  const save = (updated: EventItem[]) => updateField("events", updated)

  const handleField = (id: string, field: keyof EventItem, value: string) =>
    save(events.map(ev => ev.id === id ? { ...ev, [field]: value } : ev))

  const handleAdd = () => save([...events, newEvent()])

  const handleRemove = (id: string) => save(events.filter(ev => ev.id !== id))

  return (
    <SectionWrapper
      title="Thông tin lễ cưới"
      icon="💒"
      showToggle
      toggleValue={events.some(e => e.name || e.date)}
      onToggleChange={(val) => { if (!val) save([]) }}
    >
      <div className="space-y-3">
        {events.map((ev, idx) => (
          <div key={ev.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e83e8c]">Lễ {idx + 1}</span>
              {events.length > 1 && (
                <button onClick={() => handleRemove(ev.id)} className="text-destructive text-lg leading-none px-1">×</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Loại lễ</Label>
                <select
                  value={ev.type}
                  onChange={e => handleField(ev.id, "type", e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tên lễ</Label>
                <Input value={ev.name} onChange={e => handleField(ev.id, "name", e.target.value)} placeholder="VD: Lễ cưới" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Ngày</Label>
                <Input type="date" value={ev.date} onChange={e => handleField(ev.id, "date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Giờ</Label>
                <Input type="time" value={ev.time} onChange={e => handleField(ev.id, "time", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Địa chỉ</Label>
              <Textarea value={ev.address} onChange={e => handleField(ev.id, "address", e.target.value)} placeholder="Địa điểm tổ chức" rows={2} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAdd}
          className="w-full border-dashed border-[#e83e8c]/50 text-[#e83e8c] hover:bg-[#e83e8c]/5">
          + Thêm lễ
        </Button>
      </div>
    </SectionWrapper>
  )
}
