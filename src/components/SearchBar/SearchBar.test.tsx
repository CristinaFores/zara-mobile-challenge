import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchBar } from './SearchBar'

describe('Given a SearchBar', () => {
  describe('When rendered with a query', () => {
    it('Then it shows the current query value', () => {
      render(<SearchBar query="apple" resultCount={3} onQueryChange={jest.fn()} />)

      expect(screen.getByRole('searchbox')).toHaveValue('apple')
    })

    it('Then it shows a clear button', () => {
      render(<SearchBar query="apple" resultCount={3} onQueryChange={jest.fn()} />)

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
    })
  })

  describe('When the query is empty', () => {
    it('Then it hides the clear button', () => {
      render(<SearchBar query="" resultCount={0} onQueryChange={jest.fn()} />)

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    })
  })

  describe('When showing the result count', () => {
    it('Then it uses the singular label for one result', () => {
      render(<SearchBar query="x" resultCount={1} onQueryChange={jest.fn()} />)

      expect(screen.getByText('1 result')).toBeInTheDocument()
    })

    it('Then it uses the plural label for several results', () => {
      render(<SearchBar query="x" resultCount={5} onQueryChange={jest.fn()} />)

      expect(screen.getByText('5 results')).toBeInTheDocument()
    })
  })

  describe('When the user types', () => {
    it('Then it reports each change', async () => {
      const onQueryChange = jest.fn()
      render(<SearchBar query="" resultCount={0} onQueryChange={onQueryChange} />)

      await userEvent.type(screen.getByRole('searchbox'), 'a')

      expect(onQueryChange).toHaveBeenCalledWith('a')
    })
  })

  describe('When the user clears the search', () => {
    it('Then it reports an empty query', async () => {
      const onQueryChange = jest.fn()
      render(<SearchBar query="apple" resultCount={3} onQueryChange={onQueryChange} />)

      await userEvent.click(screen.getByRole('button', { name: /clear search/i }))

      expect(onQueryChange).toHaveBeenCalledWith('')
    })
  })
})
