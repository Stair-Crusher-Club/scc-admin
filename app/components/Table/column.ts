export interface TableContext {
  reload?(): void | Promise<void>
}

export interface Column<Data, Context> {
  title?: React.ReactNode
  field: keyof Data
  width?: number | string
  heading?: boolean
  align?: "left" | "center" | "right"
  render?: (value: Data[keyof Data], row: Data, context?: Context) => React.ReactNode
}

export function makeTypedColumn<Data, Context>() {
  return <K extends keyof Data>(
    column: Omit<Column<Data, Context>, "field" | "render"> & {
      field: K | "_"
      render?: (value: Data[K], row: Data, context?: Context) => React.ReactNode
    },
  ) => column as Column<Data, Context>
}
