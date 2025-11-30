
import { useState, useEffect, useRef } from 'react';

/**
 * Hook to manage linear navigation using a Gamepad.
 * 
 * @param itemIds Array of HTML IDs corresponding to the focusable elements.
 * @param isEnabled Whether the navigation logic is active.
 * @returns The index of the currently focused item.
 */
export const useGamepadNav = (
  itemIds: string[],
  isEnabled: boolean = true
) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Refs to track state without causing re-renders inside the loop
  const lastInputTimeRef = useRef(0);
  const buttonPressedRef = useRef(false);
  const focusedIndexRef = useRef(0); // Sync ref to handle updates inside loop

  // Sync ref with state
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    if (!isEnabled) return;

    let animationFrameId: number;
    const INPUT_DELAY = 180; // ms between moves (debounce)

    const loop = () => {
      const gamepads = navigator.getGamepads();
      // Use the first active gamepad found
      const gp = Array.from(gamepads).find(g => g !== null);

      if (gp) {
        const now = Date.now();
        
        // --- NAVIGATION (Sticks / D-Pad) ---
        if (now - lastInputTimeRef.current > INPUT_DELAY) {
          let direction = 0;

          // Standard mapping: Axis 0 (Left Stick X), Axis 1 (Left Stick Y)
          // D-Pad usually maps to axis 9/button 12-15 depending on browser/OS, 
          // but often Buttons 12(Up), 13(Down), 14(Left), 15(Right).
          
          const y = gp.axes[1] || 0;
          const x = gp.axes[0] || 0;
          const isDown = y > 0.5 || gp.buttons[13]?.pressed;
          const isUp = y < -0.5 || gp.buttons[12]?.pressed;
          const isRight = x > 0.5 || gp.buttons[15]?.pressed;
          const isLeft = x < -0.5 || gp.buttons[14]?.pressed;

          if (isDown || isRight) direction = 1;
          if (isUp || isLeft) direction = -1;

          if (direction !== 0) {
            const nextIndex = focusedIndexRef.current + direction;
            
            // Loop navigation
            let newIndex = nextIndex;
            if (newIndex >= itemIds.length) newIndex = 0;
            if (newIndex < 0) newIndex = itemIds.length - 1;

            setFocusedIndex(newIndex);
            lastInputTimeRef.current = now;
            
            // Optional: smooth scroll into view
            const el = document.getElementById(itemIds[newIndex]);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }

        // --- ACTION (Button A / Cross) ---
        // Standard mapping: Button 0 is usually 'A' or 'Cross'
        if (gp.buttons[0]?.pressed) {
          if (!buttonPressedRef.current) {
            buttonPressedRef.current = true;
            const element = document.getElementById(itemIds[focusedIndexRef.current]);
            if (element) {
                // Add a visual press effect class if needed, or just click
                element.click();
            }
          }
        } else {
          buttonPressedRef.current = false;
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled, itemIds]);

  return focusedIndex;
};
