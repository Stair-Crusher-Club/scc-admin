import * as S from "./Table.style"
import { Column } from "./column"

interface Props<Data> {
  rows: Data[]
  rowKey: keyof Data | ((row: Data) => React.Key)
  columns: Column<Data>[]
  isLoading?: boolean
  emptyMessasge?: string
  reload?: () => void | Promise<void>
}

export default function Table<T extends Record<string, any>>({
  rows,
  rowKey,
  columns,
  isLoading,
  emptyMessasge,
  reload,
}: Props<T>) {
  const context = { reload }
  function renderCell<T>(row: T, col: Column<T>) {
    if (col.render) return col.render(row[col.field], row, context)
    return defaultCellRenderer(row, col)
  }

  return (
    <S.Table>
      <thead>
        <S.HeadingRow>
          {columns.map((col, key) => (
            <S.HeadingCell key={key}>{col.title}</S.HeadingCell>
          ))}
        </S.HeadingRow>
      </thead>
      <tbody>
        {rows.map((row) => (
          <S.Row key={getKey(row, rowKey)}>
            {columns.map((col, colIdx) => (
              <S.Cell key={colIdx}>{renderCell(row, col)}</S.Cell>
            ))}
          </S.Row>
        ))}
        {isLoading && (
          <tr>
            <S.EmptyMessageCell colSpan={columns.length + 1}>데이터를 불러오는 중입니다...</S.EmptyMessageCell>
          </tr>
        )}
        {!isLoading && rows.length === 0 && (
          <tr>
            <S.EmptyMessageCell colSpan={columns.length + 1}>
              {emptyMessasge ?? "데이터가 없습니다."}
            </S.EmptyMessageCell>
          </tr>
        )}
      </tbody>
    </S.Table>
  )
}

function getKey<Data>(row: Data, rowKey: Props<Data>["rowKey"]) {
  return typeof rowKey === "function" ? rowKey(row) : row[rowKey]
}

function defaultCellRenderer<Data>(row: Data, col: Column<Data>) {
  const value = row[col.field]
  if (value === null) return "-"
  if (typeof value === "boolean") return value ? "O" : "X"
  return value
}
