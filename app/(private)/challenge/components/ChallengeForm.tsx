"use client"

import { FileInput } from "@reactleaf/input"
import { Autocomplete, Combobox, DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import axios from "axios"
import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { FormProvider, UseFormReturn, useWatch } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"
import { useConquerTargetPlaceLists } from "@/lib/apis/conquerTargetPlaceList"
import { uploadImage } from "@/lib/imageUpload"
import {
  AdminChallengeB2bFormSchemaDTO,
  AdminChallengeB2bFormSchemaAvailableFieldDTO,
  AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO,
} from "@/lib/generated-sources/openapi"

import RemoteImage from "@/components/RemoteImage"
import B2bFormSchemaPanel from "./B2bFormSchemaPanel"
import { FormField, BuiltinFieldOption } from "./B2bFormTypes"
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
  joinStartDate: Date | null
  endDate: Date | null
  milestones: Option[]
  questActions: Option[]
  questRegions: Option[]
  // 지정 시 이 챌린지의 대상 장소는 해당 정복 대상 리스트로 정해지고, goal/conditions 는 서버가 덮어쓴다.
  // 미선택은 value: "" ("지정 안 함" 옵션)로 표현한다.
  conquerTargetPlaceList: Option
  description: string
  isB2B: boolean
  isRetroactiveContributionEnabled: boolean
  b2bFormSchema?: AdminChallengeB2bFormSchemaDTO
  crusherGroupName?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  lastMonthRankImageUrl?: string | null
  modalImageUrl?: string | null
}

export const defaultValues: Partial<ChallengeFormValues> = {
  name: "",
  inviteCode: "",
  joinCode: "",
  startDate: new Date(),
  joinStartDate: null,
  endDate: null,
  // ctpl 선택 시 milestones required가 꺼지므로(위 key/rules 참고) 한 번도 안 건드려도
  // undefined가 아닌 빈 배열이어야 한다 — create/page.tsx의 milestones.map()이 undefined에서 죽는다.
  milestones: [],
  questRegions: [],
  questActions: defaultActionOptions,
  conquerTargetPlaceList: { label: "(지정 안 함)", value: "" },
  description: "",
  isB2B: false,
  isRetroactiveContributionEnabled: false,
  b2bFormSchema: undefined,
  crusherGroupName: "",
  imageUrl: "",
  imageWidth: undefined,
  imageHeight: undefined,
  lastMonthRankImageUrl: null,
  modalImageUrl: null,
}

