"use client"

import { useState } from "react"
import { BasicModalProps } from "@reactleaf/modal"
import { AccessibilityTypeDTO } from "@/lib/generated-sources/openapi"

import Close from "@/icons/Close"

import * as S from "./ReinspectionDialog.style"

export interface ReinspectionDialogProps extends BasicModalProps {
  onConfirm: (items: Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }>) => Promise<void>
  isLoading?: boolean
}

export default function ReinspectionDialog({ visible, close, onConfirm, isLoading = false }: ReinspectionDialogProps) {
  const [mode, setMode] = useState<'form' | 'text'>('form')
  const [items, setItems] = useState<Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }>>([
    { accessibilityId: "", accessibilityType: "Place"}
  ])
  const [textInput, setTextInput] = useState<string>("")
  const [selectedType, setSelectedType] = useState<AccessibilityTypeDTO>("Place")

  const handleAddItem = () => {
    setItems([...items, { accessibilityId: "", accessibilityType: selectedType }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: 'accessibilityId' | 'accessibilityType', value: string) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: field === 'accessibilityType' ? value as AccessibilityTypeDTO : value } : item))
  }

  const parseTextInput = (text: string): Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }> => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => ({ accessibilityId: line, accessibilityType: selectedType }))
  }

  const handleModeChange = (newMode: 'form' | 'text') => {
    setMode(newMode)
    if (newMode === 'text') {
      // 폼 데이터를 텍스트로 변환
      const text = items
        .filter(item => item.accessibilityId.trim() !== "")
        .map(item => item.accessibilityId)
        .join('\n')
      setTextInput(text)
    } else {
      // 텍스트를 폼 데이터로 변환
      const parsedItems = parseTextInput(textInput)
      if (parsedItems.length > 0) {
        setItems(parsedItems)
      }
    }
  }

  const handleConfirm = async () => {
    let validItems: Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }>
    
    if (mode === 'text') {
      validItems = parseTextInput(textInput)
    } else {
      validItems = items.filter(item => item.accessibilityId.trim() !== "")
    }
    
    if (validItems.length === 0) {
      alert("접근성 ID를 입력해주세요.")
      return
    }
    
    try {
      await onConfirm(validItems)
      close()
    } catch (error) {
      console.error("재검수 실행 중 오류:", error)
    }
  }

  const isValid = mode === 'text' 
    ? textInput.trim().split('\n').some(line => line.trim() !== "")
    : items.some(item => item.accessibilityId.trim() !== "")

  return (
    <S.Dialog visible={visible} onClick={(e) => e.stopPropagation()}>
      <S.DialogHeader>
        <S.CloseButton onClick={close}>
          <Close size={24} color="black" />
        </S.CloseButton>
        <S.DialogTitle>재검수 실행</S.DialogTitle>
      </S.DialogHeader>
      
      <S.DialogBody>
        <S.Description>
          이미지 파이프라인을 실행할 접근성 정보를 입력해주세요.
        </S.Description>
        
        <S.ModeSelector>
          <S.ModeButton 
            active={mode === 'form'} 
            onClick={() => handleModeChange('form')}
          >
            개별 입력
          </S.ModeButton>
          <S.ModeButton 
            active={mode === 'text'} 
            onClick={() => handleModeChange('text')}
          >
            텍스트 입력
          </S.ModeButton>
        </S.ModeSelector>

        {mode === 'form' ? (
          <>
            <S.TypeSelector>
              <S.Label>유형</S.Label>
              <S.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AccessibilityTypeDTO)}
              >
                <option value="Place">Place</option>
                <option value="Building">Building</option>
              </S.Select>
            </S.TypeSelector>
            
            <S.ItemsContainer>
              {items.map((item, index) => (
                <S.ItemRow key={index}>
                  <S.ItemIndex>{index + 1}</S.ItemIndex>
                  <S.InputContainer>
                    <S.Label>접근성 ID</S.Label>
                    <S.Input
                      type="text"
                      value={item.accessibilityId}
                      onChange={(e) => handleItemChange(index, 'accessibilityId', e.target.value)}
                      placeholder="접근성 ID를 입력하세요"
                    />
                  </S.InputContainer>
                  <S.InputContainer>
                    <S.Label>유형</S.Label>
                    <S.Select
                      value={item.accessibilityType}
                      onChange={(e) => handleItemChange(index, 'accessibilityType', e.target.value)}
                    >
                      <option value="Place">Place</option>
                      <option value="Building">Building</option>
                    </S.Select>
                  </S.InputContainer>
                  {items.length > 1 && (
                    <S.RemoveButton onClick={() => handleRemoveItem(index)}>
                      삭제
                    </S.RemoveButton>
                  )}
                </S.ItemRow>
              ))}
            </S.ItemsContainer>
            
            <S.AddButton onClick={handleAddItem}>
              + 항목 추가
            </S.AddButton>
          </>
        ) : (
          <S.TextInputContainer>
            <S.TypeSelector>
              <S.Label>유형</S.Label>
              <S.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AccessibilityTypeDTO)}
              >
                <option value="Place">Place</option>
                <option value="Building">Building</option>
              </S.Select>
            </S.TypeSelector>
            <S.TextArea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="접근성 ID를 한 줄에 하나씩 입력하세요&#10;예시:&#10;place_123&#10;place_456&#10;building_789"
              rows={8}
            />
            <S.TextHint>
              접근성 ID를 한 줄에 하나씩 입력하세요. 빈 줄은 무시됩니다.
            </S.TextHint>
          </S.TextInputContainer>
        )}
      </S.DialogBody>
      
      <S.DialogFooter>
        <S.CancelButton onClick={close} disabled={isLoading}>
          취소
        </S.CancelButton>
        <S.ConfirmButton onClick={handleConfirm} disabled={!isValid || isLoading}>
          {isLoading ? "실행 중..." : "재검수 실행"}
        </S.ConfirmButton>
      </S.DialogFooter>
    </S.Dialog>
  )
}
