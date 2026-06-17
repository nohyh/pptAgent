import { useRef, useState, useEffect, useCallback } from "react"
import { Rnd } from "react-rnd"
import type { DraggableData, RndDragEvent, RndResizeCallback } from "react-rnd"
import type { SlideCanvasProps } from "@/types/editor"
import { usePresentationStore } from "@/stores/presentationStore"
import {
  getCssFontFamily,
  getCssFontSize,
  getLineHeight,
  htmlToPlainText,
  plainTextToHtml,
} from "@/lib/presentationLayout"
import ContentEditableModule from "react-contenteditable"
import type { ContentEditableEvent, Props as ContentEditableProps } from "react-contenteditable"

const ContentEditable = (
  typeof ContentEditableModule === "function"
    ? ContentEditableModule
    : (ContentEditableModule as unknown as { default: React.ComponentType<ContentEditableProps> }).default
) as React.ComponentType<ContentEditableProps>

const SlideCanvas = ({ slide, layout = "16x9", setSelectedId, selectedId }: SlideCanvasProps) => {
  const updateElement = usePresentationStore(state => state.updateElement);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const [interactingId, setInteractingId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const toPercent = useCallback((px: number, axis: 'x' | 'y') => {
    const base = axis === 'x' ? containerSize.width : containerSize.height;
    return Math.round((px / base) * 1000) / 10;
  }, [containerSize]);

  const toPx = (pct: number, axis: 'x' | 'y') => {
    const base = axis === 'x' ? containerSize.width : containerSize.height;
    return (pct / 100) * base;
  };

  const resizeHandleStyles = {
    bottomRight: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#3b82f6', border: '2px solid white', right: -5, bottom: -5 },
    bottomLeft: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#3b82f6', border: '2px solid white', left: -5, bottom: -5 },
    topRight: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#3b82f6', border: '2px solid white', right: -5, top: -5 },
    topLeft: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#3b82f6', border: '2px solid white', left: -5, top: -5 },
    top: { height: 6, backgroundColor: 'transparent' },
    bottom: { height: 6, backgroundColor: 'transparent' },
    left: { width: 6, backgroundColor: 'transparent' },
    right: { width: 6, backgroundColor: 'transparent' },
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ backgroundColor: slide.background, containerType: 'inline-size' }}
      onClick={() => setSelectedId?.(null)}
    >
      {slide.elements.map((element, idx) => {
        const isSelected = selectedId === element.id;
        const isInteracting = interactingId === element.id;

        const pxX = toPx(element.x, 'x');
        const pxY = toPx(element.y, 'y');
        const pxW = toPx(element.width, 'x');
        const pxH = toPx(element.height, 'y');

        const selectedClass = isSelected
          ? `outline outline-2 outline-blue-500 ${element.type === 'block' ? '' : 'shadow-xl'}`
          : "hover:outline hover:outline-1 hover:outline-blue-300/50";

        const rndProps = {
          position: { x: pxX, y: pxY },
          size: { width: pxW, height: pxH },
          bounds: "parent" as const,
          enableResizing: isSelected,
          disableDragging: isSelected && element.type === 'text',
          resizeHandleStyles,
          onDragStart: () => setInteractingId(element.id),
          onDragStop: (_e: RndDragEvent, d: DraggableData) => {
            setInteractingId(null);
            updateElement(slide.id, element.id, {
              x: toPercent(d.x, 'x'),
              y: toPercent(d.y, 'y'),
            });
          },
          onResizeStart: () => setInteractingId(element.id),
          onResizeStop: ((_e, _dir, ref, _delta, pos) => {
            setInteractingId(null);
            updateElement(slide.id, element.id, {
              x: toPercent(pos.x, 'x'),
              y: toPercent(pos.y, 'y'),
              width: toPercent(parseFloat(ref.style.width), 'x'),
              height: toPercent(parseFloat(ref.style.height), 'y'),
            });
          }) satisfies RndResizeCallback,
          onClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedId?.(element.id); },
          className: `${selectedClass} ${isInteracting ? '' : 'transition-all duration-200'}`,
          style: { zIndex: idx, cursor: isSelected && element.type === 'text' ? 'text' : undefined },
        };

        if (element.type === 'block') {
          return (
            <Rnd key={element.id} {...rndProps}>
              <div style={{
                width: '100%', height: '100%',
                backgroundColor: element.backgroundColor,
                border: `${element.borderWidth || 0}px solid ${element.borderColor || 'transparent'}`,
                borderRadius: element.shapeType === 'circle' ? '50%' : element.shapeType === 'roundRect' ? '12px' : '0',
              }} />
            </Rnd>
          );
        }

        if (element.type === 'image') {
          return (
            <Rnd key={element.id} {...rndProps}>
              <img
                src={element.src}
                alt={element.alt || ""}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Rnd>
          );
        }

        if (element.type === 'table') {
          const borderColor = element.borderColor || '#b8b8b0';
          return (
            <Rnd key={element.id} {...rndProps}>
              <table
                style={{
                  width: '100%',
                  height: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  fontSize: getCssFontSize(element.fontSize || 8, layout),
                  color: element.color || '#111111',
                  fontFamily: getCssFontFamily(element.font),
                  lineHeight: getLineHeight(element.lineHeight),
                  textAlign: element.align || 'center',
                  backgroundColor: element.cellBackgroundColor || 'transparent',
                }}
              >
                <tbody>
                  {element.rows.map((row, rowIndex) => (
                    <tr key={`${element.id}-row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${element.id}-cell-${rowIndex}-${cellIndex}`}
                          style={{
                            borderTop: `${element.borderWidth || 1}px solid ${borderColor}`,
                            borderBottom: `${element.borderWidth || 1}px solid ${borderColor}`,
                            padding: '0.08em 0.12em',
                            fontWeight: 'normal',
                            backgroundColor: element.cellBackgroundColor || 'transparent',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Rnd>
          );
        }

        if (element.type === 'text') {
          return (
            <Rnd key={element.id} {...rndProps}>
              <div style={{
                width: '100%', height: '100%',
                fontSize: getCssFontSize(element.fontSize, layout),
                color: element.color,
                textAlign: element.align,
                fontFamily: getCssFontFamily(element.font),
                fontWeight: element.bold ? 'bold' : 'normal',
                lineHeight: getLineHeight(element.lineHeight),
              }}>
                <ContentEditable
                  html={plainTextToHtml(element.content)}
                  disabled={!isSelected}
                  onChange={(e: ContentEditableEvent) => updateElement(slide.id, element.id, { content: htmlToPlainText(e.target.value) })}
                  style={{
                    width: '100%', height: '100%',
                    outline: 'none', font: 'inherit', color: 'inherit',
                    textAlign: 'inherit', wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  }}
                />
              </div>
            </Rnd>
          );
        }
        return null;
      })}
    </div>
  );
};

export default SlideCanvas
