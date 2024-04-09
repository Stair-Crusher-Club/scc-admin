export interface TableContext {
  reload?(): void | Promise<void>
}

export interface Column<Data> {
  title?: React.ReactNode
  field: keyof Data
  width?: number | string
  heading?: boolean
  align?: "left" | "center" | "right"
  render?: (value: Data[keyof Data], row: Data, context: TableContext) => React.ReactNode
}

export function makeTypedColumn<Data>() {
  return <K extends keyof Data>(
    column: Omit<Column<Data>, "field" | "render"> & {
      field: K | "_"
      render?: (value: Data[K], row: Data, context: TableContext) => React.ReactNode
    },
  ) => column as Column<Data>
}
