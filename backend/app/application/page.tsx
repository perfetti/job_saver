// Temporary: Redirect to application HTML
// TODO: Migrate to React component
import { redirect } from 'next/navigation'

export default function ApplicationPage() {
  redirect('/application.html')
}

