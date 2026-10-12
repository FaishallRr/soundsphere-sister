import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/feedback/EmptyState'
import { ROUTES } from '../constants/app'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      message="The page you are looking for does not exist or may have moved."
      action={
        <Link
          to={ROUTES.home}
          className="gradient-cta inline-block rounded-full px-4 py-2 text-sm font-medium text-app shadow-[0_0_18px_rgba(167,139,250,0.35)] hover:scale-105"
        >
          Back to discovery
        </Link>
      }
    />
  )
}
