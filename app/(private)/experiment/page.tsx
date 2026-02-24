"use client"

import { format } from "date-fns"
import { Search } from "lucide-react"
import { useState } from "react"

import { AdminExperimentAssignmentDto } from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Contents } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

import {
  useExperimentAssignments,
  useExperimentDefinitions,
  useUpdateExperimentAssignment,
} from "./query"

export default function ExperimentPage() {
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [searchUserId, setSearchUserId] = useState("")
  const { data, isLoading } = useExperimentAssignments(searchUserId)
  const { data: experimentDefinitions } = useExperimentDefinitions()
  const updateMutation = useUpdateExperimentAssignment()

  const assignments: AdminExperimentAssignmentDto[] = data?.items ?? []

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchUserId(userId.trim())
  }

  const handleVariantChange = async (
    assignment: AdminExperimentAssignmentDto,
    newVariant: string,
  ) => {
    try {
      await updateMutation.mutateAsync({ id: assignment.id, variant: newVariant })
      toast({
        title: "변경 완료",
        description: `${assignment.experiment}의 variant가 ${newVariant}로 변경되었습니다.`,
      })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "variant 변경 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "변경 실패",
        description: errorMessage,
      })
    }
  }

  return (
    <Contents.Normal>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>실험 배정 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch}>
            <div className="flex items-end gap-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="검색할 유저 ID를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <Button type="submit" className="gap-2" disabled={!userId.trim()}>
                <Search className="h-4 w-4" />
                검색
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchUserId && (
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <p className="text-muted-foreground">로딩 중...</p>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground">해당 유저의 실험 배정이 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>실험명</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Stratum</TableHead>
                    <TableHead>생성일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.experiment}</TableCell>
                      <TableCell>
                        {(() => {
                          const experimentDef = experimentDefinitions?.items?.find(
                            (def) => def.name === assignment.experiment,
                          )
                          const variants = experimentDef?.variants ?? []
                          return (
                            <Select
                              value={assignment.variant}
                              onValueChange={(value) => handleVariantChange(assignment, value)}
                              disabled={updateMutation.isPending}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {variants.map((v) => (
                                  <SelectItem key={v.name} value={v.name}>
                                    {v.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {assignment.stratum}
                        </code>
                      </TableCell>
                      <TableCell>
                        {format(new Date(assignment.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </Contents.Normal>
  )
}
