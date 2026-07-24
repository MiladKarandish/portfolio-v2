import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to the *container* — anything outside it closes the
 * state. Attaching it to a child of the thing you want to keep open makes every
 * click on the rest of that thing count as "outside".
 */
const useClickOutside = <T extends HTMLElement = HTMLDivElement>(
  defaultState: boolean = false
): [RefObject<T | null>, boolean, Dispatch<SetStateAction<boolean>>] => {
  const [state, setState] = useState<boolean>(defaultState);
  const ref = useRef<T>(null);

  const handleClickOutside = useCallback(
    (e: PointerEvent) => {
      if (state && ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setState(false);
      }
    },
    [state]
  );

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setState(false);
  }, []);

  useEffect(() => {
    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  return [ref, state, setState];
};

export default useClickOutside;
