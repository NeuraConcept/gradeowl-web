"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Rubric, RubricCriterion } from "@/lib/api/types";

interface RubricEditorProps {
  rubric: Rubric;
  onChange: (
    questionNumber: number,
    criteria: RubricCriterion[],
    maxMarks: number
  ) => void;
}

export function RubricEditor({ rubric, onChange }: RubricEditorProps) {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    rubric.criteria_json
  );
  const [maxMarks, setMaxMarks] = useState(rubric.max_marks);

  // Sync parent when internal state changes (skip initial mount)
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    onChange(rubric.question_number, criteria, maxMarks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria, maxMarks]);

  const totalMarks = criteria.reduce((sum, c) => sum + (c.marks || 0), 0);
  const marksMatch = totalMarks === maxMarks;

  const updateCriterion = (
    index: number,
    field: keyof RubricCriterion,
    value: string | number
  ) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { description: "", marks: 0 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {rubric.question_number}
          </CardTitle>
          <div className="flex items-center gap-2">
            {rubric.teacher_approved ? (
              <Badge className="bg-green-100 text-success">Approved</Badge>
            ) : (
              <Badge variant="outline">Pending</Badge>
            )}
            {marksMatch ? (
              <Badge className="bg-green-100 text-success">
                {totalMarks}/{maxMarks} marks
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-600">
                {totalMarks}/{maxMarks} marks
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Max marks input */}
        <div className="flex items-center gap-3">
          <Label htmlFor={`max-marks-${rubric.question_number}`} className="shrink-0 text-sm">
            Max Marks
          </Label>
          <Input
            id={`max-marks-${rubric.question_number}`}
            type="number"
            min={0}
            value={maxMarks}
            onChange={(e) => setMaxMarks(parseInt(e.target.value, 10) || 0)}
            className="w-24"
          />
        </div>

        {/* Criteria list */}
        <div className="space-y-2">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                placeholder="Criterion description"
                value={criterion.description}
                onChange={(e) =>
                  updateCriterion(index, "description", e.target.value)
                }
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                value={criterion.marks}
                onChange={(e) =>
                  updateCriterion(
                    index,
                    "marks",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-20 shrink-0"
                placeholder="Marks"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeCriterion(index)}
                className="shrink-0 text-muted-foreground hover:text-red-600"
                aria-label="Remove criterion"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add criterion */}
        <Button variant="outline" size="sm" onClick={addCriterion} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Criterion
        </Button>

        {/* Marks mismatch alert */}
        {!marksMatch && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Criteria marks ({totalMarks}) do not equal max marks ({maxMarks}).
          </div>
        )}
      </CardContent>
    </Card>
  );
}
