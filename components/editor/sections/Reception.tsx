"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

const PARTY_TYPES = ["Tiệc cưới", "Tiệc báo hỷ", "Tiệc đính hôn"] as const
type PartyType = (typeof PARTY_TYPES)[number]

interface ReceptionData {
  partyType: PartyType
  date: string
  time: string
  timeFormat: "24h" | "am_pm"
  showArrivalTime: boolean
  arrivalTime: string
  showStartTime: boolean
  startTime: string
  showCountdown: boolean
  address: string
  showMap: boolean
}

const defaultReception: ReceptionData = {
  partyType: "Tiệc cưới",
  date: "",
  time: "",
  timeFormat: "24h",
  showArrivalTime: false,
  arrivalTime: "",
  showStartTime: false,
  startTime: "",
  showCountdown: false,
  address: "",
  showMap: false,
}

function getGoogleMapsEmbedUrl(address: string) {
  const encoded = encodeURIComponent(address)
  return `https://www.google.com/maps?q=${encoded}&output=embed`
}

export function Reception() {
  const wedding = useWeddingStore((s) => s.wedding)
  const updateField = useWeddingStore((s) => s.updateField)

  if (!wedding) return null

  // Read from store, fallback to default
  const data: ReceptionData = {
    ...defaultReception,
    ...((wedding.reception as Partial<ReceptionData>) ?? {}),
  }

  const update = <K extends keyof ReceptionData>(field: K, value: ReceptionData[K]) => {
    updateField("reception", { ...data, [field]: value })
  }

  const visible = !!data.date || !!data.address

  return (
    <SectionWrapper
      title="Tiệc cưới"
      icon="🥂"
      defaultOpen
    >
      <div className="space-y-4">
        {/* Party type tabs */}
        <div className="space-y-1">
          <Label>Loại tiệc</Label>
          <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
            {PARTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => update("partyType", type)}
                className={[
                  "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all",
                  data.partyType === type
                    ? "bg-[#e83e8c] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="reception-date">Ngày tổ chức</Label>
            <Input
              id="reception-date"
              type="date"
              value={data.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reception-time">Giờ tổ chức</Label>
            <Input
              id="reception-time"
              type="time"
              value={data.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </div>
        </div>

        {/* Time format toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Định dạng giờ</p>
            <p className="text-xs text-muted-foreground">
              {data.timeFormat === "24h" ? "24 giờ" : "Sáng/Chiều (AM/PM)"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={
                data.timeFormat === "24h" ? "font-semibold text-foreground" : ""
              }
            >
              24h
            </span>
            <Switch
              checked={data.timeFormat === "am_pm"}
              onCheckedChange={(checked) =>
                update("timeFormat", checked ? "am_pm" : "24h")
              }
            />
            <span
              className={
                data.timeFormat === "am_pm"
                  ? "font-semibold text-foreground"
                  : ""
              }
            >
              SA/CH
            </span>
          </div>
        </div>

        {/* Arrival time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Giờ đón khách</Label>
            <Switch
              checked={data.showArrivalTime}
              onCheckedChange={(c) => update("showArrivalTime", c)}
              size="sm"
            />
          </div>
          {data.showArrivalTime && (
            <Input
              type="time"
              value={data.arrivalTime}
              onChange={(e) => update("arrivalTime", e.target.value)}
              placeholder="Giờ đón khách"
            />
          )}
        </div>

        {/* Start time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Giờ khai tiệc</Label>
            <Switch
              checked={data.showStartTime}
              onCheckedChange={(c) => update("showStartTime", c)}
              size="sm"
            />
          </div>
          {data.showStartTime && (
            <Input
              type="time"
              value={data.startTime}
              onChange={(e) => update("startTime", e.target.value)}
              placeholder="Giờ khai tiệc"
            />
          )}
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Đồng hồ đếm ngược</p>
            <p className="text-xs text-muted-foreground">
              Hiển thị đếm ngược đến ngày cưới
            </p>
          </div>
          <Switch
            checked={data.showCountdown}
            onCheckedChange={(c) => update("showCountdown", c)}
          />
        </div>

        {/* Address */}
        <div className="space-y-1">
          <Label htmlFor="reception-address">Địa chỉ</Label>
          <Textarea
            id="reception-address"
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            rows={2}
          />
        </div>

        {/* Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Bản đồ</p>
              <p className="text-xs text-muted-foreground">
                Google Maps tự động theo địa chỉ
              </p>
            </div>
            <Switch
              checked={data.showMap}
              onCheckedChange={(c) => update("showMap", c)}
            />
          </div>

          {data.showMap && data.address && (
            <div className="rounded-lg border border-border overflow-hidden">
              <iframe
                title="Bản đồ"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-44 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-muted/30 text-xs text-[#e83e8c] hover:underline w-full"
              >
                🗺️ Mở Google Maps
              </a>
            </div>
          )}

          {data.showMap && !data.address && (
            <p className="text-xs text-muted-foreground">
              Nhập địa chỉ ở trên để hiển thị bản đồ
            </p>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
}
