"use client"

import { useState } from "react"

import { deleteSearchPreset, useSearchPresets } from "@/lib/apis/api"

import { Contents } from "@/components/layout"

import CreatePresetModal from "./components/CreatePresetModal"
import * as S from "./page.style"

export default function SearchPresetPage() {
  const { data, isLoading, refetch } = useSearchPresets()
  const presets = data?.presets || []
  const [modalOpen, setModalOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm("정말 이 프리셋을 삭제하시겠습니까?")) return
    await deleteSearchPreset(id)
    refetch()
  }

  return (
    <>
      <Contents.Normal>
        <S.TableWrapper>
          <S.TableHeader>
            <S.HeaderCell>검색어</S.HeaderCell>
            <S.HeaderCell>설명 (앱에서 보이는 이름)</S.HeaderCell>
            <S.HeaderCell>삭제</S.HeaderCell>
          </S.TableHeader>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : presets.length === 0 ? (
            <p>등록된 검색어가 없습니다.</p>
          ) : (
            presets.map((preset) => (
              <S.RowWrapper key={preset.id}>
                <S.Cell>{preset.searchText}</S.Cell>
                <S.Cell>{preset.description}</S.Cell>
                <S.Cell>
                  <S.DeleteButton onClick={() => handleDelete(preset.id)}>삭제</S.DeleteButton>
                </S.Cell>
              </S.RowWrapper>
            ))
          )}
        </S.TableWrapper>
        <CreatePresetModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            refetch()
          }}
        />
      </Contents.Normal>
    </>
  )
}
