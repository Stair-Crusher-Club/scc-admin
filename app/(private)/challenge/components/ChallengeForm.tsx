"use client"

import { FileInput } from "@reactleaf/input"
import { Autocomplete, Combobox, DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import axios from "axios"
import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { FormProvider, UseFormReturn, useWatch } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"
import {
  AdminChallengeB2bFormSchemaDTO,
  AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO,
} from "@/lib/generated-sources/openapi"

import RemoteImage from "@/components/RemoteImage"
import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

import { emdOptions } from "../create/regionOptions"

interface Option {
  label: string
  value: string
}

export const actionOptions = [
  { label: "건물 정보 등록", value: "BUILDING_ACCESSIBILITY" } as const,
  { label: "건물 코멘트 등록", value: "BUILDING_ACCESSIBILITY_COMMENT" } as const,
  { label: "장소 정보 등록", value: "PLACE_ACCESSIBILITY" } as const,
  { label: "장소 코멘트 등록", value: "PLACE_ACCESSIBILITY_COMMENT" } as const,
  { label: "장소 리뷰", value: "PLACE_REVIEW" } as const,
]
const defaultActionOptions = [
  { label: "건물 정보 등록", value: "BUILDING_ACCESSIBILITY" } as const,
  { label: "장소 정보 등록", value: "PLACE_ACCESSIBILITY" } as const,
]

export interface ChallengeFormValues {
  name: string
  inviteCode: string
  joinCode: string
  startDate: Date
  endDate: Date | null
  milestones: Option[]
  questActions: Option[]
  questRegions: Option[]
  description: string
  isB2B: boolean
  b2bFormSchema?: AdminChallengeB2bFormSchemaDTO
  crusherGroupName?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
}

export const defaultValues: Partial<ChallengeFormValues> = {
  name: "",
  inviteCode: "",
  joinCode: "",
  startDate: new Date(),
  endDate: null,
  questActions: defaultActionOptions,
  description: "",
  isB2B: false,
  b2bFormSchema: undefined,
  crusherGroupName: "",
  imageUrl: "",
  imageWidth: undefined,
  imageHeight: undefined,
}

interface Props {
  form: UseFormReturn<ChallengeFormValues>
  id?: string
  isEditMode?: boolean
  onSubmit?: (values: ChallengeFormValues) => void
}
const availableFieldOptions = [
  { label: "참가자 이름", value: "PARTICIPANT_NAME" as AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO },
  { label: "소속 계열사", value: "COMPANY_NAME" as AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO },
  { label: "조직", value: "ORGANIZATION_NAME" as AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO },
  { label: "사원번호", value: "EMPLOYEE_IDENTIFICATION_NUMBER" as AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO },
]

// 옵션 파싱 유틸리티 함수
const parseOptions = (optionsText: string): string[] => {
  if (!optionsText || optionsText.trim() === '') {
    return []
  }
  return optionsText
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0)
}

