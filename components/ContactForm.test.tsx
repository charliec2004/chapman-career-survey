import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm, { validateContact } from '@/components/ContactForm'

describe('validateContact', () => {
  it('rejects empty name and bad email', () => {
    const { valid, errors } = validateContact({ name: '', email: 'nope' })
    expect(valid).toBe(false)
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
  })
  it('accepts a valid name and email', () => {
    expect(validateContact({ name: 'Pat Panther', email: 'pat@chapman.edu' }).valid).toBe(true)
  })
})

describe('ContactForm (inert prototype)', () => {
  it('does not submit until consent is checked and fields are valid', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    const submit = screen.getByRole('button', { name: /notify me/i })
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/name/i), 'Pat Panther')
    await user.type(screen.getByLabelText(/email/i), 'pat@chapman.edu')
    await user.click(screen.getByLabelText(/agree to be contacted/i))
    expect(submit).toBeEnabled()
  })

  it('shows the prototype toast on submit and makes no network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'Pat Panther')
    await user.type(screen.getByLabelText(/email/i), 'pat@chapman.edu')
    await user.click(screen.getByLabelText(/agree to be contacted/i))
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/prototype/i)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
