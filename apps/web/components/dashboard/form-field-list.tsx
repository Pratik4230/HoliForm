"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { computeFractionalIndex } from "~/lib/form-field-index";
import type { EditorField } from "~/hooks/api/form";

const FIELD_TYPE_LABELS: Record<EditorField["type"], string> = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  number: "Number",
  phone: "Phone",
  date: "Date",
  checkbox: "Checkbox",
  radio: "Multiple choice",
  select: "Dropdown",
  multiselect: "Multi-select",
};

function SortableFieldRow({
  field,
  position,
  showSectionLabels,
  editControl,
  onDelete,
}: {
  field: EditorField;
  position: number;
  showSectionLabels: boolean;
  editControl: ReactNode;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-background/60 p-4 shadow-sm ${
        isDragging ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none rounded-md p-1 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{field.label}</p>
        <p className="text-muted-foreground text-xs">
          {FIELD_TYPE_LABELS[field.type]} ·{" "}
          <span className="font-mono">{field.labelKey}</span>
          {field.isRequired ? " · required" : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant="outline">#{position}</Badge>
        {showSectionLabels ? (
          <Badge variant="secondary" className="text-xs">
            Section {field.pageIndex + 1}
          </Badge>
        ) : null}
      </div>
      <div className="flex gap-1">
        {editControl}
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function FormFieldList({
  fields,
  showSectionLabels,
  isReordering,
  renderEditControl,
  onDeleteField,
  onReorder,
}: {
  fields: EditorField[];
  showSectionLabels: boolean;
  isReordering: boolean;
  renderEditControl: (field: EditorField) => ReactNode;
  onDeleteField: (fieldId: string) => void;
  onReorder: (fieldId: string, index: string) => void;
}) {
  const sorted = [...fields].sort((a, b) => Number(a.index) - Number(b.index));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isReordering) {
      return;
    }

    const oldIndex = sorted.findIndex((f) => f.id === active.id);
    const newIndex = sorted.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const moved = reordered[newIndex];
    if (!moved) {
      return;
    }

    const prev = reordered[newIndex - 1];
    const next = reordered[newIndex + 1];
    onReorder(moved.id, computeFractionalIndex(prev?.index, next?.index));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sorted.map((field, i) => (
            <SortableFieldRow
              key={field.id}
              field={field}
              position={i + 1}
              showSectionLabels={showSectionLabels}
              editControl={renderEditControl(field)}
              onDelete={() => onDeleteField(field.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
