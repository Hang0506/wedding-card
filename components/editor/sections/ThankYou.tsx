'use client'

import * as React from 'react'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWeddingStore } from '@/store/weddingStore'

const DEFAULT_THANK_YOU =
  'Sự hiện diện của quý khách là niềm hạnh phúc của gia đình chúng tôi'

/**
 * ThankYou — editor section
 * Store path: `thankYouMsg` (string)
 */
export function ThankYou() {
  const updateField = useWeddingStore((s) => s.updateField)
  const wedding = useWeddingStore((s) => s.wedding)

  const [visible, setVisible] = React.useState(true)
  const message = (wedding?.thankYouMsg) ?? DEFAULT_THANK_YOU

  function handleToggle(checked: boolean) {
    setVisible(checked)
    updateField('thankYouVisible', checked)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    updateField('thankYouMsg', e.target.value)
  }

  return (
    <SectionWrapper
      title="Lời cảm ơn"
      icon="🙏"
      showToggle
      toggleValue={visible}
      onToggleChange={handleToggle}
    >
      <div className="space-y-1.5">
        <Label htmlFor="thankyou-msg" className="text-xs text-muted-foreground">
          Nội dung
        </Label>
        <Textarea
          id="thankyou-msg"
          value={message}
          onChange={handleChange}
          rows={3}
          placeholder={DEFAULT_THANK_YOU}
          className="resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground text-right">
          {message.length} ký tự
        </p>
      </div>
    </SectionWrapper>
  )
}
