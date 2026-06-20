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
    lineHeight: Optional[float] = None
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
    rows: List[List[str]]
    font: Optional[str] = None
    fontSize: Optional[float] = None
    lineHeight: Optional[float] = None
    color: Optional[str] = None
    align: Optional[Literal["left", "center", "right"]] = "center"
    borderColor: Optional[str] = None
    borderWidth: Optional[float] = None
    cellBackgroundColor: Optional[str] = None


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

class OutlineSection(BaseModel):
    id: str
    title: str
    content: str


class OutlineResponse(BaseModel):
    title: str = Field(min_length=1,max_length=30)
    sections: List[OutlineSection] = Field(min_length=1,max_length=50)


class PptRequest(BaseModel):
    prompt:str
    title: str
    layout: Literal["16x9", "4x3"]
    theme: str 
    sections: List[OutlineSection]
    pageCount: int


class ProjectCreateRequest(BaseModel):
    presentation_data: dict


class UserProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    generation_quota: int
    is_unlimited_quota: bool = False
