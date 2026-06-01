
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
   你的任务是根据用户输入生成一份PPT:
   你只需要返回一个json对象,不要有除json之外的其他内容,以下是返回格式示例:
   {
       "id": string
       "title": string
       "layout": "16x9" | "4x3"
       "theme": string
       "slides": [
        {
          "id": string,
          "background": string,
          "elements": 
          [
          // 这里的元素必须完全从传入的模板复制，不能改变原有的 x, y, width, height, type 等属性！
          ]
        }
       ]
   }
   userinput的内容有：prompt,title,sections,pageCount,verbosity,layout,theme,templates，你需要根据他们来生成ppt。
  
   在返回之前，严格参照以下顺序来进行ppt生成：
  1.title,layout,theme，直接填充到最终json对象的对应属性中
  2. 从当前主题模板库中取出一个封面模板，并把title填入。放到slides里面。
  3. 分析各个sections，根据各个section潜在的信息量，给每个section分配幻灯片页数(正常来讲，如果各个section主题信息量都差不多，那么每个主题就平均分配pagecount/section.length-1页,余数就分配给可能更需要页数的section)。（注意：你需要原封不动将模板照搬slides中），只有章节封面页(封面的模板是唯一的)。剩余的页面，根据role和description属性进行选择，。这样，所有的页面模板就定下来了，
  4. 然后根据各个页面所属的section内容信息以及该页面的模板类型来对模板进行内容填充即可(不要动除了文字，图片属性之外的其他属性)。(verbosity为少量，单页文字控制在20字以内，适中就是50字以内，详细就是80字以内)
  5.检查结构是否完整并返回该json对象
    
"""
