"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  cellSize = 48,
  autoRippleInterval = 5000,
}: {
  cellSize?: number;
  autoRippleInterval?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [dimensions, setDimensions] = useState({ rows: 30, cols: 60 });
  const ref = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions based on window size
  useEffect(() => {
    const calculateDimensions = () => {
      // Use screen dimensions to ensure coverage even when zoomed out
      const width = Math.max(window.innerWidth, window.screen.width, 2560);
      const height = Math.max(window.innerHeight, window.screen.height, 1440);
      
      // Add extra cells to ensure full coverage
      const cols = Math.ceil(width / cellSize) + 10;
      const rows = Math.ceil(height / cellSize) + 10;
      
      setDimensions({ rows, cols });
    };

    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);
    
    return () => window.removeEventListener("resize", calculateDimensions);
  }, [cellSize]);

  // Auto-trigger random ripples at slow intervals
  useEffect(() => {
    const triggerRandomRipple = () => {
      const randomRow = Math.floor(Math.random() * dimensions.rows);
      const randomCol = Math.floor(Math.random() * dimensions.cols);
      setClickedCell({ row: randomRow, col: randomCol });
      setRippleKey((k) => k + 1);
    };

    // Initial delay before first auto-ripple (2-4 seconds)
    const initialDelay = setTimeout(() => {
      triggerRandomRipple();
    }, 2000 + Math.random() * 2000);

    // Set up interval with some randomness (interval ± 2 seconds)
    const interval = setInterval(() => {
      triggerRandomRipple();
    }, autoRippleInterval + (Math.random() - 0.5) * 4000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [dimensions.rows, dimensions.cols, autoRippleInterval]);

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 overflow-hidden z-0",
        "[--cell-border-color:rgba(111,133,81,0.2)] [--cell-fill-color:rgba(183,207,154,0.06)]",
        "dark:[--cell-border-color:rgba(61,74,50,0.25)] dark:[--cell-fill-color:rgba(111,133,81,0.05)]",
      )}
      style={{
        width: "100vw",
        height: "100vh",
        minWidth: "100%",
        minHeight: "100%",
      }}
    >
      <div 
        className="absolute overflow-visible"
        style={{
          // Center the grid and make it overflow in all directions
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <DivGrid
          key={`base-${rippleKey}`}
          rows={dimensions.rows}
          cols={dimensions.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ["--delay"]?: string;
  ["--duration"]?: string;
};

const DivGrid = ({
  className,
  rows = 30,
  cols = 60,
  cellSize = 48,
  borderColor = "rgba(111,133,81,0.2)",
  fillColor = "rgba(183,207,154,0.06)",
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
  };

  return (
    <div className={cn("relative", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 50) : 0;
        const duration = 200 + distance * 70;

        const style: CellStyle = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              "cell relative border-[0.5px] transition-all duration-150 will-change-transform",
              "hover:bg-[rgba(183,207,154,0.15)] hover:border-[rgba(111,133,81,0.35)]",
              clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default BackgroundRippleEffect;
