import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { cn } from '@/utils/ui';
import { forwardRef } from 'react';

export interface EditableTextareaProps extends TextareaProps {
  editing: boolean;
  setEditing: (editing: boolean) => void;
}

const EditableTextarea = forwardRef<HTMLTextAreaElement, EditableTextareaProps>(
  (
    { editing, className, setEditing, onDoubleClick, readOnly, ...props },
    ref
  ) => {
    return (
      <Textarea
        readOnly={!editing || readOnly}
        className={cn(editing ? '' : 'border-0', className)}
        ref={ref}
        onDoubleClick={(e) => {
          if (!editing) {
            setEditing(true);
          }
          onDoubleClick?.(e);
        }}
        {...props}
      />
    );
  }
);

EditableTextarea.displayName = 'EditableTextarea';

export default EditableTextarea;
