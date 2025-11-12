// This will be the gallery page - we'll migrate the HTML to React components
// For now, redirect to the old HTML file or create a new React component

import { redirect } from 'next/navigation'

export default function Home() {
  // Temporarily serve the old HTML file
  // We'll migrate this to a React component next
  redirect('/gallery.html')
}

