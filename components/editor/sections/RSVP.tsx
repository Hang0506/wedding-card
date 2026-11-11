"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { SectionWrapper } from "@/components/editor/SectionWrapper"
import { useWeddingStore } from "@/store/weddingStore"

type DisplayMode = "button" | "inline"
type GuestMode = "free" | "limited"
type QuestionType = "text" | "select" | "number"

interface RSVPQuestion {
  id: string
  text: string
  type: QuestionType
  options: string[]
}

interface RSVPConfig {
  enabled: boolean
  displayMode: DisplayMode
  guestMode: GuestMode
  guestLimit: number
  questions: RSVPQuestion[]
}

function createQuestion(): RSVPQuestion {
  return {
    id: Math.random().toString(36).slice(2),
    text: "",
    type: "text",
    options: [],
  }
}

const DEFAULT_CONFIG: RSVPConfig = {
  enabled: false,
  displayMode: "button",
  guestMode: "free",
  guestLimit: 2,
  questions: [],
}

function parseConfig(raw: unknown): RSVPConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_CONFIG
  const r = raw as Record<string, unknown>
  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : false,
    displayMode: (r.displayMode === "inline" ? "inline" : "button") as DisplayMode,
    guestMode: (r.guestMode === "limited" ? "limited" : "free") as GuestMode,
    guestLimit: typeof r.guestLimit === "number" ? r.guestLimit : 2,
    questions: Array.isArray(r.questions)
      ? (r.questions as RSVPQuestion[]).map((q) => ({
          id: typeof q.id === "string" ? q.id : Math.random().toString(36).slice(2),
          text: typeof q.text === "string" ? q.text : "",
          type: (["text", "select", "number"].includes(q.type) ? q.type : "text") as QuestionType,
          options: Array.isArray(q.options) ? q.options : [],
        }))
      : [],
  }
}

interface QuestionCardProps {
  question: RSVPQuestion
  index: number
  onChange: (id: string, updated: Partial<RSVPQuestion>) => void
  onRemove: (id: string) => void
}

function QuestionCard({ question, index, onChange, onRemove }: QuestionCardProps) {
  const [optionsText, setOptionsText] = useState(question.options.join("\n"))

  const handleOptionsChange = (raw: string) => {
    setOptionsText(raw)
    const opts = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    onChange(question.id, { options: opts })
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#e83e8c]">
          Câu hỏi {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(question.id)}
          className="text-destructive hover:text-destructive h-6 w-6"
          aria-label="Xóa câu hỏi"
        >
          ×
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`q-text-${question.id}`}>Nội dung câu hỏi</Label>
        <Input
          id={`q-text-${question.id}`}
          value={question.text}
          onChange={(e) => onChange(question.id, { text: e.target.value })}
          placeholder="VD: Bạn tham dự với mấy người?"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`q-type-${question.id}`}>Loại câu trả lời</Label>
        <select
          id={`q-type-${question.id}`}
          value={question.type}
          onChange={(e) =>
            onChange(question.id, { type: e.target.value as QuestionType })
          }
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="text">Văn bản</option>
          <option value="number">Số</option>
          <option value="select">Chọn từ danh sách</option>
        </select>
      </div>

      {question.type === "select" && (
        <div className="space-y-1">
          <Label htmlFor={`q-opts-${question.id}`}>
            Tùy chọn (mỗi dòng một lựa chọn)
          </Label>
          <textarea
            id={`q-opts-${question.id}`}
            value={optionsText}
            onChange={(e) => handleOptionsChange(e.target.value)}
            placeholder={"Có\nKhông\nCó thể"}
            rows={3}
            className="flex w-full min-h-16 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
    </div>
  )
}

export function RSVP() {
  const { updateField } = useWeddingStore()
  // Load initial config from store (wedding.rsvpConfig saved in DB)
  const storedRsvpConfig = useWeddingStore((s) => s.wedding?.rsvpConfig)

  const [config, setConfig] = useState<RSVPConfig>(() =>
    parseConfig(storedRsvpConfig)
  )

  const update = <K extends keyof RSVPConfig>(
    field: K,
    value: RSVPConfig[K]
  ) => {
    const updated = { ...config, [field]: value }
    setConfig(updated)
    updateField("rsvpConfig", updated)
  }

  const handleQuestionChange = (id: string, partial: Partial<RSVPQuestion>) => {
    const updated = config.questions.map((q) =>
      q.id === id ? { ...q, ...partial } : q
    )
    update("questions", updated)
  }

  const handleQuestionRemove = (id: string) => {
    update(
      "questions",
      config.questions.filter((q) => q.id !== id)
    )
  }

  const handleAddQuestion = () => {
    update("questions", [...config.questions, createQuestion()])
  }

  return (
    <SectionWrapper title="RSVP — Xác nhận tham dự" icon="✉️">
      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Bật RSVP</p>
            <p className="text-xs text-muted-foreground">
              Cho phép khách xác nhận tham dự
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(c) => update("enabled", c)}
          />
        </div>

        {config.enabled && (
          <div className="space-y-4">
            {/* Display mode */}
            <div className="space-y-1">
              <Label>Kiểu hiển thị</Label>
              <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
                {(
                  [
                    { value: "button", label: "Nút bấm" },
                    { value: "inline", label: "Hiện trực tiếp" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update("displayMode", value)}
                    className={[
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      config.displayMode === value
                        ? "bg-[#e83e8c] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest count mode */}
            <div className="space-y-2">
              <Label>Số người mời</Label>
              <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
                {(
                  [
                    { value: "free", label: "Khách tự chọn" },
                    { value: "limited", label: "Giới hạn" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update("guestMode", value)}
                    className={[
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      config.guestMode === value
                        ? "bg-[#e83e8c] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {config.guestMode === "limited" && (
                <div className="space-y-1">
                  <Label htmlFor="guest-limit">Số người tối đa</Label>
                  <Input
                    id="guest-limit"
                    type="number"
                    min={1}
                    value={config.guestLimit}
                    onChange={(e) =>
                      update("guestLimit", Number(e.target.value) || 1)
                    }
                    className="w-28"
                  />
                </div>
              )}
            </div>

            {/* Additional questions */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Câu hỏi thêm</p>

              {config.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  onChange={handleQuestionChange}
                  onRemove={handleQuestionRemove}
                />
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="w-full border-dashed border-[#e83e8c]/50 text-[#e83e8c] hover:bg-[#e83e8c]/5"
              >
                + Thêm câu hỏi
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
