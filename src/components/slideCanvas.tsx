import type { SlideCanvasProps } from "@/types/editor"
import { usePresentationStore } from "@/stores/presentationStore"
import ContentEditableModule from "react-contenteditable"
const ContentEditable = (ContentEditableModule as any).default || ContentEditableModule;

const SlideCanvas = ({ slide, setSelectedId, selectedId }: SlideCanvasProps) => {
  const updateElement = usePresentationStore(state => state.updateElement);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (setSelectedId) setSelectedId(id);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ backgroundColor: slide.background, containerType: 'inline-size' }}
      onClick={() => setSelectedId?.(null)}
    >
      {slide.elements.map((element) => {
        const isSelected = selectedId === element.id;
        const isBlock = element.type === 'block';
        const selectedClass = isSelected
          ? `outline outline-2 outline-blue-500 ${isBlock ? '' : 'shadow-xl z-10'}`
          : "hover:outline hover:outline-1 hover:outline-blue-300/50 cursor-pointer";//当为block时，z-10会导致其覆盖表面的元素

        if (element.type === 'block') {
          return (
            <div
              key={element.id}
              onClick={(e) => handleClick(e, element.id)}
              className={`absolute ${selectedClass} transition-all duration-200`}
              style={{
                top: `${element.y}%`, left: `${element.x}%`,
                width: `${element.width}%`, height: `${element.height}%`,
                backgroundColor: element.backgroundColor,
                border: `${element.borderWidth || 0}px solid ${element.borderColor || 'transparent'}`,
                borderRadius: element.shapeType === 'circle' ? '50%' : (element.shapeType === 'roundRect' ? '12px' : '0'),
              }}
            />
          );
        }

        if (element.type === 'image') {
          return (
            <img
              key={element.id}
              onClick={(e) => handleClick(e, element.id)}
              src={element.src}
              alt={element.alt || ""}
              className={`absolute ${selectedClass} transition-all duration-200`}
              style={{
                top: `${element.y}%`, left: `${element.x}%`,
                width: `${element.width}%`, height: `${element.height}%`,
                objectFit: "cover",
              }}
            />
          );
        }

        if (element.type === 'table') {
          return (
            <div
              key={element.id}
              onClick={(e) => handleClick(e, element.id)}
              className={`absolute ${selectedClass} transition-all duration-200`}
              style={{
                top: `${element.y}%`, left: `${element.x}%`,
                width: `${element.width}%`, height: `${element.height}%`,
              }}
            >
              i am a table
            </div>
          );
        }

        if (element.type === 'text') {
          return (
            <div
              key={element.id}
              onClick={(e) => handleClick(e, element.id)}
              className={`absolute ${selectedClass} transition-all duration-200`}
              style={{
                top: `${element.y}%`, left: `${element.x}%`,
                width: `${element.width}%`, height: `${element.height}%`,
                fontSize: `${(element.fontSize / 960) * 100}cqi`,
                color: element.color,
                textAlign: element.align,
                fontFamily: element.font,
                fontWeight: element.bold ? "bold" : "normal",
              }}
            >
              <ContentEditable
                html={element.content}
                disabled={!isSelected}
                onChange={(e) => updateElement(slide.id, element.id, { content: e.target.value })}
                style={{
                  width: '100%',
                  height: '100%',
                  outline: 'none',
                  font: 'inherit',
                  color: 'inherit',
                  textAlign: 'inherit',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  cursor: isSelected ? 'text' : 'pointer',
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={element.id}
            onClick={(e) => handleClick(e, element.id)}
            className={`absolute ${selectedClass}`}
          >
            other
          </div>
        );
      })}
    </div>
  );
};

export default SlideCanvas