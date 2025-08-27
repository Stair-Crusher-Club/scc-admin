import React, { useState } from "react"
import { UseFormReturn } from "react-hook-form"

import { Flex } from "@/styles/jsx"

import * as S from "../page.style"

interface QueryParam {
  key: string
  value: string
}

interface QueryParamsInputProps {
  form: UseFormReturn<any>
  fieldName: string
  predefinedKeys?: { key: string; label: string; placeholder: string; description: string }[]
}

export function QueryParamsInput({ form, fieldName, predefinedKeys }: QueryParamsInputProps) {
  const [params, setParams] = useState<QueryParam[]>([])

  const updateFormValue = (newParams: QueryParam[]) => {
    const queryParamsObj: { [key: string]: string } = {}
    newParams.forEach(param => {
      // 키가 있고 값이 있는 경우에만 추가 (빈 문자열도 허용)
      if (param.key.trim()) {
        queryParamsObj[param.key.trim()] = param.value
      }
    })
    form.setValue(fieldName, queryParamsObj)
  }

  // Initialize with predefined keys if provided and not initialized yet
  React.useEffect(() => {
    const initialParams = predefinedKeys?.map(predefinedKey => ({
      key: predefinedKey.key,
      value: ""
    })) || []
    setParams(initialParams)
  }, [])

  const addParam = () => {
    const newParams = [...params, { key: "", value: "" }]
    setParams(newParams)
  }

  const removeParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index)
    setParams(newParams)
    updateFormValue(newParams)
  }

  const updateParam = (index: number, field: "key" | "value", newValue: string) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: newValue }
    setParams(newParams)
    // Form 값은 따로 업데이트 (빈 값들도 유지됨)
    updateFormValue(newParams)
  }

  return (
    <>
      <Flex direction="row" align="center" gap="8px" style={{ marginBottom: "8px" }}>
        <S.InputTitle style={{ margin: 0 }}>쿼리 파라미터</S.InputTitle>
        <S.AddButton type="button" onClick={addParam}>
          + 추가
        </S.AddButton>
      </Flex>
      
      {params.length === 0 && (
        <S.InputDescription style={{ marginBottom: "16px", color: "#666" }}>
          + 추가 버튼을 클릭하여 쿼리 파라미터를 추가하세요
        </S.InputDescription>
      )}

      {params.map((param, index) => {
        const predefinedKey = predefinedKeys?.find(pk => pk.key === param.key)
        const isPredefined = !!predefinedKey
        
        return (
          <div key={index} style={{ marginBottom: "12px" }}>
            <Flex direction="row" align="center" gap="8px" style={{ marginBottom: "4px" }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="키 (예: searchQuery)"
                  value={param.key}
                  onChange={(e) => updateParam(index, "key", e.target.value)}
                  readOnly={isPredefined}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    backgroundColor: isPredefined ? "#f8f9fa" : "white",
                  }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <input
                  type="text"
                  placeholder={predefinedKey?.placeholder || "값 (예: 카페)"}
                  value={param.value}
                  onChange={(e) => updateParam(index, "value", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <S.RemoveButton type="button" onClick={() => removeParam(index)}>
                ×
              </S.RemoveButton>
            </Flex>
            {predefinedKey && (
              <div style={{ fontSize: "12px", color: "#6c757d", marginLeft: "4px" }}>
                {predefinedKey.label}: {predefinedKey.description}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}