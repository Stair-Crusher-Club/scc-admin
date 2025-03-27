import * as S from "./Table.style"
import { Column } from "./column"

interface Props<Data, Context> {
  rows: Data[]
  rowKey: keyof Data | ((row: Data) => React.Key)
  columns: Column<Data, Context>[]
  isLoading?: boolean
  emptyMessasge?: string
  context?: Context
  isZIndexApplied?: boolean
}

export default function Table<T extends Record<string, any>, Context>({
  rows,
  rowKey,
  columns,
  isLoading,
  emptyMessasge,
  context,
  isZIndexApplied = false,
}: Props<T, Context>) {
  function renderCell<T>(row: T, col: Column<T, Context>) {
    if (col.render) return col.render(row[col.field], row, context)
    return defaultCellRenderer(row, col)
  }

  return (
    <S.Table>
      <thead>
        <S.HeadingRow isZIndexApplied={isZIndexApplied}>
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

function getKey<Data, Context>(row: Data, rowKey: Props<Data, Context>["rowKey"]) {
  return typeof rowKey === "function" ? rowKey(row) : row[rowKey]
}

function defaultCellRenderer<Data, Context>(row: Data, col: Column<Data, Context>) {
  const value = row[col.field]
  if (value === null) return "-"
  if (typeof value === "boolean") return value ? "O" : "X"
  return value
}
