import type { Slide } from "@/types/presentation"
import type { SlideCanvasProps } from "@/types/editor"

const SlideCanvas = ({slide,setSelectedId,selectedId}:SlideCanvasProps) => {
  const handleClick = (e: React.MouseEvent,id:string) => {
      e.stopPropagation();
      if (setSelectedId) setSelectedId(id);
  };
  return (
    <div 
      className="w-full h-full flex items-center justify-center relative" 
      style={{backgroundColor:slide.background, containerType: 'inline-size'}}
      onClick={() => setSelectedId && setSelectedId(null)} // 点击空白处取消选中
    >
        {slide.elements.map((element) => {
            // 判断当前元素是否被选中
            const isSelected = selectedId === element.id;
            // 如果选中了，加上蓝色高亮框和微微浮起的阴影
            const selectedClass = isSelected ? "ring-[2px] ring-blue-500 shadow-xl z-10" : "z-0 hover:ring-[1px] hover:ring-blue-300/50 cursor-pointer";
            return element.type==='block'?
            <div onClick={(e)=>handleClick(e,element.id)} key={element.id} className={`absolute ${selectedClass} transition-all duration-200`} style={{top:`${element.y}%`,left:`${element.x}%`,backgroundColor:element.backgroundColor,width: `${element.width}%`, height: `${element.height}%`,border: `${element.borderWidth || 0}px solid ${element.borderColor || 'transparent'}`,borderRadius: element.shapeType === 'circle' ? '50%' : (element.shapeType === 'roundRect' ? '12px' : '0')}}>
            </div>:
            element.type==='image'?
              <img onClick={(e)=>handleClick(e,element.id)} key={element.id} src={element.src} alt={element.alt||""} className={`absolute ${selectedClass} transition-all duration-200`} style={{top:`${element.y}%`,left:`${element.x}%`,width: `${element.width}%`, height: `${element.height}%`, objectFit:"cover"}}/>
              :
            element.type==='table'?
            <div onClick={(e)=>handleClick(e,element.id)} key={element.id} className={`absolute ${selectedClass} transition-all duration-200`} style={{top:`${element.y}%`,left:`${element.x}%`,width: `${element.width}%`, height: `${element.height}%`}}>
              i am a table
            </div>:
            element.type==='text'?
            <div onClick={(e)=>handleClick(e,element.id)} key={element.id} className={`absolute ${selectedClass} transition-all duration-200`} style={{fontSize: `${(element.fontSize / 960) * 100}cqi`, top:`${element.y}%`,left:`${element.x}%`,color:element.color,width: `${element.width}%`, height: `${element.height}%`,textAlign:element.align,fontFamily: element.font,fontWeight: element.bold?"bold":"normal"}}>
                {element.content}
            </div>: 
            <div onClick={(e)=>handleClick(e,element.id)} key={element.id} className={`absolute ${selectedClass}`}>
                other
            </div>
        })}
    </div>
  )
}

export default SlideCanvas