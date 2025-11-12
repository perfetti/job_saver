// Temporary: Redirect to applications HTML
// TODO: Migrate to React component
import { redirect } from 'next/navigation'

export default function ApplicationsPage() {
  redirect('/applications.html')
}

