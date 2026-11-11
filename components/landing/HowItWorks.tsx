const steps = [
  {
    icon: '🎨',
    title: 'Chọn mẫu',
    desc: 'Thiệp đẹp đậm chất Việt Nam',
  },
  {
    icon: '✍️',
    title: 'Điền thông tin',
    desc: 'Thêm ảnh, tên, ngày cưới của bạn',
  },
  {
    icon: '📤',
    title: 'Gửi thiệp',
    desc: 'Chia sẻ qua Zalo, Messenger ngay lập tức',
  },
] as const

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-3">
          Chỉ 3 bước đơn giản
        </h2>
        <p className="text-center text-gray-500 mb-12 text-base">
          Tạo thiệp cưới đẹp trong vài phút
        </p>

        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-7 top-10 bottom-10 w-0.5"
            style={{ background: 'linear-gradient(to bottom, #e83e8c, #f48fb1, #fce4ec)' }}
            aria-hidden
          />

          <ol className="space-y-8 relative">
            {steps.map((step, idx) => (
              <li key={step.title} className="flex items-start gap-5">
                {/* Step indicator */}
                <div className="relative flex-none">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md z-10 relative"
                    style={{
                      background:
                        idx === 0
                          ? 'linear-gradient(135deg, #e83e8c, #c2185b)'
                          : idx === 1
                          ? 'linear-gradient(135deg, #f48fb1, #e83e8c)'
                          : 'linear-gradient(135deg, #fce4ec, #f48fb1)',
                      boxShadow: '0 4px 14px 0 rgba(232,62,140,0.25)',
                    }}
                  >
                    {step.icon}
                  </div>
                  {/* Step number badge */}
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white z-20"
                    style={{ background: '#c2185b' }}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <p className="font-semibold text-gray-900 text-lg">{step.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
