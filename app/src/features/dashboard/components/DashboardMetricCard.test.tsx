import { Activity } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DashboardMetricCard } from './DashboardMetricCard'

describe('DashboardMetricCard', () => {
  it('renders a truthful empty metric state', () => {
    render(
      <DashboardMetricCard
        label="Emails sent"
        value="—"
        description="Campaign data will appear here"
        icon={Activity}
      />
    )

    expect(screen.getByText('Emails sent')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('Campaign data will appear here')).toBeInTheDocument()
  })
})