export default function ChallengeForm({ form, id, isEditMode, onSubmit }: Props) {
  // milestones는 증가하는 순서로 입력되도록 한다.
  // useEffect 실행을 최소화하기 위한 stringify
  const stringifiedMilestones = form
    .watch("milestones")
    ?.map((o) => o.value)
    .toString()

  // B2B 폼 스키마 상태 관리
  const [selectedFields, setSelectedFields] = useState<AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO[]>([])
  const [fieldOptions, setFieldOptions] = useState<Record<AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO, string[] | null>>({
    PARTICIPANT_NAME: null,
    COMPANY_NAME: null,
    ORGANIZATION_NAME: null,
    EMPLOYEE_IDENTIFICATION_NUMBER: null,
  })
  const [fieldOptionsText, setFieldOptionsText] = useState<Record<AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO, string>>({
    PARTICIPANT_NAME: "",
    COMPANY_NAME: "",
    ORGANIZATION_NAME: "",
    EMPLOYEE_IDENTIFICATION_NUMBER: "",
  })
  
  // useWatch로 isB2B 값 안정적으로 감지
  const isB2B = useWatch({ control: form.control, name: "isB2B" })
  
  // useWatch로 b2bFormSchema 값 변화 감지
  const b2bFormSchema = useWatch({ control: form.control, name: "b2bFormSchema" })
  
  // 초기화 상태 추적용 ref
  const isInitialized = useRef(false)

  // B2B 폼 스키마 초기화 (b2bFormSchema가 설정되는 최초 한 번만)
  useEffect(() => {
    if (b2bFormSchema?.availableFields && !isInitialized.current) {
      isInitialized.current = true
      setSelectedFields(b2bFormSchema.availableFields.map(field => field.name))
      
      // 기존 옵션 데이터 로드
      const newFieldOptions = { ...fieldOptions }
      const newFieldOptionsText = { ...fieldOptionsText }
      b2bFormSchema.availableFields.forEach(field => {
        if (field.options) {
          newFieldOptions[field.name] = field.options
          newFieldOptionsText[field.name] = field.options.join(", ")
        }
      })
      setFieldOptions(newFieldOptions)
      setFieldOptionsText(newFieldOptionsText)
    }
  }, [b2bFormSchema]) // b2bFormSchema 값 변화 시 실행하되, 최초 한 번만

  const handleFieldToggle = (fieldName: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO) => {
    const newFields = selectedFields.includes(fieldName)
      ? selectedFields.filter(name => name !== fieldName)
      : [...selectedFields, fieldName]
    
    setSelectedFields(newFields)
    
    // b2bFormSchema 즉시 업데이트
    if (isB2B) {
      const schema: AdminChallengeB2bFormSchemaDTO = {
        availableFields: newFields.map(name => ({
          name,
          options: fieldOptions[name] === null ? undefined : fieldOptions[name],
        }))
      }
      form.setValue("b2bFormSchema", schema)
    }
  }

  const handleOptionsUpdate = (fieldName: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO, optionsText: string) => {
    // 텍스트 상태 먼저 업데이트 (사용자 입력 그대로 유지)
    setFieldOptionsText(prev => ({ ...prev, [fieldName]: optionsText }))
    
    // 파싱된 옵션 배열 업데이트 (빈 배열이면 null)
    const parsedOptions = parseOptions(optionsText)
    const options = parsedOptions.length > 0 ? parsedOptions : null
    const newFieldOptions = { ...fieldOptions, [fieldName]: options }
    setFieldOptions(newFieldOptions)
    
    // b2bFormSchema 즉시 업데이트
    if (isB2B && selectedFields.includes(fieldName)) {
      const schema: AdminChallengeB2bFormSchemaDTO = {
        availableFields: selectedFields.map(name => ({
          name,
          options: newFieldOptions[name] === null ? undefined : newFieldOptions[name],
        }))
      }
      form.setValue("b2bFormSchema", schema)
    }
  }

  useEffect(() => {
    const milestones = form.getValues("milestones")
    const sortedValues = milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value))
    if (stringifiedMilestones === sortedValues?.map((o) => o.value).toString()) return
    form.setValue(
      "milestones",
      milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value)),
    )
  }, [stringifiedMilestones])

  const [imageUrl, setImageUrl] = useState("")
  const [showImage, setShowImage] = useState(false)
  const formImageUrl = form.watch("imageUrl")
  useEffect(() => {
    if (formImageUrl && formImageUrl !== "") {
      setImageUrl(formImageUrl)
      setShowImage(true)
    } else {
      setImageUrl("")
      setShowImage(false)
    }
  }, [formImageUrl])

  async function getImageSize(url: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve([img.width, img.height])
      img.onerror = reject
    })
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      getImageUploadUrls({
        purposeType: "CRUSHER_LABEL",
        count: 1,
        filenameExtension: selectedFile.name.split(".").pop()!,
      }).then(async (result) => {
        const uploadUrl = result.urls[0].url
        await axios.put(uploadUrl, selectedFile, {
          headers: {
            "Content-Type": selectedFile.type,
            "x-amz-acl": "public-read",
          },
          withCredentials: false,
        })
        const removeQueryParamFromUrl = (url: string) => {
          const urlObj = new URL(url)
          urlObj.search = ""
          return urlObj.toString()
        }
        const uploadedImageUrl = removeQueryParamFromUrl(uploadUrl)
        setImageUrl(uploadedImageUrl)
        form.setValue("imageUrl", uploadedImageUrl)

        const [imageWidth, imageHeight]: number[] = await getImageSize(uploadedImageUrl)
        form.setValue("imageWidth", imageWidth)
        form.setValue("imageHeight", imageHeight)
      })
    }
  }

  const isEditableFieldDisabled = isEditMode === undefined ? false : !isEditMode

  return (
    <FormProvider {...form}>
      <form id={id} className={css({ width: "50rem" })} onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <TextInput
          name="name"
          label="이름"
          rules={{ required: { value: true, message: "챌린지 이름을 입력해주세요" } }}
          disabled={isEditableFieldDisabled}
        />
        <Flex gap={16}>
          <TextInput
            name="joinCode"
            label="참여코드"
            placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다."
            disabled={isEditableFieldDisabled}
          />
        </Flex>
        <Flex gap={16}>
          <DateInput
            name="startDate"
            label="챌린지 시작"
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
            disabled={isEditableFieldDisabled}
          />
          <DateInput
            name="endDate"
            label="챌린지 종료"
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
            placeholderText="비워두면 무기한으로 적용됩니다."
            disabled={isEditableFieldDisabled}
          />
        </Flex>
        <Autocomplete
          isMulti
          name="milestones"
          label="마일스톤"
          placeholder="가장 큰 숫자가 목표로 지정됩니다."
          isDisabled={isEditableFieldDisabled}
          rules={{ required: { value: true, message: "마일스톤을 1개 이상 입력해주세요." } }}
          options={[
            { label: "100", value: "100" },
            { label: "500", value: "500" },
            { label: "1000", value: "1000" },
          ]}
        />
        <Combobox
          isMulti
          name="questRegions"
          label="퀘스트 대상 지역"
          placeholder="전체 지역"
          isDisabled={isEditableFieldDisabled}
          filterOption={(option, inputValue) => option.label.includes(inputValue)}
          options={emdOptions}
        />
        <Combobox
          isMulti
          name="questActions"
          label="퀘스트 대상 액션"
          placeholder="이 행동을 하면 퀘스트로 인정됩니다."
          closeMenuOnSelect={false}
          isDisabled={isEditableFieldDisabled}
          rules={{ required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }}
          options={actionOptions}
        />
        <div className={css({ marginBottom: "16px" })}>
          <label htmlFor="description" className={css({ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" })}>
            설명 (Markdown 지원)
          </label>
          <textarea
            {...form.register("description")}
            id="description"
            placeholder="챌린지에 대한 설명을 입력하세요. **굵은글씨**, *기울임*, `코드` 등 Markdown 문법을 사용할 수 있습니다."
            disabled={isEditableFieldDisabled}
            className={css({
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              lineHeight: "1.5",
              resize: "vertical",
              fontFamily: "inherit",
              _focus: {
                outline: "none",
                borderColor: "#3b82f6",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              },
              _disabled: {
                backgroundColor: "#f9fafb",
                color: "#6b7280",
                cursor: "not-allowed",
              },
            })}
          />
          <div className={css({ fontSize: "12px", color: "#6b7280", marginTop: "4px" })}>
            줄바꿈은 엔터키로 가능하며, Markdown 문법을 사용하여 텍스트를 꾸밀 수 있습니다.
          </div>
        </div>
        <div className={css({ marginBottom: "16px" })}>
          <label className={css({ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" })}>
            <input
              type="checkbox"
              {...form.register("isB2B")}
              disabled={isEditableFieldDisabled}
              className={css({
                width: "18px",
                height: "18px",
                cursor: "pointer",
                _disabled: {
                  cursor: "not-allowed",
                },
              })}
            />
            <span className={css({ fontSize: "14px", fontWeight: "500" })}>B2B 챌린지</span>
          </label>
          <div className={css({ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginLeft: "26px" })}>
            B2B(기업용) 챌린지인 경우 체크하세요.
          </div>
          
          {/* B2B 폼 스키마 설정 */}
          {isB2B && (
            <div className={css({ marginTop: "12px", marginLeft: "26px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#f9fafb" })}>
              <div className={css({ fontSize: "14px", fontWeight: "500", marginBottom: "8px" })}>
                B2B 챌린지 참가 시 입력 필드 설정
              </div>
              <div className={css({ fontSize: "12px", color: "#6b7280", marginBottom: "12px" })}>
                참가자가 입력할 수 있는 필드를 선택하세요.
              </div>
              
              {/* 사용 가능한 필드들 */}
              <div className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
                {availableFieldOptions.map((option) => (
                  <div key={option.value}>
                    <label className={css({ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" })}>
                      <input 
                        type="checkbox" 
                        checked={selectedFields.includes(option.value)}
                        onChange={() => handleFieldToggle(option.value)}
                        disabled={isEditableFieldDisabled}
                        className={css({
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          _disabled: {
                            cursor: "not-allowed",
                          },
                        })}
                      />
                      <span className={css({ fontSize: "13px" })}>{option.label} ({option.value})</span>
                    </label>
                    
                    {/* 회사명 필드일 때만 옵션 입력 표시 */}
                    {option.value === "COMPANY_NAME" && selectedFields.includes(option.value) && (
                      <div className={css({ marginTop: "8px", marginLeft: "24px" })}>
                        <input
                          type="text"
                          value={fieldOptionsText.COMPANY_NAME}
                          onChange={(e) => {
                            handleOptionsUpdate("COMPANY_NAME", e.target.value)
                          }}
                          placeholder="회사명 옵션을 쉼표로 구분하여 입력 (예: 삼성, LG, 현대)"
                          disabled={false}
                          className={css({
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            _focus: {
                              outline: "none",
                              borderColor: "#3b82f6",
                              boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
                            },
                            _disabled: {
                              backgroundColor: "#f9fafb",
                              color: "#6b7280",
                              cursor: "not-allowed",
                            },
                          })}
                        />
                        {/* 파싱된 옵션 프리뷰 */}
                        {fieldOptions.COMPANY_NAME && fieldOptions.COMPANY_NAME.length > 0 && (
                          <div className={css({ marginTop: "6px" })}>
                            <div className={css({ fontSize: "11px", color: "#6b7280", marginBottom: "4px" })}>
                              앱에 노출될 선택지 ({fieldOptions.COMPANY_NAME.length}개):
                            </div>
                            <div className={css({ display: "flex", flexWrap: "wrap", gap: "4px" })}>
                              {fieldOptions.COMPANY_NAME.map((option, idx) => (
                                <span 
                                  key={idx}
                                  className={css({
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    backgroundColor: "#e5e7eb",
                                    color: "#374151",
                                    borderRadius: "12px",
                                    border: "1px solid #d1d5db",
                                  })}
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <TextInput
          name="crusherGroupName"
          label="파트너 라벨 이름"
          placeholder="파트너 라벨로 사용하고 싶은 이름을 입력하세요"
          disabled={isEditableFieldDisabled}
        />
        <Flex direction={showImage ? "row" : "column"}>
          <div className={css({ width: showImage ? "50%" : "100%" })}>
            <FileInput
              label="파트너 라벨 이미지"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isEditableFieldDisabled}
            />
          </div>
          {showImage && (
            <div
              className={css({
                width: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                marginBottom: 12,
                backgroundColor: "#ffffff",
                position: "relative",
              })}
            >
              <RemoteImage
                src={imageUrl}
                width={(form.watch("imageWidth")!! / form.watch("imageHeight")!!) * 28}
                height={28}
                className={css({
                  height: "28px",
                  border: "1px solid #000000",
                  objectFit: "contain",
                })}
              />
            </div>
          )}
        </Flex>
      </form>
    </FormProvider>
  )
}
