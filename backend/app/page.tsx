// Serve the gallery page - static HTML file in public directory
// Next.js automatically serves files from public/ at the root
import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to gallery.html which is served from public/
  redirect('/gallery.html')
}

