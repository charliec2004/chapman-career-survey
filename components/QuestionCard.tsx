'use client'
import type { Question, AnswerValue } from '@/data/questions'

interface Props {
  question: Question
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
}

export default function QuestionCard({ question, value, onChange }: Props) {
  const selected = Array.isArray(value) ? value : value != null ? [value] : []

  const toggleMulti = (optValue: string) => {
    const set = new Set(selected)
    if (set.has(optValue)) set.delete(optValue)
    else set.add(optValue)
    onChange([...set])
  }

  return (
    <fieldset>
      <legend className="font-heading text-2xl font-bold text-panther-black">{question.prompt}</legend>
      {question.helpText && <p className="mt-1 text-sm text-pillar">{question.helpText}</p>}

      <div className="mt-5 space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected.includes(opt.value)
          const inputType = question.type === 'multi' ? 'checkbox' : 'radio'
          return (
            <label
              key={opt.value}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors',
                'min-h-11 focus-within:ring-2 focus-within:ring-chapman-red focus-within:ring-offset-2',
                isSelected ? 'border-chapman-red bg-chapman-red/5' : 'border-pillar/30 hover:border-chapman-red/60',
              ].join(' ')}
            >
              <input
                className="h-5 w-5 accent-chapman-red"
                type={inputType}
                name={question.id}
                value={opt.value}
                checked={isSelected}
                onChange={() => (question.type === 'multi' ? toggleMulti(opt.value) : onChange(opt.value))}
              />
              <span className="text-base">{opt.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
