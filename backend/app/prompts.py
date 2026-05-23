
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