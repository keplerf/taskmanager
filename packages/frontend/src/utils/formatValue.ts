/**
 * Formats a value for display, handling various data types including
 * primitives, objects with common property names, and arrays.
 */
export function formatValueForDisplay(value: unknown): string {
  if (value === null || value === undefined) return '';

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    // Check for common property names in order of priority
    if ('label' in value) return String((value as { label: unknown }).label);
    if ('value' in value) return String((value as { value: unknown }).value);
    if ('name' in value) return String((value as { name: unknown }).name);
    if ('text' in value) return String((value as { text: unknown }).text);
    if ('date' in value) return String((value as { date: unknown }).date);

    // Handle arrays (e.g., tags)
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          if (typeof v === 'string' || typeof v === 'number') return v;
          if (typeof v === 'object' && v !== null) {
            if ('label' in v) return (v as { label: unknown }).label;
            if ('value' in v) return (v as { value: unknown }).value;
            if ('name' in v) return (v as { name: unknown }).name;
            if ('text' in v) return (v as { text: unknown }).text;
          }
          return v;
        })
        .join(', ');
    }

    // Last resort: JSON stringify
    return JSON.stringify(value);
  }

  return '';
}

interface ItemValue {
  columnId: string;
  value: unknown;
}

/**
 * Gets and formats a column value from an item's values array.
 */
export function getColumnValue(
  values: ItemValue[],
  columnId: string
): string {
  const value = values.find((v) => v.columnId === columnId);
  if (!value) return '';
  return formatValueForDisplay(value.value);
}
