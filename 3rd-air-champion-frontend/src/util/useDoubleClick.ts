import { useRef } from "react";

export const useDoubleClick = <T>(
  onClick: (value: T) => void,
  onDoubleClick: (value: T) => void,
  delay = 300
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preventClickRef = useRef(false);

  return (value: T) => {
    if (timeoutRef.current) {
      // Double click detected
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      preventClickRef.current = true;
      onDoubleClick(value);
    } else {
      preventClickRef.current = false;

      timeoutRef.current = setTimeout(() => {
        if (!preventClickRef.current) {
          onClick(value);
        }
        timeoutRef.current = null;
      }, delay);
    }
  };
};
