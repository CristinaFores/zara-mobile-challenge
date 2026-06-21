import styles from './SpecsTableRow.module.scss'

export interface SpecRow {
  label: string
  value: string
}

export function SpecsTableRow({ label, value }: SpecRow) {
  return (
    <li className={styles['specs-table-row']}>
      <dt className={styles['specs-table-row__label']}>{label}</dt>
      <dd className={styles['specs-table-row__value']}>{value}</dd>
    </li>
  )
}
