import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Saver - Job Gallery',
  description: 'Manage your job applications and track your job search',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

