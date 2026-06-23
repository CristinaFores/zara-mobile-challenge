import { SpecsTableRow, type SpecRow } from './SpecsTableRow'

import styles from './SpecsTable.module.scss'

interface SpecsTableProps {
  rows: SpecRow[]
}

export function SpecsTable({ rows }: SpecsTableProps) {
  return (
    <section className={styles['specs-table']} aria-label="Specifications">
      <h2 className={styles['specs-table__heading']}>Specifications</h2>
      <dl className={styles['specs-table__list']}>
        {rows.map((row) => (
          <SpecsTableRow key={row.label} {...row} />
        ))}
      </dl>
    </section>
  )
}
