from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union, Annotated

class BaseElement(BaseModel):
    id: str
    x: float
    y: float
    width: float
    height: float
    type: str

class TextElement(BaseElement):
    type: Literal["text"]
    content: str
    font: Optional[str] = None
    fontSize: float
    color: Optional[str] = None
    bold: Optional[bool] = False
    align: Optional[Literal["left", "center", "right"]] = "left"

class ImageElement(BaseElement):
    type: Literal["image"]
    src: str
    alt: Optional[str] = None

class BlockElement(BaseElement):
    type: Literal["block"]
    shapeType: Literal["rect", "circle", "roundRect"]
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    borderWidth: Optional[float] = None

class TableElement(BaseElement):
    type: Literal["table"]
    markdown: str


SlideElement = Annotated[
    Union[TextElement, ImageElement, BlockElement, TableElement],
    Field(discriminator="type")
]


class Slide(BaseModel):
    id: str
    background: Optional[str] = None
    elements: List[SlideElement]

# 5. 整个 PPT 数据
class Presentation(BaseModel):
    id: str
    title: str
    layout: Literal["16x9", "4x3"]
    theme: str
    slides: List[Slide]

class OutlineResponse(BaseModel):
    title: str = Field(min_length=1,max_length=20)
    sections: List[str] = Field(min_length=1,max_length=50)


class PptRequest(BaseModel):
    prompt:str
    title: str
    layout: Literal["16x9", "4x3"]
    theme: str 
    sections: List[str]
    pageCount: int
    verbosity: int

class PptResponse(BaseModel):
    presentation: Presentation
    
