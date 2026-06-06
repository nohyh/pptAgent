
outlinePrompt = """
   你的任务是根据用户输入生成一份PPT大纲:
   你只需要返回一个json对象,不要有除json之外的其他内容：
   {
       "title": "",
       "sections":[{
           "title":"",
           "content":""
       },{
           "title":"",
           "content":""
       }]
   }
   title :字符串,根据用户输入生成的PPT的标题
   sections :一个对象数组，根据用户的输入,生成3个以上的章节概要,title是该章节的简单概括，而content是较为详细描述这个章节的大概内容，
   每个章节的概要内容应该在200字以内
"""

pptPrompt = """
  userPrompt:{
      "prompt": "用户输入的内容",
      "title": "用户输入的标题",
      "sections": "PPT大纲章节",
      "pageCount": "目标幻灯片页数",
      "templates": "用户输入的模板"
  }
  templates:一个包含多个ppt模板的数组，每个模板包含可填充元素的id、type、description、recommendlength以及待填写的content/src/height。其中content/src/height是你需要填充的属性，而recommendlength是用来限制填充长度/数值的参考属性
   你的任务是根据userPrompt，通过复用这些template，来组织好所有的幻灯片
   你只需要返回一个json对象,不要有除json之外的其他内容,以下是返回格式示例:
   {
       "slides": [
        {
          "role": string,
          "description": string,
          "elements": [
            {"id": string, "type": "text", "description": string, "recommendlength": string, "content": string},
            {"id": string, "type": "image", "description": string, "recommendlength": string, "src": string},
            {"id": string, "type": "block", "description": string, "recommendlength": string, "height": number}
          ]
        }
        ........
       ]
   }
  
   在返回之前，严格参照以下顺序来进行ppt生成：
  1. 分析sections，根据每个section的主题和内容，从templates中选择合适的页面模板，并尽量让返回的slides数量接近pageCount。（注意：你需要原封不动将精简模板照搬到slides中，只填充content/src/height。slide不要返回id；元素id必须使用模板中已有的id，不能编造。）
  2. 根据各个页面所属的section内容信息以及每个元素的description和recommendlength对elements进行内容填充。对text元素，如果暴露content字段，content填写最终展示文字，并严格按照recommendlength进行字数的限制；对image元素，如果暴露src字段，src填写图片URL；如果没有合适图片，请填写空字符串。对图表或树状图等元素，如果暴露height字段，height填写数字。
  3. 自我检查，结构是否和返回实例一致，slides长度是否接近pageCount，以及所有幻灯片的内容是否已经填充完成，以及是否有除了内容之外的冗余改正。再次强调：除了content/src/height三个属性，其他元素的任何属性都禁止更改，保持原样。
"""
