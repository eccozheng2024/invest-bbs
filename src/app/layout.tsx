import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InvestBBS - Investment Information Forum',
  description: 'A private BBS for investment information and AI news',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
