import { Obj, Content, ContentList } from ".";

// little test
var user = new Obj(true, 10);
var content = new Content(true, 10);
var content2 = new Content(true, 10);
var contentlist = new ContentList();
contentlist.content_getter = [content, content2];
var recommendations = contentlist.recommend(user, 1.5, 0, Infinity);
console.log(recommendations);
console.log(recommendations[0].content.definition as any);
console.log(recommendations[0].user.definition as any);
console.log(recommendations[0].level as any);