'use client'

import * as React from 'react'
import { SectionWrapper } from '@/components/editor/SectionWrapper'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWeddingStore } from '@/store/weddingStore'
import { uploadMedia } from '@/lib/upload-client'
import { PlusIcon, Trash2Icon, Upload } from 'lucide-react'

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  qrCodeUrl?: string
}

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

/**
 * GiftBox — editor section
 * Store path: `bankAccounts` (BankAccount array)
 */
export function GiftBox() {
  const updateField = useWeddingStore((s) => s.updateField)
  const wedding = useWeddingStore((s) => s.wedding)

  // Derive initial accounts from store (type-safely — store has bankAccounts: unknown[])
  const rawAccounts = (wedding?.bankAccounts ?? []) as BankAccount[]
  const [accounts, setAccounts] = React.useState<BankAccount[]>(rawAccounts)
  const [visible, setVisible] = React.useState(true)

  // Sync accounts when store hydrates (wedding loads async after mount)
  const hydrated = React.useRef(false)
  React.useEffect(() => {
    if (!hydrated.current && wedding) {
      hydrated.current = true
      setAccounts((wedding.bankAccounts ?? []) as BankAccount[])
    }
  }, [wedding])
  const [uploadingId, setUploadingId] = React.useState<string | null>(null)

  // Per-account file input refs (keyed by account id)
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  function syncAccounts(next: BankAccount[]) {
    setAccounts(next)
    updateField('bankAccounts', next)
  }

  function handleToggle(checked: boolean) {
    setVisible(checked)
    updateField('giftBoxVisible', checked)
  }

  function addAccount() {
    syncAccounts([
      ...accounts,
      { id: genId(), bankName: '', accountNumber: '', accountHolder: '', qrCodeUrl: '' },
    ])
  }

  function removeAccount(id: string) {
    syncAccounts(accounts.filter((a) => a.id !== id))
  }

  function updateAccount(id: string, field: keyof Omit<BankAccount, 'id'>, value: string) {
    syncAccounts(accounts.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  const QR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
  const QR_MAX_MB = 10
  const [qrError, setQrError] = React.useState<{ id: string; message: string } | null>(null)

  async function uploadQR(accountId: string, file: File) {
    setQrError(null)
    if (!QR_TYPES.includes(file.type)) {
      setQrError({ id: accountId, message: 'Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF, HEIC' })
      return
    }
    if (file.size > QR_MAX_MB * 1024 * 1024) {
      setQrError({ id: accountId, message: `Ảnh QR tối đa ${QR_MAX_MB}MB` })
      return
    }

    setUploadingId(accountId)
    try {
      const publicUrl = await uploadMedia(file, 'qr')
      updateAccount(accountId, 'qrCodeUrl', publicUrl)
    } catch (err) {
      console.error('[GiftBox] uploadQR error:', err)
      setQrError({ id: accountId, message: err instanceof Error ? err.message : 'Upload thất bại' })
    } finally {
      setUploadingId(null)
    }
  }

  function handleFileChange(accountId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so same file can be re-selected after delete
    e.target.value = ''
    uploadQR(accountId, file)
  }

  return (
    <SectionWrapper
      title="Hộp quà / Chuyển khoản"
      icon="🎁"
      showToggle
      toggleValue={visible}
      onToggleChange={handleToggle}
    >
      <div className="space-y-3">
        {/* Bank account list */}
        {accounts.map((account, index) => (
          <div
            key={account.id}
            className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#e83e8c]">
                Tài khoản {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAccount(account.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Xoá tài khoản"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="space-y-1">
                <Label htmlFor={`bank-name-${account.id}`} className="text-xs">
                  Tên ngân hàng
                </Label>
                <Input
                  id={`bank-name-${account.id}`}
                  placeholder="Vietcombank, Techcombank, ..."
                  value={account.bankName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAccount(account.id, 'bankName', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`bank-number-${account.id}`} className="text-xs">
                  Số tài khoản
                </Label>
                <Input
                  id={`bank-number-${account.id}`}
                  placeholder="1234 5678 9012"
                  value={account.accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAccount(account.id, 'accountNumber', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`bank-holder-${account.id}`} className="text-xs">
                  Tên chủ tài khoản
                </Label>
                <Input
                  id={`bank-holder-${account.id}`}
                  placeholder="NGUYEN VAN A"
                  value={account.accountHolder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAccount(account.id, 'accountHolder', e.target.value)
                  }
                />
              </div>

              {/* QR Code field */}
              <div className="space-y-1">
                <Label className="text-xs">Mã QR (tuỳ chọn)</Label>

                {account.qrCodeUrl ? (
                  /* Preview + delete */
                  <div className="flex flex-col gap-1.5">
                    <img
                      src={account.qrCodeUrl}
                      alt="QR code"
                      className="max-h-32 w-auto object-contain rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => updateAccount(account.id, 'qrCodeUrl', '')}
                      className="self-start text-xs text-destructive hover:underline"
                    >
                      Xoá QR
                    </button>
                  </div>
                ) : (
                  /* Upload button */
                  <>
                    {/* Hidden file input, keyed per account */}
                    <input
                      ref={(el) => {
                        fileInputRefs.current[account.id] = el
                      }}
                      type="file"
                      accept={QR_TYPES.join(',')}
                      className="hidden"
                      onChange={(e) => handleFileChange(account.id, e)}
                    />
                    <button
                      type="button"
                      disabled={uploadingId === account.id}
                      onClick={() => fileInputRefs.current[account.id]?.click()}
                      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-[#e83e8c]/50 hover:text-[#e83e8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="size-3.5" />
                      {uploadingId === account.id ? 'Đang tải lên...' : 'Tải lên QR Code'}
                    </button>
                    {qrError?.id === account.id && (
                      <p className="text-xs text-destructive">{qrError.message}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add account button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-dashed border-[#e83e8c]/50 text-[#e83e8c] hover:bg-[#e83e8c]/5"
          onClick={addAccount}
        >
          <PlusIcon className="size-3.5" />
          Thêm tài khoản ngân hàng
        </Button>

        {/* Other methods placeholder */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => {
            // placeholder — future: mở dialog chọn phương thức khác
          }}
        >
          Phương thức khác
        </Button>
      </div>
    </SectionWrapper>
  )
}
