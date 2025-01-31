/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

const useClickOutside = (
  defaultState: boolean = false
): [MutableRefObject<any>, boolean, Dispatch<SetStateAction<boolean>>] => {
  // State & Ref
  const [state, setState] = useState<boolean>(defaultState);
  const ref = useRef<any>();

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      console.log(e.currentTarget);
      if (state && ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setState(false);
      }
    },
    [ref, state]
  );

  useEffect(() => {
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return [ref, state, setState];
};

export default useClickOutside;