interface Props {
  form: UseFormReturn<ChallengeFormValues>
  id?: string
  isEditMode?: boolean
  onSubmit?: (values: ChallengeFormValues) => void
}
const availableFieldOptions = [
  { label: "실명", value: "PARTICIPANT_NAME" as AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO },
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



/**
 * Generate a unique ID for form fields
 */
function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Convert API DTO to FormField (handles both V1 and V2 data)
 */
function dtoToField(dto: AdminChallengeB2bFormSchemaAvailableFieldDTO): FormField {
  // V2 with built-in type (name !== null)
  if (dto.name !== undefined && dto.name !== null) {
    return {
      id: generateId(),
      type: 'builtin',
      builtinName: dto.name,
      customDisplayName: dto.customDisplayName || undefined,
      options: dto.options || null,
      optionsText: (dto.options || []).join(', '),
      isRequired: dto.isRequired ?? true,
    }
  }

  // V2 custom question (name === null, must have key and customDisplayName)
  return {
    id: generateId(),
    type: 'custom',
    customKey: dto.key || `customField${Date.now()}`, // Fallback key generation
    customDisplayName: dto.customDisplayName || '',
    options: dto.options || null,
    optionsText: (dto.options || []).join(', '),
    isRequired: dto.isRequired ?? true,
  }
}

/**
 * Convert FormField to API DTO (V2 format)
 */
function fieldToDTO(field: FormField): AdminChallengeB2bFormSchemaAvailableFieldDTO {
  if (field.type === 'builtin') {
    return {
      name: field.builtinName!,
      key: null,
      customDisplayName: field.customDisplayName || null,
      options: field.options || undefined,
      isRequired: field.isRequired,
    }
  } else {
    // Custom field - omit name instead of setting to null
    return {
      key: field.customKey!,
      customDisplayName: field.customDisplayName!,
      options: field.options || undefined,
      isRequired: field.isRequired,
    }
  }
}

export default function ChallengeForm({ form, id, isEditMode, onSubmit }: Props) {
  // milestones는 증가하는 순서로 입력되도록 한다.
  // useEffect 실행을 최소화하기 위한 stringify
  const stringifiedMilestones = form
    .watch("milestones")
    ?.map((o) => o.value)
    .toString()

  // V2: Unified B2B form fields state
  const [formFields, setFormFields] = useState<FormField[]>([])
  
  // useWatch로 isB2B 값 안정적으로 감지
  const isB2B = useWatch({ control: form.control, name: "isB2B" })
  
  // useWatch로 b2bFormSchema 값 변화 감지
  const b2bFormSchema = useWatch({ control: form.control, name: "b2bFormSchema" })

  // 정복 대상 리스트 선택 여부 감지 (선택 시 지역/액션 조건이 무시되고 goal이 리스트 크기로 대체된다)
  const conquerTargetPlaceList = useWatch({ control: form.control, name: "conquerTargetPlaceList" })
  const isConquerTargetPlaceListSelected = !!conquerTargetPlaceList?.value
  const { data: conquerTargetPlaceLists } = useConquerTargetPlaceLists()
  const conquerTargetPlaceListOptions: Option[] = [
    { label: "(지정 안 함)", value: "" },
    ...(conquerTargetPlaceLists ?? []).map((list) => ({ label: list.name, value: list.id })),
  ]
  const selectedConquerTargetPlaceList = conquerTargetPlaceLists?.find(
    (list) => list.id === conquerTargetPlaceList?.value,
  )
  
  // 초기화 상태 추적용 ref
  const isInitialized = useRef(false)

  // V2: B2B 폼 스키마 초기화 (b2bFormSchema가 설정되는 최초 한 번만)
  useEffect(() => {
    if (b2bFormSchema?.availableFields && !isInitialized.current) {
      isInitialized.current = true
      // Convert DTO fields to FormField[] (handles V1/V2 backward compatibility)
      const fields = b2bFormSchema.availableFields.map(dtoToField)
      setFormFields(fields)
    }
  }, [b2bFormSchema])

  /**
   * V2: Toggle built-in field on/off
   */
  const handleToggleBuiltinField = (fieldName: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO) => {
    const existingField = formFields.find(f => f.type === 'builtin' && f.builtinName === fieldName)
    
    if (existingField) {
      // Remove field
      const newFields = formFields.filter(f => f.id !== existingField.id)
      setFormFields(newFields)
      syncFormFieldsToSchema(newFields)
    } else {
      // Add field
      const newField: FormField = {
        id: generateId(),
        type: 'builtin',
        builtinName: fieldName,
        customDisplayName: undefined,
        options: null,
        optionsText: '',
        isRequired: true,
      }
      const newFields = [...formFields, newField]
      setFormFields(newFields)
      syncFormFieldsToSchema(newFields)
    }
  }

  /**
   * V2: Update field properties
   */
  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    const newFields = formFields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * V2: Update options text and parse into options array
   */
  const handleUpdateOptionsText = (fieldId: string, optionsText: string) => {
    const parsedOptions = parseOptions(optionsText)
    const options = parsedOptions.length > 0 ? parsedOptions : null
    
    const newFields = formFields.map(field =>
      field.id === fieldId
        ? { ...field, optionsText, options }
        : field
    )
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * V2: Add custom question
   */
  const handleAddCustomField = () => {
    const existingCustomCount = formFields.filter(f => f.type === 'custom').length
    const newKey = `customField${existingCustomCount + 1}`
    
    const newField: FormField = {
      id: generateId(),
      type: 'custom',
      customKey: newKey,
      customDisplayName: '',
      options: null,
      optionsText: '',
      isRequired: true,
    }
    
    const newFields = [...formFields, newField]
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * V2: Remove field (custom only)
   */
  const handleRemoveField = (fieldId: string) => {
    const newFields = formFields.filter(f => f.id !== fieldId)
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * V2: Toggle options for a field
   */
  const handleToggleOptions = (fieldId: string, enabled: boolean) => {
    const newFields = formFields.map(field =>
      field.id === fieldId
        ? { ...field, options: enabled ? [] : null, optionsText: enabled ? field.optionsText : '' }
        : field
    )
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * V2: Toggle required for a field
   */
  const handleToggleRequired = (fieldId: string, isRequired: boolean) => {
    const newFields = formFields.map(field =>
      field.id === fieldId ? { ...field, isRequired } : field
    )
    setFormFields(newFields)
    syncFormFieldsToSchema(newFields)
  }

  /**
   * Sync FormField[] state to react-hook-form b2bFormSchema
   */
  const syncFormFieldsToSchema = (fields: FormField[]) => {
    if (!isB2B) return
    
    const schema: AdminChallengeB2bFormSchemaDTO = {
      availableFields: fields.map(fieldToDTO),
    }
    form.setValue("b2bFormSchema", schema)
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
  
  const [lastMonthRankImageUrl, setLastMonthRankImageUrl] = useState("")
  const [showLastMonthRankImage, setShowLastMonthRankImage] = useState(false)
  const formLastMonthRankImageUrl = form.watch("lastMonthRankImageUrl")
  
  const [modalImageUrl, setModalImageUrl] = useState("")
  const [showModalImage, setShowModalImage] = useState(false)
  const formModalImageUrl = form.watch("modalImageUrl")
  useEffect(() => {
    if (formImageUrl && formImageUrl !== "") {
      setImageUrl(formImageUrl)
      setShowImage(true)
    } else {
      setImageUrl("")
      setShowImage(false)
    }
  }, [formImageUrl])

  useEffect(() => {
    if (formLastMonthRankImageUrl && formLastMonthRankImageUrl !== "") {
      setLastMonthRankImageUrl(formLastMonthRankImageUrl)
      setShowLastMonthRankImage(true)
    } else {
      setLastMonthRankImageUrl("")
      setShowLastMonthRankImage(false)
    }
  }, [formLastMonthRankImageUrl])

  useEffect(() => {
    if (formModalImageUrl && formModalImageUrl !== "") {
      setModalImageUrl(formModalImageUrl)
      setShowModalImage(true)
    } else {
      setModalImageUrl("")
      setShowModalImage(false)
    }
  }, [formModalImageUrl])

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

  const handleLastMonthRankImageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
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
        setLastMonthRankImageUrl(uploadedImageUrl)
        form.setValue("lastMonthRankImageUrl", uploadedImageUrl)
      })
    }
  }

  const handleModalImageChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      const uploadedImageUrl = await uploadImage({
        file: selectedFile,
        purposeType: "CRUSHER_LABEL",
      })
      setModalImageUrl(uploadedImageUrl)
      form.setValue("modalImageUrl", uploadedImageUrl)
    }
  }

  const handleDeleteImage = () => {
    setImageUrl("")
    setShowImage(false)
    form.setValue("imageUrl", "")
    form.setValue("imageWidth", undefined)
    form.setValue("imageHeight", undefined)
  }

  const handleDeleteLastMonthRankImage = () => {
    setLastMonthRankImageUrl("")
    setShowLastMonthRankImage(false)
    form.setValue("lastMonthRankImageUrl", null)
  }

  const handleDeleteModalImage = () => {
    setModalImageUrl("")
    setShowModalImage(false)
    form.setValue("modalImageUrl", null)
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
            name="joinStartDate"
            label="참여 시작"
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
            placeholderText="비워두면 챌린지 시작일과 동일"
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
        <div className={css({ marginBottom: "16px" })}>
          <label className={css({ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" })}>
            <input
              type="checkbox"
              {...form.register("isRetroactiveContributionEnabled")}
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
            <span className={css({ fontSize: "14px", fontWeight: "500" })}>기여 소급적용 활성화</span>
          </label>
          <div className={css({ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginLeft: "26px" })}>
            예: 1월 1일 시작 챌린지에 1월 15일 참여 시, 1월 1~14일 기여분도 인정
          </div>
        </div>
        <Combobox
          name="conquerTargetPlaceList"
          label="정복 대상 리스트"
          isDisabled={isEditableFieldDisabled}
          isClearable={false}
          options={conquerTargetPlaceListOptions}
        />
        {isConquerTargetPlaceListSelected && (
          <div
            className={css({
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "-8px",
              marginBottom: "16px",
              padding: "8px 12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
            })}
          >
            이 챌린지의 대상 장소는 「{conquerTargetPlaceList?.label}」 으로 정해집니다. 목표는 리스트의 장소 수(
            {selectedConquerTargetPlaceList?.placeCount ?? "?"}개)로 서버가 자동 설정하며, 지역/액션 조건은 무시됩니다.
          </div>
        )}
        <Autocomplete
          // ponytail: RHF Controller(v7.55)는 rules를 mount 시점에 딱 한 번만 register()하고
          // 이후 rules prop이 바뀌어도 재등록하지 않는다(useController 소스 확인 — mount effect의
          // deps에 rules가 없음). isConquerTargetPlaceListSelected 토글 때마다 실제로 재검증 규칙이
          // 걸리게 하려면 key로 강제 리마운트해야 한다. required도 undefined가 아니라 explicit false로
          // 줘야 한다 — register()의 필드 병합이 얕은 merge라 이전 required 값이 남아있을 수 있다.
          key={isConquerTargetPlaceListSelected ? "milestones-ctpl" : "milestones-normal"}
          isMulti
          name="milestones"
          label={isConquerTargetPlaceListSelected ? "마일스톤 (목표는 리스트 크기로 자동 설정)" : "마일스톤"}
          placeholder={
            isConquerTargetPlaceListSelected
              ? "목표를 제외한 중간 마일스톤을 입력합니다."
              : "가장 큰 숫자가 목표로 지정됩니다."
          }
          isDisabled={isEditableFieldDisabled}
          rules={
            isConquerTargetPlaceListSelected
              ? { required: false }
              : { required: { value: true, message: "마일스톤을 1개 이상 입력해주세요." } }
          }
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
          isDisabled={isEditableFieldDisabled || isConquerTargetPlaceListSelected}
          filterOption={(option, inputValue) => option.label.includes(inputValue)}
          options={emdOptions}
        />
        <Combobox
          key={isConquerTargetPlaceListSelected ? "questActions-ctpl" : "questActions-normal"}
          isMulti
          name="questActions"
          label="퀘스트 대상 액션"
          placeholder="이 행동을 하면 퀘스트로 인정됩니다."
          closeMenuOnSelect={false}
          isDisabled={isEditableFieldDisabled || isConquerTargetPlaceListSelected}
          rules={
            isConquerTargetPlaceListSelected
              ? { required: false }
              : { required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }
          }
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
          
          {/* V2: B2B 폼 스키마 설정 */}
          {isB2B && (
            <B2bFormSchemaPanel
              formFields={formFields}
              availableFieldOptions={availableFieldOptions}
              onToggleBuiltinField={handleToggleBuiltinField}
              onUpdateField={handleUpdateField}
              onUpdateOptionsText={handleUpdateOptionsText}
              onToggleOptions={handleToggleOptions}
              onToggleRequired={handleToggleRequired}
              onAddCustomField={handleAddCustomField}
              onRemoveField={handleRemoveField}
              disabled={isEditableFieldDisabled}
            />
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
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={isEditableFieldDisabled}
                className={css({
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  _hover: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                  _disabled: {
                    cursor: "not-allowed",
                    opacity: 0.5,
                  },
                })}
              >
                ×
              </button>
            </div>
          )}
        </Flex>
        <Flex direction={showLastMonthRankImage ? "row" : "column"}>
          <div className={css({ width: showLastMonthRankImage ? "50%" : "100%" })}>
            <FileInput
              label="지난 달 랭킹 이미지"
              accept="image/*"
              onChange={handleLastMonthRankImageChange}
              disabled={isEditableFieldDisabled}
            />
          </div>
          {showLastMonthRankImage && (
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
                src={lastMonthRankImageUrl}
                width={200}
                height={200}
                className={css({
                  maxWidth: "200px",
                  maxHeight: "200px",
                  border: "1px solid #000000",
                  objectFit: "contain",
                })}
              />
              <button
                type="button"
                onClick={handleDeleteLastMonthRankImage}
                disabled={isEditableFieldDisabled}
                className={css({
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  _hover: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                  _disabled: {
                    cursor: "not-allowed",
                    opacity: 0.5,
                  },
                })}
              >
                ×
              </button>
            </div>
          )}
        </Flex>
        <Flex direction={showModalImage ? "row" : "column"}>
          <div className={css({ width: showModalImage ? "50%" : "100%" })}>
            <FileInput
              label="모달 이미지"
              accept="image/*"
              onChange={handleModalImageChange}
              disabled={isEditableFieldDisabled}
            />
          </div>
          {showModalImage && (
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
                src={modalImageUrl}
                width={200}
                height={200}
                className={css({
                  maxWidth: "200px",
                  maxHeight: "200px",
                  border: "1px solid #000000",
                  objectFit: "contain",
                })}
              />
              <button
                type="button"
                onClick={handleDeleteModalImage}
                disabled={isEditableFieldDisabled}
                className={css({
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  _hover: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                  _disabled: {
                    cursor: "not-allowed",
                    opacity: 0.5,
                  },
                })}
              >
                ×
              </button>
            </div>
          )}
        </Flex>
      </form>
    </FormProvider>
  )
}
