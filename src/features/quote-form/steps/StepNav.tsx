import { Button } from '../../../components/ui/Button'

interface Props {
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

export default function StepNav({ onBack, onNext, nextLabel = 'Continuă →', nextDisabled }: Props) {
  return (
    <div className="flex items-center justify-between mt-8">
      <button
        onClick={onBack}
        className="text-muted text-sm cursor-pointer hover:text-navy transition-colors"
      >
        ← Înapoi
      </button>
      <Button size="md" onClick={onNext} disabled={nextDisabled} className="px-6">
        {nextLabel}
      </Button>
    </div>
  )
}
