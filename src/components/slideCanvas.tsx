import type { Slide } from "@/types/presentation"

const mockSlide: Slide = {
  id: "slide-01",
  background: "#faf9f6", // ivory background
  elements: [
    {
      id: "elem-sidebar",
      type: "block",
      shapeType: "rect",
      x: 0,
      y: 0,
      width: 32,
      height: 100,
      backgroundColor: "#f0eee6", // slightly darker ivory for contrast
      borderColor: "transparent",
      borderWidth: 0,
    },
    {
      id: "elem-accent-line",
      type: "block",
      shapeType: "rect",
      x: 8,
      y: 15,
      width: 4,
      height: 0.8,
      backgroundColor: "#c85a47", // terracotta accent
      borderColor: "transparent",
      borderWidth: 0,
    },
    {
      id: "elem-chapter",
      type: "text",
      content: "CHAPTER 01",
      x: 8,
      y: 18,
      width: 20,
      height: 5,
      fontSize: 14,
      color: "#c85a47",
      bold: true,
      align: "left",
    },
    {
      id: "elem-sidebar-desc",
      type: "text",
      content: "Exploring the fundamentals of warm editorial aesthetics and how they elevate digital presentations to feel like premium printed magazines.",
      x: 8,
      y: 26,
      width: 16,
      height: 30,
      fontSize: 15,
      color: "#7a776c",
      align: "left",
    },
    {
      id: "elem-title",
      type: "text",
      content: "The Art of Simplicity",
      x: 38,
      y: 14,
      width: 55,
      height: 15,
      fontSize: 40,
      color: "#2c2a25",
      bold: true,
      align: "left",
      font: "Georgia, serif", // Using a serif font for editorial feel
    },
    {
      id: "elem-subtitle",
      type: "text",
      content: "Crafting meaningful digital experiences through minimalist design.",
      x: 38,
      y: 31,
      width: 55,
      height: 10,
      fontSize: 22,
      color: "#5c5a52",
      align: "left",
    },
    {
      id: "elem-image",
      type: "image",
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
      alt: "Elegant office architecture",
      x: 38,
      y: 45,
      width: 55,
      height: 45,
    }
  ]
};

const SlideCanvas = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative" style={{backgroundColor:mockSlide.background}}>
        {mockSlide.elements.map((element)=>(
            element.type==='block'?
            <div key={element.id} className="absolute" style={{top:`${element.y}%`,left:`${element.x}%`,backgroundColor:element.backgroundColor,width: `${element.width}%`, height: `${element.height}%`,border: `${element.borderWidth}px solid ${element.borderColor}`,borderRadius: element.shapeType === 'circle' ? '50%' : (element.shapeType === 'roundRect' ? '12px' : '0')}}>
            </div>:
            element.type==='image'?
              <img key={element.id} src={element.src} alt={element.alt||""} className="absolute" style={{top:`${element.y}%`,left:`${element.x}%`,width: `${element.width}%`, height: `${element.height}%`, objectFit:"cover"}}/>
              :
            element.type==='table'?
            <div key={element.id} style={{top:`${element.y}%`,left:`${element.x}%`,width: `${element.width}%`, height: `${element.height}%`}}>
              i am a table
            </div>:
            element.type==='text'?
            <div key={element.id} className="absolute" style={{fontSize:element.fontSize,top:`${element.y}%`,left:`${element.x}%`,color:element.color,width: `${element.width}%`, height: `${element.height}%`,textAlign:element.align,fontFamily: element.font,fontWeight: element.bold?"bold":"normal"}}>
                {element.content}
            </div>: 
            <div key={element.id}>
                other
            </div>
        ))}
        
    </div>
  )
}

export default SlideCanvas